'use client';

import { useEffect, useState } from 'react';

const TIPOS_VINCULACION = [
  { value: '', label: 'Selecciona...' },
  { value: 'nomina', label: 'Nómina (contrato laboral)' },
  { value: 'prestacion_servicios', label: 'Prestación de servicios' },
  { value: 'aliado_subcontratista', label: 'Aliado / subcontratista' },
  { value: 'poliza_vigente', label: 'Póliza vigente' },
  { value: 'otro', label: 'Otro' },
];

const PERSONA_VACIA = {
  id: null,
  nombre_completo: '',
  tipo_num_documento: '',
  cargo_actual: '',
  tipo_vinculacion: '',
  profesion_pregrado: '',
  institucion: '',
  fecha_grado: '',
  posgrados: '',
  tarjeta_profesional: '',
  anios_experiencia_general: '',
  anios_experiencia_especifica: '',
  area_especialidad: '',
  certificaciones_principales: '',
  disponibilidad_porcentaje: '',
  acepta_ser_presentado: null,
  carta_compromiso_firmada: null,
  hoja_vida_disponible: null,
  diplomas_actas_disponibles: null,
  certificados_laborales_disponibles: null,
  observaciones: '',
};

const CERTIFICACION_VACIA = {
  id: null,
  persona_id: '',
  certificacion: '',
  entidad_emisora: '',
  fecha_expedicion: '',
  fecha_vencimiento: '',
  observaciones: '',
};

// Columnas que espera el importador de personas, EN ESTE ORDEN — misma plantilla que se descarga.
const COLUMNAS_IMPORTACION_PERSONAS = [
  { header: 'Nombre completo', key: 'nombre_completo', tipo: 'texto' },
  { header: 'Tipo y N° de documento', key: 'tipo_num_documento', tipo: 'texto' },
  { header: 'Cargo actual', key: 'cargo_actual', tipo: 'texto' },
  { header: 'Tipo de vinculación (Nómina, Prestación de servicios, Aliado/subcontratista, Póliza vigente u Otro)', key: 'tipo_vinculacion', tipo: 'vinculacion' },
  { header: 'Profesión / título de pregrado', key: 'profesion_pregrado', tipo: 'texto' },
  { header: 'Institución', key: 'institucion', tipo: 'texto' },
  { header: 'Fecha de grado (aaaa-mm-dd)', key: 'fecha_grado', tipo: 'fecha' },
  { header: 'Posgrados (nivel y nombre)', key: 'posgrados', tipo: 'texto' },
  { header: 'Tarjeta profesional (N°)', key: 'tarjeta_profesional', tipo: 'texto' },
  { header: 'Años de experiencia general', key: 'anios_experiencia_general', tipo: 'numero' },
  { header: 'Años de experiencia específica', key: 'anios_experiencia_especifica', tipo: 'numero' },
  { header: 'Área de especialidad', key: 'area_especialidad', tipo: 'texto' },
  { header: 'Certificaciones principales (resumen)', key: 'certificaciones_principales', tipo: 'texto' },
  { header: '% de disponibilidad libre (0 a 100)', key: 'disponibilidad_porcentaje', tipo: 'numero' },
  { header: '¿Acepta ser presentado en propuestas? (Si/No)', key: 'acepta_ser_presentado', tipo: 'sino' },
  { header: '¿Carta de compromiso firmada? (Si/No)', key: 'carta_compromiso_firmada', tipo: 'sino' },
  { header: '¿Hoja de vida disponible? (Si/No)', key: 'hoja_vida_disponible', tipo: 'sino' },
  { header: '¿Diplomas y actas de grado disponibles? (Si/No)', key: 'diplomas_actas_disponibles', tipo: 'sino' },
  { header: '¿Certificados laborales disponibles? (Si/No)', key: 'certificados_laborales_disponibles', tipo: 'sino' },
  { header: 'Observaciones', key: 'observaciones', tipo: 'texto' },
];

