import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Motor de actualización del radar de SECOP — es la versión en JavaScript del
// script de Google Apps Script que ya usabas, con dos diferencias a propósito:
//
// 1. Las consultas a SECOP se lanzan TODAS al tiempo (en vez de una por una)
//    para que la actualización completa quepa dentro del límite de tiempo
//    que da Vercel por cada solicitud (10 segundos en el plan gratuito).
// 2. Si una consulta puntual falla (por ejemplo por saturación momentánea de
//    la API de SECOP), esa consulta simplemente no aporta resultados ese día
//    — no se cae toda la actualización por una sola falla.
//
// La lógica de fondo (qué se busca y cómo) es la misma: códigos UNSPSC sobre
// la categoría del proceso, y palabras clave partidas en palabras sueltas
// (sin conectores) usando el buscador de texto indexado de SECOP.

const SECOP_ENDPOINT = 'https://www.datos.gov.co/resource/p6dx-8zbt.json';

// Conectores sin significado propio: si una palabra clave es una frase
// ("desarrollo de software"), estas palabras se descartan y no se buscan por
// separado, porque encontrarían "de" o "y" en casi cualquier proceso.
const CONECTORES = [
  'DE', 'DEL', 'LA', 'LAS', 'EL', 'LOS', 'Y', 'O', 'U', 'EN', 'CON',
  'PARA', 'POR', 'UN', 'UNA', 'UNOS', 'UNAS', 'AL', 'A', 'SU', 'SUS',
  'QUE', 'SE', 'SIN', 'SOBRE', 'ENTRE',
];

// Parte cada frase de palabra clave en palabras sueltas, quita tildes y
// símbolos, descarta conectores y palabras muy cortas, y devuelve cada
// palabra una sola vez aunque se repita en varios términos guardados.
function extraerPalabrasUnicas(palabras) {
  const unicas = {};
  palabras.forEach((frase) => {
    frase.split(/\s+/).forEach((palabra) => {
      const limpia = palabra
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\p{L}\p{N}]/gu, '')
        .toUpperCase();
      if (!limpia || limpia.length < 3) return;
      if (CONECTORES.includes(limpia)) return;
      unicas[limpia] = true;
    });
  });
  return Object.keys(unicas);
}

// Devuelve una condición SoQL por cada código UNSPSC (sobre la categoría
// principal y las adicionales). Coincide si cualquiera de ellas aparece.
function construirCondicionesUnspsc(unspsc) {
  const partes = [];
  unspsc.forEach((codigoCrudo) => {
    const codigo = codigoCrudo.replace(/'/g, "''");
    partes.push(`codigo_principal_de_categoria like '%${codigo}%'`);
    partes.push(`categorias_adicionales like '%${codigo}%'`);
  });
  return partes;
}

// Agrupa las condiciones en lotes que no pasen de maxCaracteres, para que
// cada consulta quede dentro de un largo de URL seguro.
function agruparCondiciones(condiciones, maxCaracteres) {
  const lotes = [];
  let actual = [];
  let longitudActual = 0;
  condiciones.forEach((cond) => {
    const longitudCond = cond.length + 4; // +4 por " OR "
    if (actual.length > 0 && longitudActual + longitudCond > maxCaracteres) {
      lotes.push(actual);
      actual = [];
      longitudActual = 0;
    }
    actual.push(cond);
    longitudActual += longitudCond;
  });
  if (actual.length > 0) lotes.push(actual);
  return lotes;
}

// Hace una sola consulta a la API de SECOP. Si falla, no lanza el error hacia
// arriba — devuelve una lista vacía para que el resto de la actualización
// pueda seguir.
async function consultarSecop(where, textoLibre) {
  let query =
    `${SECOP_ENDPOINT}?$limit=500&$order=fecha_de_publicacion_del DESC` +
    `&$where=${encodeURIComponent(where)}`;
  if (textoLibre) {
    query += `&$q=${encodeURIComponent(textoLibre)}`;
  }
  try {
    const respuesta = await fetch(query);
    if (!respuesta.ok) {
      console.error(`SECOP respondió ${respuesta.status} para: ${textoLibre || where}`);
      return [];
    }
    return await respuesta.json();
  } catch (error) {
    console.error('Error de red consultando SECOP:', error);
    return [];
  }
}

// El campo "estado_del_procedimiento" de SECOP no es confiable por sí solo:
// muchos procesos viejos (algunos ya adjudicados hace años) se quedan
// marcados como "Abierto" y nunca se corrigen en los datos abiertos. Además,
// se comprobó que cuando la consulta combina "$where" con el buscador de
// texto ("$q", usado para las palabras clave), SECOP a veces IGNORA la
// condición de estado y devuelve procesos en cualquier estado. Por eso el
// filtro de vigencia no se deja solo en manos del "$where" que se manda a
// SECOP — se vuelve a comprobar aquí mismo, sobre cada proceso que llega,
// antes de guardarlo.
const DIAS_RECIENCIA = 180;

function calcularFechaLimiteTexto() {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - DIAS_RECIENCIA);
  return fechaLimite.toISOString().slice(0, 10);
}

