'use client';

import { useEffect, useState } from 'react';

const TIPOS_CLIENTE = [
  { value: '', label: 'Selecciona...' },
  { value: 'publica', label: 'Pública' },
  { value: 'privada', label: 'Privada' },
];

const ESTADOS_CONTRATO = [
  { value: '', label: 'Selecciona...' },
  { value: 'en_ejecucion', label: 'En ejecución' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'liquidado', label: 'Liquidado' },
];

const CONTRATO_VACIO = {
  id: null,
  numero_consecutivo_rup: '',
  cliente_entidad: '',
  tipo_cliente: '',
  numero_referencia_contrato: '',
  objeto_exacto: '',
  actividades_alcance: '',
  valor_inicial: '',
  adiciones: '',
  valor_final: '',
  valor_smmlv: '',
  fecha_inicio: '',
  fecha_terminacion: '',
  estado_contrato: '',
  unspsc_codigos: '',
  ejecutado_ut_consorcio: null,
  porcentaje_participacion: '',
  valor_final_ponderado: '',
  cantidades_ejecutadas: '',
  persona_certifica: '',
  certificacion_firmada: null,
  etiquetas_tematicas: '',
};

// Columnas que espera el importador, EN ESTE ORDEN — misma plantilla que se descarga.
const COLUMNAS_IMPORTACION = [
  { header: 'Nº consecutivo en el RUP', key: 'numero_consecutivo_rup', tipo: 'texto' },
  { header: 'Cliente / entidad contratante', key: 'cliente_entidad', tipo: 'texto' },
  { header: 'Tipo de cliente (Publica o Privada)', key: 'tipo_cliente', tipo: 'tipo_cliente' },
  { header: 'Nº o referencia del contrato', key: 'numero_referencia_contrato', tipo: 'texto' },
  { header: 'Objeto exacto', key: 'objeto_exacto', tipo: 'texto' },
  { header: 'Actividades realizadas y alcance', key: 'actividades_alcance', tipo: 'texto' },
  { header: 'Valor inicial COP (sin puntos ni comas)', key: 'valor_inicial', tipo: 'numero' },
  { header: 'Adiciones COP (sin puntos ni comas)', key: 'adiciones', tipo: 'numero' },
  { header: 'Valor final COP (sin puntos ni comas)', key: 'valor_final', tipo: 'numero' },
  { header: 'Valor en SMMLV', key: 'valor_smmlv', tipo: 'numero' },
  { header: 'Fecha de inicio (aaaa-mm-dd)', key: 'fecha_inicio', tipo: 'fecha' },
  { header: 'Fecha de terminación (aaaa-mm-dd)', key: 'fecha_terminacion', tipo: 'fecha' },
  { header: 'Estado (En ejecucion, Terminado o Liquidado)', key: 'estado_contrato', tipo: 'estado_contrato' },
  { header: 'Códigos UNSPSC (separados por ;)', key: 'unspsc_codigos', tipo: 'texto' },
  { header: '¿Ejecutado en UT o Consorcio? (Si/No)', key: 'ejecutado_ut_consorcio', tipo: 'sino' },
  { header: '% de participación', key: 'porcentaje_participacion', tipo: 'numero' },
  { header: 'Valor final ponderado COP', key: 'valor_final_ponderado', tipo: 'numero' },
  { header: 'Cantidades ejecutadas', key: 'cantidades_ejecutadas', tipo: 'texto' },
  { header: 'Persona que certifica', key: 'persona_certifica', tipo: 'texto' },
  { header: '¿Certificación firmada? (Si/No)', key: 'certificacion_firmada', tipo: 'sino' },
  { header: 'Etiquetas temáticas', key: 'etiquetas_tematicas', tipo: 'texto' },
];

const FILA_EJEMPLO = [
  '12', 'Ministerio Ejemplo de Tecnologías', 'Publica', 'CO-045-2022',
  'Prestar servicios de desarrollo, soporte y mantenimiento del sistema de información misional',
  'Desarrollo de 6 módulos, 2 integraciones por API, soporte nivel 2', '850000000', '120000000',
  '970000000', '680.4', '2022-02-01', '2023-06-30', 'Liquidado', '81111500;81112000', 'No', '', '',
  '120 usuarios; 6 módulos', 'Ana Ruiz - Jefe de TI - 3100000000', 'Si', 'software;integracion',
];