const FILA_EJEMPLO_PERSONAS = [
  'Laura Martínez Silva', 'CC 1.020.000.000', 'Gerente de proyectos', 'Nómina (contrato laboral)',
  'Ingeniera de Sistemas', 'Universidad Ejemplo', '2012-12-10', 'Especialización en Gerencia de Proyectos',
  '25255-123456', '13', '8', 'Gestión de proyectos de TI', 'PMP; Scrum Master', '50',
  'Si', 'No', 'Si', 'Si', 'Si', 'Ejemplo',
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
    case 'sino': {
      const n = normalizar(valor);
      if (n === 'si' || n === 'sí') return true;
      if (n === 'no') return false;
      return null;
    }
    case 'vinculacion': {
      const n = normalizar(valor);
      if (n.includes('nomina')) return 'nomina';
      if (n.includes('prestacion')) return 'prestacion_servicios';
      if (n.includes('aliado') || n.includes('subcontrat')) return 'aliado_subcontratista';
      if (n.includes('poliza')) return 'poliza_vigente';
      return 'otro';
    }
    case 'fecha': {
      const iso = valor.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
      const dmy = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
      return null;
    }
    default:
      return valor;
  }
}

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
    const filasCrudas = XLSX.utils.sheet_to_json(hoja, { header: 1, raw: false });
    return filasCrudas
      .map((fila) => fila.map((v) => (v === undefined || v === null ? '' : String(v))))
      .filter((f) => f.some((v) => v.trim() !== ''));
  }
  throw new Error('Formato no reconocido. Sube un archivo .csv, .xlsx o .xls.');
}

