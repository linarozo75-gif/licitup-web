// API interna de LicitUp: recibe códigos UNSPSC y palabras clave desde el
// navegador, consulta la API pública de SECOP II (datos.gov.co) por el
// servidor (no desde el navegador, para evitar cualquier problema de
// permisos entre sitios) y devuelve los procesos ABIERTOS que coincidan.
//
// Esta es la misma lógica que validamos primero en Google Apps Script:
// - Códigos UNSPSC: se buscan con "LIKE" sobre el campo de categoría,
//   agrupados en lotes para no pasar límites de longitud de consulta.
// - Palabras clave: se parten en palabras sueltas, se descartan
//   conectores (de, la, y...) y se buscan con el buscador de texto
//   indexado de la API ($q), mucho más rápido que comparar texto directo.

const SECOP_ENDPOINT = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

const CONECTORES = new Set([
  "DE", "DEL", "LA", "LAS", "EL", "LOS", "Y", "O", "U", "EN", "CON",
  "PARA", "POR", "UN", "UNA", "UNOS", "UNAS", "AL", "A", "SU", "SUS",
  "QUE", "SE", "SIN", "SOBRE", "ENTRE",
]);

function limpiarPalabra(palabra) {
  const limpia = palabra
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase();
  if (!limpia || limpia.length < 3) return null;
  if (CONECTORES.has(limpia)) return null;
  return limpia;
}

function extraerPalabrasUnicas(frasesTexto) {
  const unicas = new Set();
  frasesTexto.forEach((frase) => {
    frase.split(/\s+/).forEach((palabra) => {
      const limpia = limpiarPalabra(palabra);
      if (limpia) unicas.add(limpia);
    });
  });
  return Array.from(unicas);
}

function construirCondicionesUnspsc(codigos) {
  const partes = [];
  codigos.forEach((codigoOriginal) => {
    const c = codigoOriginal.trim().replace(/'/g, "''");
    if (!c) return;
    partes.push(`codigo_principal_de_categoria like '%${c}%'`);
    partes.push(`categorias_adicionales like '%${c}%'`);
  });
  return partes;
}

function agruparCondiciones(condiciones, maxCaracteres) {
  const lotes = [];
  let actual = [];
  let longitudActual = 0;
  condiciones.forEach((cond) => {
    const longitud = cond.length + 4;
    if (actual.length > 0 && longitudActual + longitud > maxCaracteres) {
      lotes.push(actual);
      actual = [];
      longitudActual = 0;
    }
    actual.push(cond);
    longitudActual += longitud;
  });
  if (actual.length > 0) lotes.push(actual);
  return lotes;
}

async function consultarSecop(where, textoLibre) {
  let url =
    SECOP_ENDPOINT +
    "?$limit=500" +
    "&$order=" + encodeURIComponent("fecha_de_publicacion_del DESC") +
    "&$where=" + encodeURIComponent(where);
  if (textoLibre) {
    url += "&$q=" + encodeURIComponent(textoLibre);
  }

  const respuesta = await fetch(url, { headers: { Accept: "application/json" } });
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`SECOP respondió ${respuesta.status}: ${texto.slice(0, 300)}`);
  }
  return respuesta.json();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const unspscRaw = (searchParams.get("unspsc") || "").trim();
  const palabrasRaw = (searchParams.get("palabras") || "").trim();

  const unspsc = unspscRaw ? unspscRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const frasesPalabras = palabrasRaw ? palabrasRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  if (unspsc.length === 0 && frasesPalabras.length === 0) {
    return Response.json(
      { error: "Agrega al menos un código UNSPSC o una palabra clave." },
      { status: 400 }
    );
  }

  try {
    const procesosPorLlave = new Map();

    // 1) Códigos UNSPSC, en lotes.
    if (unspsc.length > 0) {
      const condiciones = construirCondicionesUnspsc(unspsc);
      const lotes = agruparCondiciones(condiciones, 600);
      for (const lote of lotes) {
        const where = `(${lote.join(" OR ")}) AND estado_del_procedimiento = 'Abierto'`;
        const procesos = await consultarSecop(where, null);
        procesos.forEach((p) => {
          const llave = p.urlproceso?.url || p.id_del_proceso || JSON.stringify(p);
          procesosPorLlave.set(llave, p);
        });
      }
    }

    // 2) Palabras clave, una consulta por palabra suelta (vía $q).
    const palabrasUnicas = extraerPalabrasUnicas(frasesPalabras);
    for (const palabra of palabrasUnicas) {
      const procesos = await consultarSecop("estado_del_procedimiento = 'Abierto'", palabra);
      procesos.forEach((p) => {
        const llave = p.urlproceso?.url || p.id_del_proceso || JSON.stringify(p);
        procesosPorLlave.set(llave, p);
      });
    }

    const resultados = Array.from(procesosPorLlave.values()).map((p) => ({
      entidad: p.entidad || "",
      departamento: p.departamento_entidad || "",
      ciudad: p.ciudad_entidad || "",
      objeto: p.nombre_del_procedimiento || p.descripci_n_del_procedimiento || "",
      modalidad: p.modalidad_de_contratacion || "",
      categoriaUnspsc: p.codigo_principal_de_categoria || "",
      valorBase: p.precio_base ? Number(p.precio_base) : null,
      estado: p.estado_del_procedimiento || "",
      fechaPublicacion: p.fecha_de_publicacion_del ? p.fecha_de_publicacion_del.substring(0, 10) : "",
      link: p.urlproceso?.url || "",
    }));

    resultados.sort((a, b) => (b.fechaPublicacion || "").localeCompare(a.fechaPublicacion || ""));

    return Response.json({ total: resultados.length, resultados });
  } catch (error) {
    return Response.json({ error: String(error.message || error) }, { status: 502 });
  }
}