function normalizar(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function convertirValor(valorCrudo, tipo) {
  const valor = String(valorCrudo ?? '').trim();
  if (valor === '') return null;
  switch (tipo) {
    case 'numero': {
      const limpio = valor.replace(/[^\d.-]/g, '');
      const n = Number(limpio);
      return Number.isNaN(n) ? null : n;
    }
    case 'fecha': {
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(valor)) {
        const [a, m, d] = valor.split('-');
        return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      const m1 = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
      return null;
    }
    case 'sino': {
      const n = normalizar(valor);
      if (n === 'si' || n === 'sí') return true;
      if (n === 'no') return false;
      return null;
    }
    case 'tipo_cliente': {
      const n = normalizar(valor);
      if (n === 'publica') return 'publica';
      if (n === 'privada') return 'privada';
      return null;
    }
    case 'estado_contrato': {
      const n = normalizar(valor).replace(/\s+/g, '_');
      if (['en_ejecucion', 'terminado', 'liquidado'].includes(n)) return n;
      return null;
    }
    default:
      return valor;
  }
}

// Parser de CSV que respeta comillas (campos con comas o saltos de línea adentro)
function parsearCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = '';
  let dentroComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroComillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') { dentroComillas = false; }
      else { campo += c; }
    } else if (c === '"') {
      dentroComillas = true;
    } else if (c === ',') {
      fila.push(campo); campo = '';
    } else if (c === '\r') {
      // se ignora, lo maneja el \n
    } else if (c === '\n') {
      fila.push(campo); filas.push(fila); fila = []; campo = '';
    } else {
      campo += c;
    }
  }
  if (campo !== '' || fila.length > 0) { fila.push(campo); filas.push(fila); }
  return filas.filter((f) => f.some((v) => v.trim() !== ''));
}

// Carga la librería para leer archivos de Excel directamente en el navegador (solo si hace falta)
function cargarLectorExcel() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('No se pudo cargar el lector de Excel. Revisa tu conexión e intenta de nuevo.'));
    document.body.appendChild(script);
  });
}

async function leerFilasDelArchivo(archivo) {
  const nombre = archivo.name.toLowerCase();
  if (nombre.endsWith('.csv')) {
    const texto = await archivo.text();
    return parsearCSV(texto);
  }
  if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
    const XLSX = await cargarLectorExcel();
    const buffer = await archivo.arrayBuffer();
    const libro = XLSX.read(buffer, { type: 'array', cellDates: true });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    const filasCrudas = XLSX.utils.sheet_to_json(hoja, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
    return filasCrudas
      .map((fila) => fila.map((v) => (v === undefined || v === null ? '' : String(v))))
      .filter((f) => f.some((v) => v.trim() !== ''));
  }
  throw new Error('Formato no reconocido. Sube un archivo .csv, .xlsx o .xls.');
}