function condicionBaseVigente(fechaLimiteTexto) {
  return (
    `estado_del_procedimiento = 'Abierto' AND adjudicado = 'No' ` +
    `AND fecha_de_publicacion_del >= '${fechaLimiteTexto}'`
  );
}

// Comprobación definitiva de que un proceso sigue vigente — no depende de
// que SECOP haya aplicado bien el filtro que se le mandó.
function esVigente(p, fechaLimiteTexto) {
  if (p.estado_del_procedimiento !== 'Abierto') return false;
  if (p.adjudicado !== 'No') return false;
  const fechaPublicacion = p.fecha_de_publicacion_del ? p.fecha_de_publicacion_del.slice(0, 10) : null;
  if (!fechaPublicacion || fechaPublicacion < fechaLimiteTexto) return false;
  return true;
}

async function ejecutarActualizacion() {
  const { rows: terminos } = await sql`SELECT tipo, valor FROM radar_terminos`;
  const unspsc = terminos.filter((t) => t.tipo === 'unspsc').map((t) => t.valor);
  const palabras = terminos.filter((t) => t.tipo === 'palabra_clave').map((t) => t.valor);

  if (unspsc.length === 0 && palabras.length === 0) {
    return {
      ok: true,
      total: 0,
      mensaje: 'No hay códigos UNSPSC ni palabras clave configurados todavía.',
    };
  }

  const fechaLimiteTexto = calcularFechaLimiteTexto();
  const condicionVigente = condicionBaseVigente(fechaLimiteTexto);
  const consultasPendientes = [];

  if (unspsc.length > 0) {
    const condiciones = construirCondicionesUnspsc(unspsc);
    const lotes = agruparCondiciones(condiciones, 600);
    lotes.forEach((lote) => {
      const where = `(${lote.join(' OR ')}) AND ${condicionVigente}`;
      consultasPendientes.push(consultarSecop(where, null));
    });
  }

  const palabrasUnicas = extraerPalabrasUnicas(palabras);
  palabrasUnicas.forEach((palabra) => {
    consultasPendientes.push(consultarSecop(condicionVigente, palabra));
  });

  // Todas las consultas salen al tiempo, no una detrás de otra.
  const tandas = await Promise.all(consultasPendientes);

  // Se descartan duplicados usando el link del proceso como llave, igual que
  // en el script original, y se vuelve a comprobar la vigencia de cada
  // proceso uno por uno (ver esVigente más arriba) en vez de confiar en que
  // SECOP haya aplicado bien el filtro que se le mandó.
  const procesosPorLlave = {};
  tandas.forEach((procesos) => {
    procesos.forEach((p) => {
      if (!esVigente(p, fechaLimiteTexto)) return;
      const llave = p.urlproceso || JSON.stringify(p);
      procesosPorLlave[llave] = p;
    });
  });
  const listaFinal = Object.values(procesosPorLlave);

  await sql`DELETE FROM radar_resultados`;

  if (listaFinal.length > 0) {
    const columnas = [
      'url_proceso', 'entidad', 'departamento', 'ciudad', 'objeto',
      'modalidad', 'categoria_unspsc', 'valor_base', 'estado', 'fecha_publicacion',
    ];
    const marcadores = [];
    const parametros = [];
    listaFinal.forEach((p, i) => {
      const base = i * columnas.length;
      marcadores.push(`(${columnas.map((_, j) => `$${base + j + 1}`).join(', ')})`);
      const valorBase = p.precio_base ? Number(p.precio_base) : null;
      parametros.push(
        p.urlproceso || null,
        p.entidad || null,
        p.departamento_entidad || null,
        p.ciudad_entidad || null,
        p.nombre_del_procedimiento || p['descripci_n_del_procedimiento'] || null,
        p.modalidad_de_contratacion || null,
        p.codigo_principal_de_categoria || null,
        Number.isFinite(valorBase) ? valorBase : null,
        p.estado_del_procedimiento || null,
        p.fecha_de_publicacion_del ? p.fecha_de_publicacion_del.substring(0, 10) : null
      );
    });

    await sql.query(
      `INSERT INTO radar_resultados (${columnas.join(', ')}) VALUES ${marcadores.join(', ')}`,
      parametros
    );
  }

  return { ok: true, total: listaFinal.length };
}

// GET — así lo llama el disparador diario configurado en vercel.json
export async function GET() {
  try {
    const resultado = await ejecutarActualizacion();
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error actualizando el radar:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el radar.' }, { status: 500 });
  }
}

// POST — así lo llama el botón "Actualizar ahora" dentro de LicitUp
export async function POST() {
  try {
    const resultado = await ejecutarActualizacion();
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error actualizando el radar:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el radar.' }, { status: 500 });
  }
}