function descargarPlantillaPersonasCSV() {
  const encabezados = COLUMNAS_IMPORTACION_PERSONAS.map((c) => c.header);
  const filas = [encabezados, FILA_EJEMPLO_PERSONAS];
  const csv = filas
    .map((fila) => fila.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_talento_licitup.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function descargarPlantillaPersonasExcel() {
  const XLSX = await cargarLectorExcel();
  const encabezados = COLUMNAS_IMPORTACION_PERSONAS.map((c) => c.header);
  const datos = [encabezados, FILA_EJEMPLO_PERSONAS];
  const hoja = XLSX.utils.aoa_to_sheet(datos);
  hoja['!cols'] = encabezados.map(() => ({ wch: 26 }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Talento');
  XLSX.writeFile(libro, 'plantilla_talento_licitup.xlsx');
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

export default function TalentoPage() {
  const [personas, setPersonas] = useState([]);
  const [cargandoPersonas, setCargandoPersonas] = useState(true);
  const [draftPersona, setDraftPersona] = useState(null);
  const [guardandoPersona, setGuardandoPersona] = useState(false);
  const [mensajePersonas, setMensajePersonas] = useState(null);
  const [importandoPersonas, setImportandoPersonas] = useState(false);
  const [preparandoPlantillaPersonas, setPreparandoPlantillaPersonas] = useState(false);

  const [certificaciones, setCertificaciones] = useState([]);
  const [cargandoCertificaciones, setCargandoCertificaciones] = useState(true);
  const [draftCertificacion, setDraftCertificacion] = useState(null);
  const [guardandoCertificacion, setGuardandoCertificacion] = useState(false);
  const [mensajeCertificaciones, setMensajeCertificaciones] = useState(null);

  function cargarPersonas() {
    setCargandoPersonas(true);
    fetch('/api/mi-empresa/talento')
      .then((r) => r.json())
      .then((data) => setPersonas(data.personas ?? []))
      .catch(() => setMensajePersonas({ tipo: 'error', texto: 'No se pudo cargar la lista de personas.' }))
      .finally(() => setCargandoPersonas(false));
  }

  function cargarCertificaciones() {
    setCargandoCertificaciones(true);
    fetch('/api/mi-empresa/talento-certificaciones')
      .then((r) => r.json())
      .then((data) => setCertificaciones(data.certificaciones ?? []))
      .catch(() => setMensajeCertificaciones({ tipo: 'error', texto: 'No se pudo cargar la lista de certificaciones.' }))
      .finally(() => setCargandoCertificaciones(false));
  }

  useEffect(() => { cargarPersonas(); cargarCertificaciones(); }, []);

  // --- Personas ---

  function abrirNuevaPersona() {
    setDraftPersona({ ...PERSONA_VACIA });
    setMensajePersonas(null);
  }

  function abrirEditarPersona(fila) {
    const copia = { ...fila };
    if (copia.fecha_grado) copia.fecha_grado = String(copia.fecha_grado).slice(0, 10);
    setDraftPersona(copia);
    setMensajePersonas(null);
  }

  function cancelarPersona() {
    setDraftPersona(null);
  }

  function actualizarDraftPersona(key, value) {
    setDraftPersona((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarPersona(e) {
    e.preventDefault();
    setGuardandoPersona(true);
    setMensajePersonas(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(draftPersona).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa/talento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setDraftPersona(null);
      cargarPersonas();
    } catch {
      setMensajePersonas({ tipo: 'error', texto: 'No se pudo guardar la persona. Intenta de nuevo.' });
    } finally {
      setGuardandoPersona(false);
    }
  }

  async function eliminarPersona(id) {
    if (!confirm('¿Eliminar esta persona? También se eliminarán sus certificaciones registradas.')) return;
    try {
      const res = await fetch(`/api/mi-empresa/talento?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      cargarPersonas();
      cargarCertificaciones();
    } catch {
      setMensajePersonas({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  async function manejarArchivoImportadoPersonas(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    setImportandoPersonas(true);
    setMensajePersonas(null);
    try {
      const filas = await leerFilasDelArchivo(archivo);
      const filasDeDatos = filas.slice(1);

      let exitosas = 0;
      const filasConError = [];

      for (let i = 0; i < filasDeDatos.length; i++) {
        const fila = filasDeDatos[i];
        const payload = {};
        COLUMNAS_IMPORTACION_PERSONAS.forEach((col, idx) => {
          payload[col.key] = convertirValor(fila[idx], col.tipo);
        });

        try {
          const res = await fetch('/api/mi-empresa/talento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('row_failed');
          exitosas++;
        } catch {
          filasConError.push(i + 2);
        }
      }

      cargarPersonas();
      if (filasConError.length === 0) {
        setMensajePersonas({ tipo: 'ok', texto: `Se importaron ${exitosas} persona(s) correctamente.` });
      } else {
        setMensajePersonas({
          tipo: 'error',
          texto: `Se importaron ${exitosas} persona(s). Hubo un problema en la(s) fila(s): ${filasConError.join(', ')}.`,
        });
      }
    } catch (error) {
      setMensajePersonas({ tipo: 'error', texto: error?.message || 'No se pudo leer el archivo. Verifica que sea un CSV o Excel válido.' });
    } finally {
      setImportandoPersonas(false);
    }
  }

  // --- Certificaciones ---

  function abrirNuevaCertificacion() {
    setDraftCertificacion({ ...CERTIFICACION_VACIA });
    setMensajeCertificaciones(null);
  }

  function abrirEditarCertificacion(fila) {
    const copia = { ...fila };
    if (copia.fecha_expedicion) copia.fecha_expedicion = String(copia.fecha_expedicion).slice(0, 10);
    if (copia.fecha_vencimiento) copia.fecha_vencimiento = String(copia.fecha_vencimiento).slice(0, 10);
    setDraftCertificacion(copia);
    setMensajeCertificaciones(null);
  }

  function cancelarCertificacion() {
    setDraftCertificacion(null);
  }

  function actualizarDraftCertificacion(key, value) {
    setDraftCertificacion((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarCertificacion(e) {
    e.preventDefault();
    setGuardandoCertificacion(true);
    setMensajeCertificaciones(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(draftCertificacion).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa/talento-certificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setDraftCertificacion(null);
      cargarCertificaciones();
    } catch {
      setMensajeCertificaciones({ tipo: 'error', texto: 'No se pudo guardar la certificación. Intenta de nuevo.' });
    } finally {
      setGuardandoCertificacion(false);
    }
  }

  async function eliminarCertificacion(id) {
    if (!confirm('¿Eliminar esta certificación?')) return;
    try {
      const res = await fetch(`/api/mi-empresa/talento-certificaciones?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      cargarCertificaciones();
    } catch {
      setMensajeCertificaciones({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  return (
    <main style={estilos.pagina}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Manrope:wght@400;500;600;700&display=swap');`}</style>

      <header style={estilos.headerMarca}>
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 56 A 48 48 0 0 1 56 8" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round" opacity="0.35"></path>
          <path d="M20 56 A 36 36 0 0 1 56 20" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round" opacity="0.6"></path>
          <path d="M32 56 A 24 24 0 0 1 56 32" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round"></path>
          <circle cx="56" cy="56" r="6" fill="#D7FF3D"></circle>
        </svg>
        <div>
          <div style={estilos.logoWordmark}>Licit<span style={{ color: '#D7FF3D' }}>Up</span></div>
          <div style={estilos.logoTagline}>Inteligencia de licitaciones</div>
        </div>
      </header>

      <nav style={estilos.tabs}>
        <a href="/mi-empresa" style={estilos.tab}>Mi Empresa</a>
        <a href="/mi-empresa/experiencia" style={estilos.tab}>Experiencia</a>
        <a href="/mi-empresa/talento" style={{ ...estilos.tab, ...estilos.tabActiva }}>Talento</a>
        <a href="/mi-empresa/financiero" style={estilos.tab}>Financiero</a>
      </nav>

      <h1 style={estilos.titulo}>Talento</h1>
      <p style={estilos.subtitulo}>
        Banco de personas que podrían presentarse en propuestas, y sus certificaciones. Se usa para cruzar
        los perfiles que pida cada proceso (formación, experiencia, certificaciones) contra tu equipo real.
        Esta sección es opcional — puedes dejarla vacía o completarla después. No hace falta adjuntar
        hojas de vida ni diplomas, solo marcar si los tienes disponibles.
      </p>

      {/* ===== Personas ===== */}
      <section style={estilos.seccion}>
        <h2 style={estilos.tituloSeccion}>Personas del equipo</h2>

        <h3 style={estilos.tituloSubseccion}>Cargar varias personas a la vez</h3>
        <p style={estilos.ayuda}>
          Si tienes un equipo grande, es más rápido descargar la plantilla, llenarla y subirla de una sola vez.
          Puedes subirla en Excel (.xlsx) o en CSV, como prefieras.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            type="button"
            style={estilos.botonSecundario}
            disabled={preparandoPlantillaPersonas}
            onClick={async () => {
              setPreparandoPlantillaPersonas(true);
              setMensajePersonas(null);
              try {
                await descargarPlantillaPersonasExcel();
              } catch {
                setMensajePersonas({ tipo: 'error', texto: 'No se pudo preparar la plantilla en Excel. Intenta de nuevo o descárgala en CSV.' });
              } finally {
                setPreparandoPlantillaPersonas(false);
              }
            }}
          >
            {preparandoPlantillaPersonas ? 'Preparando…' : 'Descargar plantilla (Excel)'}
          </button>
          <button type="button" style={estilos.botonSecundario} onClick={descargarPlantillaPersonasCSV}>
            Descargar plantilla (CSV)
          </button>
          <label style={{ ...estilos.boton, display: 'inline-block', cursor: 'pointer' }}>
            {importandoPersonas ? 'Importando…' : 'Subir Excel o CSV lleno'}
            <input type="file" accept=".csv,.xlsx,.xls" onChange={manejarArchivoImportadoPersonas} disabled={importandoPersonas} style={{ display: 'none' }} />
          </label>
        </div>

        {mensajePersonas && (
          <p style={mensajePersonas.tipo === 'error' ? estilos.mensajeError : estilos.mensajeOk}>{mensajePersonas.texto}</p>
        )}

        <h3 style={estilos.tituloSubseccion}>Personas guardadas</h3>
        {cargandoPersonas ? (
          <p style={estilos.ayuda}>Cargando…</p>
        ) : personas.length === 0 && !draftPersona ? (
          <p style={estilos.ayuda}>Todavía no has agregado ninguna persona.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {personas.map((p) => (
              <div key={p.id} style={estilos.filaTabla}>
                <div>
                  <strong>{p.nombre_completo || 'Sin nombre'}</strong>
                  {p.cargo_actual ? ` — ${p.cargo_actual}` : ''}
                  <div style={estilos.ayuda}>
                    {p.tipo_vinculacion ? `${TIPOS_VINCULACION.find((t) => t.value === p.tipo_vinculacion)?.label ?? p.tipo_vinculacion}` : ''}
                    {p.anios_experiencia_general != null ? ` · ${p.anios_experiencia_general} años exp. general` : ''}
                    {p.disponibilidad_porcentaje != null ? ` · ${p.disponibilidad_porcentaje}% disponible` : ''}
                    {p.acepta_ser_presentado === false ? ' · no acepta ser presentado' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" style={estilos.botonSecundario} onClick={() => abrirEditarPersona(p)}>Editar</button>
                  <button type="button" style={estilos.botonSecundario} onClick={() => eliminarPersona(p.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draftPersona ? (
          <form onSubmit={guardarPersona} style={estilos.tarjetaFormulario}>
            <h4 style={estilos.tituloSubseccion}>Datos generales</h4>
            <div style={estilos.grid2}>
              <Campo label="Nombre completo">
                <input style={estilos.input} value={draftPersona.nombre_completo ?? ''} onChange={(e) => actualizarDraftPersona('nombre_completo', e.target.value)} />
              </Campo>
              <Campo label="Tipo y N° de documento">
                <input style={estilos.input} placeholder="CC 1.020.000.000" value={draftPersona.tipo_num_documento ?? ''} onChange={(e) => actualizarDraftPersona('tipo_num_documento', e.target.value)} />
              </Campo>
              <Campo label="Cargo actual">
                <input style={estilos.input} value={draftPersona.cargo_actual ?? ''} onChange={(e) => actualizarDraftPersona('cargo_actual', e.target.value)} />
              </Campo>
              <Campo label="Tipo de vinculación">
                <select style={estilos.input} value={draftPersona.tipo_vinculacion ?? ''} onChange={(e) => actualizarDraftPersona('tipo_vinculacion', e.target.value)}>
                  {TIPOS_VINCULACION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
            </div>

            <h4 style={estilos.tituloSubseccion}>Formación</h4>
            <div style={estilos.grid2}>
              <Campo label="Profesión / título de pregrado">
                <input style={estilos.input} value={draftPersona.profesion_pregrado ?? ''} onChange={(e) => actualizarDraftPersona('profesion_pregrado', e.target.value)} />
              </Campo>
              <Campo label="Institución">
                <input style={estilos.input} value={draftPersona.institucion ?? ''} onChange={(e) => actualizarDraftPersona('institucion', e.target.value)} />
              </Campo>
              <Campo label="Fecha de grado">
                <input type="date" style={estilos.input} value={draftPersona.fecha_grado ?? ''} onChange={(e) => actualizarDraftPersona('fecha_grado', e.target.value)} />
              </Campo>
              <Campo label="Posgrados (nivel y nombre)">
                <input style={estilos.input} value={draftPersona.posgrados ?? ''} onChange={(e) => actualizarDraftPersona('posgrados', e.target.value)} />
              </Campo>
              <Campo label="Tarjeta profesional (N°)">
                <input style={estilos.input} value={draftPersona.tarjeta_profesional ?? ''} onChange={(e) => actualizarDraftPersona('tarjeta_profesional', e.target.value)} />
              </Campo>
            </div>

            <h4 style={estilos.tituloSubseccion}>Experiencia</h4>
            <div style={estilos.grid2}>
              <Campo label="Años de experiencia general">
                <input type="number" step="any" style={estilos.input} value={draftPersona.anios_experiencia_general ?? ''} onChange={(e) => actualizarDraftPersona('anios_experiencia_general', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Años de experiencia específica">
                <input type="number" step="any" style={estilos.input} value={draftPersona.anios_experiencia_especifica ?? ''} onChange={(e) => actualizarDraftPersona('anios_experiencia_especifica', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Área de especialidad">
                <input style={estilos.input} value={draftPersona.area_especialidad ?? ''} onChange={(e) => actualizarDraftPersona('area_especialidad', e.target.value)} />
              </Campo>
              <Campo label="% de disponibilidad libre para nuevos proyectos (0 a 100)">
                <input type="number" step="any" min="0" max="100" style={estilos.input} value={draftPersona.disponibilidad_porcentaje ?? ''} onChange={(e) => actualizarDraftPersona('disponibilidad_porcentaje', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
            </div>
            <Campo label="Certificaciones principales (resumen libre — el detalle completo va en la sección de abajo)">
              <input style={estilos.input} placeholder="PMP; Scrum Master" value={draftPersona.certificaciones_principales ?? ''} onChange={(e) => actualizarDraftPersona('certificaciones_principales', e.target.value)} />
            </Campo>

            <h4 style={estilos.tituloSubseccion}>Disponibilidad de soportes</h4>
            <PreguntaSiNo texto="¿Acepta ser presentado en propuestas?" valor={draftPersona.acepta_ser_presentado} onChange={(v) => actualizarDraftPersona('acepta_ser_presentado', v)} />
            <PreguntaSiNo texto="¿Carta de compromiso firmada?" valor={draftPersona.carta_compromiso_firmada} onChange={(v) => actualizarDraftPersona('carta_compromiso_firmada', v)} />
            <PreguntaSiNo texto="¿Hoja de vida disponible?" valor={draftPersona.hoja_vida_disponible} onChange={(v) => actualizarDraftPersona('hoja_vida_disponible', v)} />
            <PreguntaSiNo texto="¿Diplomas y actas de grado disponibles?" valor={draftPersona.diplomas_actas_disponibles} onChange={(v) => actualizarDraftPersona('diplomas_actas_disponibles', v)} />
            <PreguntaSiNo texto="¿Certificados laborales disponibles?" valor={draftPersona.certificados_laborales_disponibles} onChange={(v) => actualizarDraftPersona('certificados_laborales_disponibles', v)} />

            <Campo label="Observaciones">
              <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={draftPersona.observaciones ?? ''} onChange={(e) => actualizarDraftPersona('observaciones', e.target.value)} />
            </Campo>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" style={estilos.botonSecundario} onClick={cancelarPersona}>Cancelar</button>
              <button type="submit" disabled={guardandoPersona} style={estilos.boton}>{guardandoPersona ? 'Guardando…' : 'Guardar persona'}</button>
            </div>
          </form>
        ) : (
          <button type="button" style={estilos.boton} onClick={abrirNuevaPersona}>+ Agregar una persona</button>
        )}
      </section>

      {/* ===== Certificaciones ===== */}
      <section style={estilos.seccion}>
        <h2 style={estilos.tituloSeccion}>Certificaciones del personal</h2>
        <p style={estilos.ayuda}>
          Una fila por certificación (PMP, ITIL, cloud, seguridad, Scrum, etc.). Primero agrega a la persona
          arriba; aquí solo la eliges de la lista. No hace falta adjuntar el certificado, solo registrar los datos.
        </p>

        {mensajeCertificaciones && (
          <p style={mensajeCertificaciones.tipo === 'error' ? estilos.mensajeError : estilos.mensajeOk}>{mensajeCertificaciones.texto}</p>
        )}

        {cargandoCertificaciones ? (
          <p style={estilos.ayuda}>Cargando…</p>
        ) : certificaciones.length === 0 && !draftCertificacion ? (
          <p style={estilos.ayuda}>Todavía no has agregado ninguna certificación.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {certificaciones.map((c) => (
              <div key={c.id} style={estilos.filaTabla}>
                <div>
                  <strong>{c.certificacion || 'Sin nombre'}</strong>
                  {c.persona_nombre ? ` — ${c.persona_nombre}` : ' — (persona no encontrada)'}
                  <div style={estilos.ayuda}>
                    {c.entidad_emisora ? `${c.entidad_emisora}` : ''}
                    {c.fecha_vencimiento ? ` · vence ${String(c.fecha_vencimiento).slice(0, 10)}` : ' · sin vencimiento'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" style={estilos.botonSecundario} onClick={() => abrirEditarCertificacion(c)}>Editar</button>
                  <button type="button" style={estilos.botonSecundario} onClick={() => eliminarCertificacion(c.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draftCertificacion ? (
          <form onSubmit={guardarCertificacion} style={estilos.tarjetaFormulario}>
            <div style={estilos.grid2}>
              <Campo label="Persona">
                <select style={estilos.input} value={draftCertificacion.persona_id ?? ''} onChange={(e) => actualizarDraftCertificacion('persona_id', e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Selecciona...</option>
                  {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre_completo || `Persona #${p.id}`}</option>)}
                </select>
              </Campo>
              <Campo label="Certificación">
                <input style={estilos.input} placeholder="PMP – Project Management Professional" value={draftCertificacion.certificacion ?? ''} onChange={(e) => actualizarDraftCertificacion('certificacion', e.target.value)} />
              </Campo>
              <Campo label="Entidad emisora">
                <input style={estilos.input} placeholder="PMI" value={draftCertificacion.entidad_emisora ?? ''} onChange={(e) => actualizarDraftCertificacion('entidad_emisora', e.target.value)} />
              </Campo>
              <Campo label="Fecha de expedición">
                <input type="date" style={estilos.input} value={draftCertificacion.fecha_expedicion ?? ''} onChange={(e) => actualizarDraftCertificacion('fecha_expedicion', e.target.value)} />
              </Campo>
              <Campo label="Fecha de vencimiento (vacío si no vence)">
                <input type="date" style={estilos.input} value={draftCertificacion.fecha_vencimiento ?? ''} onChange={(e) => actualizarDraftCertificacion('fecha_vencimiento', e.target.value)} />
              </Campo>
            </div>

            <Campo label="Observaciones">
              <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={draftCertificacion.observaciones ?? ''} onChange={(e) => actualizarDraftCertificacion('observaciones', e.target.value)} />
            </Campo>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" style={estilos.botonSecundario} onClick={cancelarCertificacion}>Cancelar</button>
              <button type="submit" disabled={guardandoCertificacion} style={estilos.boton}>{guardandoCertificacion ? 'Guardando…' : 'Guardar certificación'}</button>
            </div>
          </form>
        ) : personas.length === 0 ? (
          <p style={estilos.ayuda}>Agrega primero al menos una persona arriba para poder registrar sus certificaciones.</p>
        ) : (
          <button type="button" style={estilos.boton} onClick={abrirNuevaCertificacion}>+ Agregar una certificación</button>
        )}
      </section>
    </main>
  );
}

const estilos = {
  pagina: { maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: "'Manrope', system-ui, sans-serif", color: '#12181F', backgroundColor: '#F6F8FA', minHeight: '100vh' },
  headerMarca: { display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#0E1420', borderRadius: 14, padding: '18px 22px', marginBottom: 28 },
  logoWordmark: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: '#EDF1F5', lineHeight: 1 },
  logoTagline: { fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA6B4', marginTop: 4 },
  titulo: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4 },
  subtitulo: { color: '#5B6572', marginBottom: 32, lineHeight: 1.5 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E3E7EC' },
  tab: { padding: '10px 16px', textDecoration: 'none', color: '#5B6572', fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent' },
  tabActiva: { color: '#12181F', fontWeight: 700, borderBottom: '3px solid #D7FF3D' },
  seccion: { border: '1px solid #E3E7EC', borderRadius: 12, padding: 24, marginBottom: 24, backgroundColor: '#FFFFFF' },
  tituloSeccion: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 },
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
  boton: { background: '#0E1420', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  botonSecundario: { background: '#fff', color: '#12181F', border: '1px solid #D0D5DD', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C43F2E', fontSize: 14, fontWeight: 600 },
};