function descargarPlantillaCSV() {
  const encabezados = COLUMNAS_IMPORTACION.map((c) => c.header);
  const filas = [encabezados, FILA_EJEMPLO];
  const csv = filas
    .map((fila) => fila.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_experiencia_licitup.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function descargarPlantillaExcel() {
  const XLSX = await cargarLectorExcel();
  const encabezados = COLUMNAS_IMPORTACION.map((c) => c.header);
  const datos = [encabezados, FILA_EJEMPLO];
  const hoja = XLSX.utils.aoa_to_sheet(datos);
  hoja['!cols'] = encabezados.map(() => ({ wch: 26 }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Experiencia');
  XLSX.writeFile(libro, 'plantilla_experiencia_licitup.xlsx');
}

function PreguntaSiNo({ texto, valor, onChange }) {
  return (
    <div style={estilos.filaPregunta}>
      <span style={estilos.textoPregunta}>{texto}</span>
      <div style={estilos.opcionesSiNo}>
        <label style={estilos.opcionSiNo}>
          <input type="radio" checked={valor === true} onChange={() => onChange(true)} /> Sí
        </label>
        <label style={estilos.opcionSiNo}>
          <input type="radio" checked={valor === false} onChange={() => onChange(false)} /> No
        </label>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <label style={estilos.campo}>
      <span style={estilos.etiqueta}>{label}</span>
      {children}
    </label>
  );
}

export default function ExperienciaPage() {
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [draft, setDraft] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [importando, setImportando] = useState(false);
  const [preparandoPlantilla, setPreparandoPlantilla] = useState(false);

  function cargar() {
    setCargando(true);
    fetch('/api/mi-empresa/experiencia')
      .then((r) => r.json())
      .then((data) => setContratos(data.experiencia ?? []))
      .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo cargar la lista de contratos.' }))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setDraft({ ...CONTRATO_VACIO });
    setMensaje(null);
  }

  function abrirEditar(fila) {
    const copia = { ...fila };
    for (const campoFecha of ['fecha_inicio', 'fecha_terminacion']) {
      if (copia[campoFecha]) copia[campoFecha] = String(copia[campoFecha]).slice(0, 10);
    }
    setDraft(copia);
    setMensaje(null);
  }

  function cancelar() {
    setDraft(null);
  }

  function actualizarDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarContrato(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa/experiencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setDraft(null);
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar el contrato. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarContrato(id) {
    if (!confirm('¿Eliminar este contrato de tu experiencia?')) return;
    try {
      const res = await fetch(`/api/mi-empresa/experiencia?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  async function manejarArchivoImportado(e) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // para poder volver a elegir el mismo archivo después si hace falta
    if (!archivo) return;

    setImportando(true);
    setMensaje(null);
    try {
      const filas = await leerFilasDelArchivo(archivo);
      const filasDeDatos = filas.slice(1); // la primera fila son los encabezados

      let exitosas = 0;
      const filasConError = [];

      for (let i = 0; i < filasDeDatos.length; i++) {
        const fila = filasDeDatos[i];
        const payload = {};
        COLUMNAS_IMPORTACION.forEach((col, idx) => {
          payload[col.key] = convertirValor(fila[idx], col.tipo);
        });

        try {
          const res = await fetch('/api/mi-empresa/experiencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('row_failed');
          exitosas++;
        } catch {
          filasConError.push(i + 2); // +2: fila 1 es encabezado, y las filas de Excel empiezan en 1
        }
      }

      cargar();
      if (filasConError.length === 0) {
        setMensaje({ tipo: 'ok', texto: `Se importaron ${exitosas} contrato(s) correctamente.` });
      } else {
        setMensaje({
          tipo: 'error',
          texto: `Se importaron ${exitosas} contrato(s). Hubo un problema en la(s) fila(s): ${filasConError.join(', ')}.`,
        });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error?.message || 'No se pudo leer el archivo. Verifica que sea un CSV o Excel válido.' });
    } finally {
      setImportando(false);
    }
  }

  return (
    <main style={estilos.pagina}>
      <nav style={estilos.tabs}>
        <a href="/mi-empresa" style={estilos.tab}>Mi Empresa</a>
        <a href="/mi-empresa/experiencia" style={{ ...estilos.tab, ...estilos.tabActiva }}>Experiencia</a>
        <a href="/mi-empresa/talento" style={estilos.tab}>Talento</a>
        <a href="/mi-empresa/financiero" style={estilos.tab}>Financiero</a>
      </nav>

      <h1 style={estilos.titulo}>Experiencia</h1>
      <p style={estilos.subtitulo}>
        Un registro por cada contrato que quieras usar como experiencia certificable. Copia el objeto tal
        como aparece en la certificación — la comparación con cada pliego se hace sobre el texto exacto.
        Esta sección es completamente opcional: puedes dejarla vacía, agregar solo algunos contratos, o
        completarla después. No hace falta adjuntar ningún documento — solo indicas si tienes la certificación firmada.
      </p>

      <section style={estilos.seccion}>
        <h2 style={estilos.tituloSeccion}>Cargar varios contratos a la vez</h2>
        <p style={estilos.ayuda}>
          Si tienes muchos contratos, es más rápido descargar la plantilla, llenarla y subirla de una sola vez,
          en vez de agregarlos uno por uno. Puedes subir el archivo de Excel (.xlsx) tal cual, sin necesidad de
          guardarlo como CSV — ambos formatos funcionan.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={estilos.botonSecundario}
            disabled={preparandoPlantilla}
            onClick={async () => {
              setPreparandoPlantilla(true);
              setMensaje(null);
              try {
                await descargarPlantillaExcel();
              } catch {
                setMensaje({ tipo: 'error', texto: 'No se pudo preparar la plantilla en Excel. Intenta de nuevo o descárgala en CSV.' });
              } finally {
                setPreparandoPlantilla(false);
              }
            }}
          >
            {preparandoPlantilla ? 'Preparando…' : 'Descargar plantilla (Excel)'}
          </button>
          <button type="button" style={estilos.botonSecundario} onClick={descargarPlantillaCSV}>
            Descargar plantilla (CSV)
          </button>
          <label style={{ ...estilos.boton, display: 'inline-block', cursor: 'pointer' }}>
            {importando ? 'Importando…' : 'Subir Excel o CSV lleno'}
            <input type="file" accept=".csv,.xlsx,.xls" onChange={manejarArchivoImportado} disabled={importando} style={{ display: 'none' }} />
          </label>
        </div>
      </section>

      {mensaje && <p style={mensaje.tipo === 'error' ? estilos.mensajeError : estilos.mensajeOk}>{mensaje.texto}</p>}

      <section style={estilos.seccion}>
        <h2 style={estilos.tituloSeccion}>Contratos guardados</h2>
        {cargando ? (
          <p style={estilos.ayuda}>Cargando…</p>
        ) : contratos.length === 0 && !draft ? (
          <p style={estilos.ayuda}>Todavía no has agregado ningún contrato.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {contratos.map((c) => (
              <div key={c.id} style={estilos.filaTabla}>
                <div>
                  <strong>{c.cliente_entidad || 'Sin cliente'}</strong>
                  {c.numero_referencia_contrato ? ` — ${c.numero_referencia_contrato}` : ''}
                  <div style={estilos.ayuda}>
                    {c.valor_final ? `$${Number(c.valor_final).toLocaleString('es-CO')} COP` : 'Sin valor'}
                    {c.fecha_terminacion ? ` · terminó ${String(c.fecha_terminacion).slice(0, 10)}` : ''}
                    {c.estado_contrato ? ` · ${ESTADOS_CONTRATO.find((e) => e.value === c.estado_contrato)?.label ?? c.estado_contrato}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" style={estilos.botonSecundario} onClick={() => abrirEditar(c)}>Editar</button>
                  <button type="button" style={estilos.botonSecundario} onClick={() => eliminarContrato(c.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draft ? (
          <form onSubmit={guardarContrato} style={estilos.tarjetaFormulario}>
            <h3 style={estilos.tituloSubseccion}>Identificación del contrato</h3>
            <div style={estilos.grid2}>
              <Campo label="Nº consecutivo en el RUP">
                <input style={estilos.input} value={draft.numero_consecutivo_rup ?? ''} onChange={(e) => actualizarDraft('numero_consecutivo_rup', e.target.value)} />
              </Campo>
              <Campo label="Cliente / entidad contratante">
                <input style={estilos.input} value={draft.cliente_entidad ?? ''} onChange={(e) => actualizarDraft('cliente_entidad', e.target.value)} />
              </Campo>
              <Campo label="Tipo de cliente">
                <select style={estilos.input} value={draft.tipo_cliente ?? ''} onChange={(e) => actualizarDraft('tipo_cliente', e.target.value)}>
                  {TIPOS_CLIENTE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
              <Campo label="Nº o referencia del contrato">
                <input style={estilos.input} value={draft.numero_referencia_contrato ?? ''} onChange={(e) => actualizarDraft('numero_referencia_contrato', e.target.value)} />
              </Campo>
            </div>

            <h3 style={estilos.tituloSubseccion}>Objeto y alcance</h3>
            <Campo label="Objeto exacto (copiado tal cual del certificado, sin resumir)">
              <textarea style={{ ...estilos.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={draft.objeto_exacto ?? ''} onChange={(e) => actualizarDraft('objeto_exacto', e.target.value)} />
            </Campo>
            <Campo label="Actividades realizadas y alcance">
              <textarea style={{ ...estilos.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={draft.actividades_alcance ?? ''} onChange={(e) => actualizarDraft('actividades_alcance', e.target.value)} />
            </Campo>

            <h3 style={estilos.tituloSubseccion}>Valores</h3>
            <div style={estilos.grid2}>
              <Campo label="Valor inicial (COP)">
                <input type="number" step="any" style={estilos.input} value={draft.valor_inicial ?? ''} onChange={(e) => actualizarDraft('valor_inicial', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Adiciones (COP) — vacío si no hubo">
                <input type="number" step="any" style={estilos.input} value={draft.adiciones ?? ''} onChange={(e) => actualizarDraft('adiciones', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Valor final (COP)">
                <input type="number" step="any" style={estilos.input} value={draft.valor_final ?? ''} onChange={(e) => actualizarDraft('valor_final', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Valor en SMMLV a la fecha de terminación (si el certificado o el RUP lo indican)">
                <input type="number" step="any" style={estilos.input} value={draft.valor_smmlv ?? ''} onChange={(e) => actualizarDraft('valor_smmlv', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
            </div>

            <h3 style={estilos.tituloSubseccion}>Fechas y estado</h3>
            <div style={estilos.grid2}>
              <Campo label="Fecha de inicio">
                <input type="date" style={estilos.input} value={draft.fecha_inicio ?? ''} onChange={(e) => actualizarDraft('fecha_inicio', e.target.value)} />
              </Campo>
              <Campo label="Fecha de terminación">
                <input type="date" style={estilos.input} value={draft.fecha_terminacion ?? ''} onChange={(e) => actualizarDraft('fecha_terminacion', e.target.value)} />
              </Campo>
              <Campo label="Estado del contrato">
                <select style={estilos.input} value={draft.estado_contrato ?? ''} onChange={(e) => actualizarDraft('estado_contrato', e.target.value)}>
                  {ESTADOS_CONTRATO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
            </div>

            <h3 style={estilos.tituloSubseccion}>Clasificación y participación</h3>
            <div style={estilos.grid2}>
              <Campo label="Códigos UNSPSC del contrato en el RUP (separados por ;)">
                <input style={estilos.input} placeholder="81111500; 81112000" value={draft.unspsc_codigos ?? ''} onChange={(e) => actualizarDraft('unspsc_codigos', e.target.value)} />
              </Campo>
              <Campo label="Etiquetas temáticas (ej: nube, software, seguridad, web, datos)">
                <input style={estilos.input} value={draft.etiquetas_tematicas ?? ''} onChange={(e) => actualizarDraft('etiquetas_tematicas', e.target.value)} />
              </Campo>
            </div>
            <PreguntaSiNo
              texto="¿Se ejecutó en consorcio o unión temporal?"
              valor={draft.ejecutado_ut_consorcio}
              onChange={(v) => actualizarDraft('ejecutado_ut_consorcio', v)}
            />
            {draft.ejecutado_ut_consorcio === true && (
              <div style={estilos.grid2}>
                <Campo label="% de participación">
                  <input type="number" step="any" style={estilos.input} value={draft.porcentaje_participacion ?? ''} onChange={(e) => actualizarDraft('porcentaje_participacion', e.target.value === '' ? '' : Number(e.target.value))} />
                </Campo>
                <Campo label="Valor final ponderado por participación (COP)">
                  <input type="number" step="any" style={estilos.input} value={draft.valor_final_ponderado ?? ''} onChange={(e) => actualizarDraft('valor_final_ponderado', e.target.value === '' ? '' : Number(e.target.value))} />
                </Campo>
              </div>
            )}

            <h3 style={estilos.tituloSubseccion}>Certificación</h3>
            <div style={estilos.grid2}>
              <Campo label="Cantidades ejecutadas (usuarios, licencias, sedes, módulos, horas)">
                <input style={estilos.input} value={draft.cantidades_ejecutadas ?? ''} onChange={(e) => actualizarDraft('cantidades_ejecutadas', e.target.value)} />
              </Campo>
              <Campo label="Persona que certifica (nombre, cargo, contacto)">
                <input style={estilos.input} value={draft.persona_certifica ?? ''} onChange={(e) => actualizarDraft('persona_certifica', e.target.value)} />
              </Campo>
            </div>
            <PreguntaSiNo
              texto="¿Certificación firmada y con datos de contacto?"
              valor={draft.certificacion_firmada}
              onChange={(v) => actualizarDraft('certificacion_firmada', v)}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" style={estilos.botonSecundario} onClick={cancelar}>Cancelar</button>
              <button type="submit" disabled={guardando} style={estilos.boton}>{guardando ? 'Guardando…' : 'Guardar contrato'}</button>
            </div>
          </form>
        ) : (
          <button type="button" style={estilos.boton} onClick={abrirNuevo}>+ Agregar un contrato</button>
        )}
      </section>
    </main>
  );
}

const estilos = {
  pagina: { maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#12181F' },
  titulo: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  subtitulo: { color: '#5B6572', marginBottom: 32, lineHeight: 1.5 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E3E7EC' },
  tab: { padding: '10px 16px', textDecoration: 'none', color: '#5B6572', fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent' },
  tabActiva: { color: '#12181F', borderBottom: '2px solid #12181F' },
  seccion: { border: '1px solid #E3E7EC', borderRadius: 12, padding: 24, marginBottom: 24 },
  tituloSeccion: { fontSize: 18, fontWeight: 600, marginBottom: 12 },
  tituloSubseccion: { fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8, color: '#374151' },
  ayuda: { color: '#5B6572', fontSize: 14, marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 },
  etiqueta: { fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '8px 10px', border: '1px solid #D0D5DD', borderRadius: 8, fontSize: 14 },
  filaPregunta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '10px 0', borderTop: '1px solid #F0F2F5' },
  textoPregunta: { fontSize: 14, flex: 1 },
  opcionesSiNo: { display: 'flex', gap: 12, flexShrink: 0 },
  opcionSiNo: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 },
  filaTabla: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid #E3E7EC', borderRadius: 8 },
  tarjetaFormulario: { border: '1px dashed #D0D5DD', borderRadius: 8, padding: 16 },
  boton: { background: '#12181F', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  botonSecundario: { background: '#fff', color: '#12181F', border: '1px solid #D0D5DD', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C0362C', fontSize: 14 },
};
