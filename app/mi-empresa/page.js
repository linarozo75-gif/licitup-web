'use client';

import { useEffect, useState } from 'react';

const CAMPOS_INICIALES = {
  razon_social: '',
  nombre_comercial: '',
  nit: '',
  tipo_sociedad: '',
  fecha_constitucion: '',
  duracion_sociedad: '',
  domicilio_ciudad_direccion: '',
  sucursales: '',
  fecha_camara_comercio: '',
  matricula_renovada_anio: '',
  ciiu_principal: '',
  ciiu_secundarios: '',
  objeto_social: '',
  responsabilidades_tributarias: '',
  tamano_empresa: '',
  correo_notificaciones: '',
  telefono_contacto: '',
  sitio_web: '',
  rl_nombre_completo: '',
  rl_tipo_num_documento: '',
  rl_ciudad_expedicion: '',
  rl_correo: '',
  rl_fecha_nombramiento: '',
  rl_suplente: '',
  rl_tiene_limite_monto: null,
  rl_monto_maximo: '',
  rl_organo_autoriza: '',
  rl_facultades_ofertar: null,
  rl_restricciones_estatutarias: '',
  jur_camara_comercio_vigente: null,
  jur_rup_vigente_cierre: null,
  jur_antecedentes_ok: null,
  jur_formatos_propios_ok: null,
  jur_rut_vigente: null,
  jur_documentos_financieros_ok: null,
  cump_tiene_revisor_fiscal: null,
  cump_revisor_fiscal_nombre_tp: '',
  cump_contador_nombre_tp: '',
  cump_certificado_ss_parafiscales_30d: null,
  cump_aportes_al_dia: null,
  cump_antecedentes_fiscales_empresa: '',
  cump_antecedentes_fiscales_rl: '',
  cump_antecedentes_disciplinarios_empresa: '',
  cump_antecedentes_disciplinarios_rl: '',
  cump_antecedentes_judiciales_rl: '',
  cump_medidas_correctivas_rnmc_rl: '',
  cump_redam_rl: '',
  cump_inhabilidades_delitos_menores_rl: '',
  cump_tiene_sanciones_5_anios: null,
  cump_detalle_sanciones: '',
  cump_tiene_procesos_judiciales: null,
  cump_detalle_procesos_judiciales: '',
  cump_puntaje_sgsst: '',
  cump_politica_proteccion_datos: null,
  cump_programa_etica_sarlaft: null,
  cump_secop_ii_activo: null,
  fin_estado_rup: '',
  fin_fecha_renovacion_rup: '',
  fin_fecha_corte_informacion: '',
  fin_k_residual: '',
  fin_activo_corriente: '',
  fin_activo_total: '',
  fin_pasivo_corriente: '',
  fin_pasivo_total: '',
  fin_patrimonio: '',
  fin_ingresos_operacionales: '',
  fin_utilidad_operacional: '',
  fin_utilidad_neta: '',
  fin_gastos_intereses: '',
  fin_regimen: 'normal',
  fin_indice_liquidez: '',
  fin_indice_endeudamiento: '',
  fin_razon_cobertura_intereses: '',
  fin_capital_trabajo: '',
  fin_rentabilidad_patrimonio: '',
  fin_rentabilidad_activo: '',
  fin_doc_estados_financieros_notas: null,
  fin_doc_dictamen_revisor_fiscal: null,
  fin_doc_declaracion_renta: null,
  fin_doc_certificacion_bancaria: null,
  cupos_corredor_seguros_seriedad: null,
  cupos_capacidad_polizas_cumplimiento: null,
  cap_infraestructura_herramientas: '',
  cap_sedes_ciudades: '',
  cap_esquema_soporte: '',
  cap_metodologias: '',
  cap_servicios_principales: '',
  cap_sectores_experiencia: '',
  pond_es_mipyme: null,
  pond_mipyme_quien_certifica: '',
  pond_mipyme_fecha_certificacion: '',
  pond_origen_nacional: null,
  pond_num_personas_discapacidad: '',
  pond_fecha_vinculacion_discapacidad: '',
  pond_certificado_mintrabajo_discapacidad: null,
  pond_participacion_mujeres: '',
  unspsc_codigos: '',
  descripcion_servicios: '',
};

// Checklist general de viabilidad (preguntas del levantamiento original, antes de entrar al detalle del Excel)
const PREGUNTAS_CHECKLIST_GENERAL = [
  { key: 'jur_camara_comercio_vigente', texto: '¿Siempre puedes obtener una Cámara de Comercio vigente antes del cierre?' },
  { key: 'jur_rup_vigente_cierre', texto: '¿Siempre puedes obtener un RUP vigente antes del cierre?' },
  { key: 'jur_antecedentes_ok', texto: '¿Puedes tramitar antecedentes de Procuraduría, Contraloría, Policía, RNMC y REDAM sin problema?' },
  { key: 'jur_formatos_propios_ok', texto: '¿Estás en capacidad de diligenciar los formatos propios que pida cada entidad (anticorrupción, tratamiento de datos, compromiso de integridad, etc.)?' },
  { key: 'jur_rut_vigente', texto: '¿Cuentas con RUT vigente?' },
  { key: 'jur_documentos_financieros_ok', texto: '¿Cuentas con documentos financieros (estados financieros del último año, certificación bancaria, declaración de renta al día, documentos del contador y revisor fiscal si aplica), entre otros?' },
];

// Preguntas Sí/No del Módulo 4 (Cumplimiento)
const PREGUNTAS_CUMPLIMIENTO_SINO = [
  { key: 'cump_tiene_revisor_fiscal', texto: '¿Tiene revisor fiscal?' },
  { key: 'cump_aportes_al_dia', texto: '¿Está al día en aportes a seguridad social y parafiscales (sin deudas ni mora)?' },
  { key: 'cump_tiene_sanciones_5_anios', texto: '¿Ha tenido multas, sanciones, caducidades o incumplimientos con entidades estatales en los últimos 5 años?' },
  { key: 'cump_tiene_procesos_judiciales', texto: '¿Tiene procesos judiciales, arbitrales o embargos relevantes en su contra?' },
  { key: 'cump_politica_proteccion_datos', texto: '¿Tiene política de protección de datos personales (Ley 1581 de 2012)?' },
  { key: 'cump_programa_etica_sarlaft', texto: '¿Tiene programa de ética, SARLAFT o antisoborno?' },
  { key: 'cump_secop_ii_activo', texto: '¿Tiene usuario activo en SECOP II y firma electrónica vigente?' },
];

// Preguntas de antecedentes: tres respuestas posibles en vez de Sí/No
const PREGUNTAS_ANTECEDENTES = [
  { key: 'cump_antecedentes_fiscales_empresa', texto: 'Antecedentes fiscales (Contraloría) — empresa' },
  { key: 'cump_antecedentes_fiscales_rl', texto: 'Antecedentes fiscales (Contraloría) — representante legal' },
  { key: 'cump_antecedentes_disciplinarios_empresa', texto: 'Antecedentes disciplinarios (Procuraduría) — empresa' },
  { key: 'cump_antecedentes_disciplinarios_rl', texto: 'Antecedentes disciplinarios (Procuraduría) — representante legal' },
  { key: 'cump_antecedentes_judiciales_rl', texto: 'Antecedentes judiciales (Policía) — representante legal' },
  { key: 'cump_medidas_correctivas_rnmc_rl', texto: 'Medidas correctivas (RNMC) — representante legal' },
  { key: 'cump_redam_rl', texto: 'REDAM (deudores alimentarios morosos) — representante legal' },
  { key: 'cump_inhabilidades_delitos_menores_rl', texto: 'Inhabilidades por delitos contra menores — representante legal' },
];

const OPCIONES_ANTECEDENTES = [
  { value: '', label: 'Selecciona...' },
  { value: 'sin_antecedentes', label: 'Sin antecedentes / No registra' },
  { value: 'registra_antecedentes', label: 'Registra antecedentes' },
  { value: 'pendiente_consulta', label: 'Pendiente de consulta' },
];

const TIPOS_SOCIEDAD = [
  { value: '', label: 'Selecciona...' },
  { value: 'sas', label: 'S.A.S.' },
  { value: 'ltda', label: 'Ltda.' },
  { value: 'sa', label: 'S.A.' },
  { value: 'persona_natural', label: 'Persona natural' },
  { value: 'sucursal_extranjera', label: 'Sucursal de sociedad extranjera' },
  { value: 'cooperativa_esal', label: 'Cooperativa / ESAL' },
  { value: 'otra', label: 'Otra' },
];

const TAMANOS_EMPRESA = [
  { value: '', label: 'Selecciona...' },
  { value: 'microempresa', label: 'Microempresa' },
  { value: 'pequena', label: 'Pequeña' },
  { value: 'mediana', label: 'Mediana' },
  { value: 'grande', label: 'Grande' },
];

// Módulo 3 (Accionistas): puede haber varios por empresa, así que tiene su propia tabla y su
// propia API, pero vive dentro de esta misma página — no en una pestaña aparte.
const TIPOS_DOCUMENTO = [
  { value: '', label: 'Selecciona...' },
  { value: 'cc', label: 'Cédula de ciudadanía (CC)' },
  { value: 'ce', label: 'Cédula de extranjería (CE)' },
  { value: 'nit', label: 'NIT' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'otro', label: 'Otro' },
];

const ACCIONISTA_VACIO = {
  id: null,
  nombre_razon_social: '',
  tipo_documento: '',
  numero_documento: '',
  porcentaje_participacion: '',
  pais_domicilio: '',
  beneficiario_final: null,
  pep: null,
  servidor_publico_pariente: null,
  representante_legal_directivo: null,
  observaciones: '',
};

// Columnas que espera el importador de accionistas, EN ESTE ORDEN — misma plantilla que se descarga.
const COLUMNAS_IMPORTACION_ACCIONISTAS = [
  { header: 'Nombre o razón social', key: 'nombre_razon_social', tipo: 'texto' },
  { header: 'Tipo de documento (CC, CE, NIT, Pasaporte u Otro)', key: 'tipo_documento', tipo: 'tipo_documento' },
  { header: 'Número de documento', key: 'numero_documento', tipo: 'texto' },
  { header: '% de participación', key: 'porcentaje_participacion', tipo: 'numero' },
  { header: 'País de domicilio', key: 'pais_domicilio', tipo: 'texto' },
  { header: '¿Beneficiario final? (Si/No)', key: 'beneficiario_final', tipo: 'sino' },
  { header: '¿Persona expuesta políticamente (PEP)? (Si/No)', key: 'pep', tipo: 'sino' },
  { header: '¿Es servidor público o pariente de uno? (Si/No)', key: 'servidor_publico_pariente', tipo: 'sino' },
  { header: '¿Es representante legal o directivo? (Si/No)', key: 'representante_legal_directivo', tipo: 'sino' },
  { header: 'Observaciones', key: 'observaciones', tipo: 'texto' },
];

const FILA_EJEMPLO_ACCIONISTAS = ['María Gómez Pérez', 'CC', '52000000', '60', 'Colombia', 'Si', 'No', 'No', 'Si', ''];

// Módulo 9b (Certificaciones de la empresa): igual que Accionistas, tabla propia pero dentro de esta misma página.
const TIPOS_CERTIFICACION_EMPRESA = [
  { value: '', label: 'Selecciona...' },
  { value: 'iso_norma_gestion', label: 'ISO / norma de gestión' },
  { value: 'partner_fabricante', label: 'Partner / fabricante' },
  { value: 'otra_certificacion', label: 'Otra certificación' },
];

const CERTIFICACION_EMPRESA_VACIA = {
  id: null,
  tipo: '',
  norma_programa_nombre: '',
  entidad_certificadora: '',
  alcance_nivel: '',
  fecha_emision: '',
  fecha_vencimiento: '',
  observaciones: '',
};

const COLUMNAS_IMPORTACION_CERTIFICACIONES_EMPRESA = [
  { header: 'Tipo (ISO/norma de gestión, Partner/fabricante u Otra certificación)', key: 'tipo', tipo: 'tipo_certificacion' },
  { header: 'Norma, programa o nombre', key: 'norma_programa_nombre', tipo: 'texto' },
  { header: 'Entidad certificadora o fabricante', key: 'entidad_certificadora', tipo: 'texto' },
  { header: 'Alcance o nivel', key: 'alcance_nivel', tipo: 'texto' },
  { header: 'Fecha de emisión (aaaa-mm-dd)', key: 'fecha_emision', tipo: 'fecha' },
  { header: 'Fecha de vencimiento (aaaa-mm-dd)', key: 'fecha_vencimiento', tipo: 'fecha' },
  { header: 'Observaciones', key: 'observaciones', tipo: 'texto' },
];

const FILA_EJEMPLO_CERTIFICACIONES_EMPRESA = [
  'ISO / norma de gestión', 'ISO 27001:2022', 'Icontec', 'Desarrollo y soporte de software',
  '2024-04-10', '2027-04-10', '',
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
    case 'tipo_documento': {
      const n = normalizar(valor);
      if (['cc', 'ce', 'nit', 'pasaporte'].includes(n)) return n;
      return 'otro';
    }
    case 'tipo_certificacion': {
      const n = normalizar(valor);
      if (n.includes('iso') || n.includes('norma')) return 'iso_norma_gestion';
      if (n.includes('partner') || n.includes('fabricante')) return 'partner_fabricante';
      return 'otra_certificacion';
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

function descargarPlantillaAccionistasCSV() {
  const encabezados = COLUMNAS_IMPORTACION_ACCIONISTAS.map((c) => c.header);
  const filas = [encabezados, FILA_EJEMPLO_ACCIONISTAS];
  const csv = filas
    .map((fila) => fila.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_accionistas_licitup.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function descargarPlantillaAccionistasExcel() {
  const XLSX = await cargarLectorExcel();
  const encabezados = COLUMNAS_IMPORTACION_ACCIONISTAS.map((c) => c.header);
  const datos = [encabezados, FILA_EJEMPLO_ACCIONISTAS];
  const hoja = XLSX.utils.aoa_to_sheet(datos);
  hoja['!cols'] = encabezados.map(() => ({ wch: 26 }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Accionistas');
  XLSX.writeFile(libro, 'plantilla_accionistas_licitup.xlsx');
}

function descargarPlantillaCertificacionesEmpresaCSV() {
  const encabezados = COLUMNAS_IMPORTACION_CERTIFICACIONES_EMPRESA.map((c) => c.header);
  const filas = [encabezados, FILA_EJEMPLO_CERTIFICACIONES_EMPRESA];
  const csv = filas
    .map((fila) => fila.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_certificaciones_empresa_licitup.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function descargarPlantillaCertificacionesEmpresaExcel() {
  const XLSX = await cargarLectorExcel();
  const encabezados = COLUMNAS_IMPORTACION_CERTIFICACIONES_EMPRESA.map((c) => c.header);
  const datos = [encabezados, FILA_EJEMPLO_CERTIFICACIONES_EMPRESA];
  const hoja = XLSX.utils.aoa_to_sheet(datos);
  hoja['!cols'] = encabezados.map(() => ({ wch: 26 }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Certificaciones');
  XLSX.writeFile(libro, 'plantilla_certificaciones_empresa_licitup.xlsx');
}

// Componente reutilizable para una pregunta Sí/No, con soporte para depender de otra pregunta
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

export default function MiEmpresaPage() {
  const [form, setForm] = useState(CAMPOS_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [accionistas, setAccionistas] = useState([]);
  const [cargandoAccionistas, setCargandoAccionistas] = useState(true);
  const [draftAccionista, setDraftAccionista] = useState(null);
  const [guardandoAccionista, setGuardandoAccionista] = useState(false);
  const [mensajeAccionistas, setMensajeAccionistas] = useState(null);
  const [importandoAccionistas, setImportandoAccionistas] = useState(false);
  const [preparandoPlantillaAccionistas, setPreparandoPlantillaAccionistas] = useState(false);

  const [certificacionesEmpresa, setCertificacionesEmpresa] = useState([]);
  const [cargandoCertificacionesEmpresa, setCargandoCertificacionesEmpresa] = useState(true);
  const [draftCertificacionEmpresa, setDraftCertificacionEmpresa] = useState(null);
  const [guardandoCertificacionEmpresa, setGuardandoCertificacionEmpresa] = useState(false);
  const [mensajeCertificacionesEmpresa, setMensajeCertificacionesEmpresa] = useState(null);
  const [importandoCertificacionesEmpresa, setImportandoCertificacionesEmpresa] = useState(false);
  const [preparandoPlantillaCertificacionesEmpresa, setPreparandoPlantillaCertificacionesEmpresa] = useState(false);

  useEffect(() => {
    fetch('/api/mi-empresa')
      .then((r) => r.json())
      .then((data) => {
        if (data.empresa) {
          const empresa = { ...data.empresa };
          // Las fechas llegan como timestamp ISO completo; los campos <input type="date"> solo entienden "aaaa-mm-dd"
          for (const campoFecha of ['fecha_constitucion', 'fecha_camara_comercio', 'rl_fecha_nombramiento', 'fin_fecha_renovacion_rup', 'fin_fecha_corte_informacion', 'pond_mipyme_fecha_certificacion', 'pond_fecha_vinculacion_discapacidad']) {
            if (empresa[campoFecha]) {
              empresa[campoFecha] = String(empresa[campoFecha]).slice(0, 10);
            }
          }
          setForm({ ...CAMPOS_INICIALES, ...empresa });
        }
      })
      .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo cargar el perfil guardado.' }))
      .finally(() => setCargando(false));
  }, []);

  function cargarAccionistas() {
    setCargandoAccionistas(true);
    fetch('/api/mi-empresa/accionistas')
      .then((r) => r.json())
      .then((data) => setAccionistas(data.accionistas ?? []))
      .catch(() => setMensajeAccionistas({ tipo: 'error', texto: 'No se pudo cargar la lista de accionistas.' }))
      .finally(() => setCargandoAccionistas(false));
  }

  useEffect(() => { cargarAccionistas(); }, []);

  function cargarCertificacionesEmpresa() {
    setCargandoCertificacionesEmpresa(true);
    fetch('/api/mi-empresa/certificaciones')
      .then((r) => r.json())
      .then((data) => setCertificacionesEmpresa(data.certificaciones ?? []))
      .catch(() => setMensajeCertificacionesEmpresa({ tipo: 'error', texto: 'No se pudo cargar la lista de certificaciones.' }))
      .finally(() => setCargandoCertificacionesEmpresa(false));
  }

  useEffect(() => { cargarCertificacionesEmpresa(); }, []);

  function actualizarCampo(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      // Un campo vacío se manda como null, no como '' — así la base de datos no rechaza
      // fechas o números vacíos, y "guardar incompleto" funciona en cualquier campo.
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setMensaje({ tipo: 'ok', texto: 'Perfil guardado.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  }

  function abrirNuevoAccionista() {
    setDraftAccionista({ ...ACCIONISTA_VACIO });
    setMensajeAccionistas(null);
  }

  function abrirEditarAccionista(fila) {
    setDraftAccionista({ ...fila });
    setMensajeAccionistas(null);
  }

  function cancelarAccionista() {
    setDraftAccionista(null);
  }

  function actualizarDraftAccionista(key, value) {
    setDraftAccionista((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarAccionista() {
    setGuardandoAccionista(true);
    setMensajeAccionistas(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(draftAccionista).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa/accionistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setDraftAccionista(null);
      cargarAccionistas();
    } catch {
      setMensajeAccionistas({ tipo: 'error', texto: 'No se pudo guardar el accionista. Intenta de nuevo.' });
    } finally {
      setGuardandoAccionista(false);
    }
  }

  async function eliminarAccionista(id) {
    if (!confirm('¿Eliminar este accionista?')) return;
    try {
      const res = await fetch(`/api/mi-empresa/accionistas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      cargarAccionistas();
    } catch {
      setMensajeAccionistas({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  async function manejarArchivoImportadoAccionistas(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    setImportandoAccionistas(true);
    setMensajeAccionistas(null);
    try {
      const filas = await leerFilasDelArchivo(archivo);
      const filasDeDatos = filas.slice(1);

      let exitosas = 0;
      const filasConError = [];

      for (let i = 0; i < filasDeDatos.length; i++) {
        const fila = filasDeDatos[i];
        const payload = {};
        COLUMNAS_IMPORTACION_ACCIONISTAS.forEach((col, idx) => {
          payload[col.key] = convertirValor(fila[idx], col.tipo);
        });

        try {
          const res = await fetch('/api/mi-empresa/accionistas', {
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

      cargarAccionistas();
      if (filasConError.length === 0) {
        setMensajeAccionistas({ tipo: 'ok', texto: `Se importaron ${exitosas} accionista(s) correctamente.` });
      } else {
        setMensajeAccionistas({
          tipo: 'error',
          texto: `Se importaron ${exitosas} accionista(s). Hubo un problema en la(s) fila(s): ${filasConError.join(', ')}.`,
        });
      }
    } catch (error) {
      setMensajeAccionistas({ tipo: 'error', texto: error?.message || 'No se pudo leer el archivo. Verifica que sea un CSV o Excel válido.' });
    } finally {
      setImportandoAccionistas(false);
    }
  }

  const sumaParticipacionAccionistas = accionistas.reduce((acc, a) => acc + (Number(a.porcentaje_participacion) || 0), 0);

  function abrirNuevaCertificacionEmpresa() {
    setDraftCertificacionEmpresa({ ...CERTIFICACION_EMPRESA_VACIA });
    setMensajeCertificacionesEmpresa(null);
  }

  function abrirEditarCertificacionEmpresa(fila) {
    const copia = { ...fila };
    if (copia.fecha_emision) copia.fecha_emision = String(copia.fecha_emision).slice(0, 10);
    if (copia.fecha_vencimiento) copia.fecha_vencimiento = String(copia.fecha_vencimiento).slice(0, 10);
    setDraftCertificacionEmpresa(copia);
    setMensajeCertificacionesEmpresa(null);
  }

  function cancelarCertificacionEmpresa() {
    setDraftCertificacionEmpresa(null);
  }

  function actualizarDraftCertificacionEmpresa(key, value) {
    setDraftCertificacionEmpresa((prev) => ({ ...prev, [key]: value }));
  }

  async function guardarCertificacionEmpresa() {
    setGuardandoCertificacionEmpresa(true);
    setMensajeCertificacionesEmpresa(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(draftCertificacionEmpresa).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa/certificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setDraftCertificacionEmpresa(null);
      cargarCertificacionesEmpresa();
    } catch {
      setMensajeCertificacionesEmpresa({ tipo: 'error', texto: 'No se pudo guardar la certificación. Intenta de nuevo.' });
    } finally {
      setGuardandoCertificacionEmpresa(false);
    }
  }

  async function eliminarCertificacionEmpresa(id) {
    if (!confirm('¿Eliminar esta certificación?')) return;
    try {
      const res = await fetch(`/api/mi-empresa/certificaciones?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      cargarCertificacionesEmpresa();
    } catch {
      setMensajeCertificacionesEmpresa({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  async function manejarArchivoImportadoCertificacionesEmpresa(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;

    setImportandoCertificacionesEmpresa(true);
    setMensajeCertificacionesEmpresa(null);
    try {
      const filas = await leerFilasDelArchivo(archivo);
      const filasDeDatos = filas.slice(1);

      let exitosas = 0;
      const filasConError = [];

      for (let i = 0; i < filasDeDatos.length; i++) {
        const fila = filasDeDatos[i];
        const payload = {};
        COLUMNAS_IMPORTACION_CERTIFICACIONES_EMPRESA.forEach((col, idx) => {
          payload[col.key] = convertirValor(fila[idx], col.tipo);
        });

        try {
          const res = await fetch('/api/mi-empresa/certificaciones', {
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

      cargarCertificacionesEmpresa();
      if (filasConError.length === 0) {
        setMensajeCertificacionesEmpresa({ tipo: 'ok', texto: `Se importaron ${exitosas} certificación(es) correctamente.` });
      } else {
        setMensajeCertificacionesEmpresa({
          tipo: 'error',
          texto: `Se importaron ${exitosas} certificación(es). Hubo un problema en la(s) fila(s): ${filasConError.join(', ')}.`,
        });
      }
    } catch (error) {
      setMensajeCertificacionesEmpresa({ tipo: 'error', texto: error?.message || 'No se pudo leer el archivo. Verifica que sea un CSV o Excel válido.' });
    } finally {
      setImportandoCertificacionesEmpresa(false);
    }
  }

  if (cargando) {
    return <main style={estilos.pagina}><p>Cargando perfil…</p></main>;
  }

  return (
    <main style={estilos.pagina}>
      <nav style={estilos.tabs}>
        <a href="/mi-empresa" style={{ ...estilos.tab, ...estilos.tabActiva }}>Mi Empresa</a>
        <a href="/mi-empresa/experiencia" style={estilos.tab}>Experiencia</a>
        <a href="/mi-empresa/talento" style={estilos.tab}>Talento</a>
        <a href="/mi-empresa/financiero" style={estilos.tab}>Financiero</a>
      </nav>

      <h1 style={estilos.titulo}>Mi Empresa</h1>
      <p style={estilos.subtitulo}>
        Este perfil alimenta el motor de evaluación. Puedes guardarlo incompleto y volver después —
        lo que falte simplemente no se podrá verificar todavía.
      </p>

      <form
        onSubmit={guardar}
        onKeyDown={(e) => {
          // Evita que Enter en cualquier campo (incluido el de Accionistas) dispare el envío del formulario.
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
        }}
        style={estilos.formulario}
      >
        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Datos básicos</h2>
          <p style={estilos.ayuda}>Cópialos tal como aparecen en la Cámara de Comercio, el RUT y el RUP — las diferencias entre documentos generan observaciones de la entidad.</p>
          <div style={estilos.grid2}>
            <Campo label="Razón social">
              <input style={estilos.input} value={form.razon_social ?? ''} onChange={(e) => actualizarCampo('razon_social', e.target.value)} />
            </Campo>
            <Campo label="Nombre comercial">
              <input style={estilos.input} value={form.nombre_comercial ?? ''} onChange={(e) => actualizarCampo('nombre_comercial', e.target.value)} />
            </Campo>
            <Campo label="NIT (con dígito de verificación)">
              <input style={estilos.input} value={form.nit ?? ''} onChange={(e) => actualizarCampo('nit', e.target.value)} />
            </Campo>
            <Campo label="Tipo de sociedad">
              <select style={estilos.input} value={form.tipo_sociedad ?? ''} onChange={(e) => actualizarCampo('tipo_sociedad', e.target.value)}>
                {TIPOS_SOCIEDAD.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Campo>
            <Campo label="Fecha de constitución">
              <input type="date" style={estilos.input} value={form.fecha_constitucion ?? ''} onChange={(e) => actualizarCampo('fecha_constitucion', e.target.value)} />
            </Campo>
            <Campo label="Duración de la sociedad (fecha o 'Indefinida')">
              <input style={estilos.input} placeholder="Indefinida / 31/12/2060" value={form.duracion_sociedad ?? ''} onChange={(e) => actualizarCampo('duracion_sociedad', e.target.value)} />
            </Campo>
            <Campo label="Ciudad y dirección del domicilio principal">
              <input style={estilos.input} value={form.domicilio_ciudad_direccion ?? ''} onChange={(e) => actualizarCampo('domicilio_ciudad_direccion', e.target.value)} />
            </Campo>
            <Campo label="Sucursales o agencias">
              <input style={estilos.input} value={form.sucursales ?? ''} onChange={(e) => actualizarCampo('sucursales', e.target.value)} />
            </Campo>
            <Campo label="Fecha de expedición del certificado de Cámara de Comercio">
              <input type="date" style={estilos.input} value={form.fecha_camara_comercio ?? ''} onChange={(e) => actualizarCampo('fecha_camara_comercio', e.target.value)} />
            </Campo>
            <Campo label="Matrícula mercantil renovada hasta (año)">
              <input type="number" style={estilos.input} value={form.matricula_renovada_anio ?? ''} onChange={(e) => actualizarCampo('matricula_renovada_anio', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
          </div>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Representación legal y facultades</h2>
          <p style={estilos.ayuda}>Define si la empresa puede presentar oferta por sí sola según el valor del proceso.</p>
          <div style={estilos.grid2}>
            <Campo label="Nombre completo del representante legal">
              <input style={estilos.input} value={form.rl_nombre_completo ?? ''} onChange={(e) => actualizarCampo('rl_nombre_completo', e.target.value)} />
            </Campo>
            <Campo label="Tipo y número de documento">
              <input style={estilos.input} placeholder="CC 52.000.000" value={form.rl_tipo_num_documento ?? ''} onChange={(e) => actualizarCampo('rl_tipo_num_documento', e.target.value)} />
            </Campo>
            <Campo label="Ciudad de expedición del documento">
              <input style={estilos.input} value={form.rl_ciudad_expedicion ?? ''} onChange={(e) => actualizarCampo('rl_ciudad_expedicion', e.target.value)} />
            </Campo>
            <Campo label="Correo electrónico del representante legal">
              <input type="email" style={estilos.input} value={form.rl_correo ?? ''} onChange={(e) => actualizarCampo('rl_correo', e.target.value)} />
            </Campo>
            <Campo label="Fecha de nombramiento o posesión">
              <input type="date" style={estilos.input} value={form.rl_fecha_nombramiento ?? ''} onChange={(e) => actualizarCampo('rl_fecha_nombramiento', e.target.value)} />
            </Campo>
            <Campo label="Suplente del representante legal (nombre y documento)">
              <input style={estilos.input} value={form.rl_suplente ?? ''} onChange={(e) => actualizarCampo('rl_suplente', e.target.value)} />
            </Campo>
          </div>

          <h3 style={estilos.tituloSubseccion}>Facultades para contratar</h3>
          <div style={estilos.filaPregunta}>
            <span style={estilos.textoPregunta}>¿Tiene límite de monto para contratar?</span>
            <div style={estilos.opcionesSiNo}>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="rl_tiene_limite_monto" checked={form.rl_tiene_limite_monto === true} onChange={() => actualizarCampo('rl_tiene_limite_monto', true)} /> Sí
              </label>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="rl_tiene_limite_monto" checked={form.rl_tiene_limite_monto === false} onChange={() => actualizarCampo('rl_tiene_limite_monto', false)} /> No
              </label>
            </div>
          </div>
          {form.rl_tiene_limite_monto === true && (
            <div style={estilos.grid2}>
              <Campo label="Monto máximo que puede firmar sin autorización (COP)">
                <input type="number" step="any" style={estilos.input} value={form.rl_monto_maximo ?? ''} onChange={(e) => actualizarCampo('rl_monto_maximo', e.target.value === '' ? '' : Number(e.target.value))} />
              </Campo>
              <Campo label="Órgano que autoriza montos superiores (junta, asamblea)">
                <input style={estilos.input} value={form.rl_organo_autoriza ?? ''} onChange={(e) => actualizarCampo('rl_organo_autoriza', e.target.value)} />
              </Campo>
            </div>
          )}
          <div style={estilos.filaPregunta}>
            <span style={estilos.textoPregunta}>¿Sus facultades incluyen presentar ofertas y firmar contratos con entidades públicas?</span>
            <div style={estilos.opcionesSiNo}>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="rl_facultades_ofertar" checked={form.rl_facultades_ofertar === true} onChange={() => actualizarCampo('rl_facultades_ofertar', true)} /> Sí
              </label>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="rl_facultades_ofertar" checked={form.rl_facultades_ofertar === false} onChange={() => actualizarCampo('rl_facultades_ofertar', false)} /> No
              </label>
            </div>
          </div>
          <Campo label="Restricciones adicionales en los estatutos (descripción)">
            <textarea
              style={{ ...estilos.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.rl_restricciones_estatutarias ?? ''}
              onChange={(e) => actualizarCampo('rl_restricciones_estatutarias', e.target.value)}
            />
          </Campo>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Accionistas</h2>
          <p style={estilos.ayuda}>
            Un registro por cada socio o accionista — se usa para verificar inhabilidades, conflictos de interés y
            declaraciones de beneficiarios finales. Esta sección es opcional: puedes dejarla vacía o completarla
            después, y no hace falta adjuntar ningún documento.
          </p>

          <h3 style={estilos.tituloSubseccion}>Cargar varios accionistas a la vez</h3>
          <p style={estilos.ayuda}>
            Si tienes varios socios, es más rápido descargar la plantilla, llenarla y subirla de una sola vez.
            Puedes subirla en Excel (.xlsx) o en CSV, como prefieras.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              type="button"
              style={estilos.botonSecundario}
              disabled={preparandoPlantillaAccionistas}
              onClick={async () => {
                setPreparandoPlantillaAccionistas(true);
                setMensajeAccionistas(null);
                try {
                  await descargarPlantillaAccionistasExcel();
                } catch {
                  setMensajeAccionistas({ tipo: 'error', texto: 'No se pudo preparar la plantilla en Excel. Intenta de nuevo o descárgala en CSV.' });
                } finally {
                  setPreparandoPlantillaAccionistas(false);
                }
              }}
            >
              {preparandoPlantillaAccionistas ? 'Preparando…' : 'Descargar plantilla (Excel)'}
            </button>
            <button type="button" style={estilos.botonSecundario} onClick={descargarPlantillaAccionistasCSV}>
              Descargar plantilla (CSV)
            </button>
            <label style={{ ...estilos.boton, display: 'inline-block', cursor: 'pointer' }}>
              {importandoAccionistas ? 'Importando…' : 'Subir Excel o CSV lleno'}
              <input type="file" accept=".csv,.xlsx,.xls" onChange={manejarArchivoImportadoAccionistas} disabled={importandoAccionistas} style={{ display: 'none' }} />
            </label>
          </div>

          {mensajeAccionistas && (
            <p style={mensajeAccionistas.tipo === 'error' ? estilos.mensajeError : estilos.mensajeOk}>{mensajeAccionistas.texto}</p>
          )}

          <h3 style={estilos.tituloSubseccion}>Accionistas guardados</h3>
          {accionistas.length > 0 && (
            <p style={{ ...estilos.ayuda, fontWeight: 600, color: Math.round(sumaParticipacionAccionistas) === 100 ? '#0A7F5C' : '#C0362C' }}>
              Suma de participación: {sumaParticipacionAccionistas.toFixed(2)}% {Math.round(sumaParticipacionAccionistas) === 100 ? '✓' : '(debería sumar 100%)'}
            </p>
          )}
          {cargandoAccionistas ? (
            <p style={estilos.ayuda}>Cargando…</p>
          ) : accionistas.length === 0 && !draftAccionista ? (
            <p style={estilos.ayuda}>Todavía no has agregado ningún accionista.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {accionistas.map((a) => (
                <div key={a.id} style={estilos.filaTabla}>
                  <div>
                    <strong>{a.nombre_razon_social || 'Sin nombre'}</strong>
                    {a.porcentaje_participacion != null ? ` — ${Number(a.porcentaje_participacion)}%` : ''}
                    <div style={estilos.ayuda}>
                      {a.tipo_documento ? `${TIPOS_DOCUMENTO.find((t) => t.value === a.tipo_documento)?.label ?? a.tipo_documento}` : ''}
                      {a.numero_documento ? ` ${a.numero_documento}` : ''}
                      {a.beneficiario_final ? ' · beneficiario final' : ''}
                      {a.pep ? ' · PEP' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button type="button" style={estilos.botonSecundario} onClick={() => abrirEditarAccionista(a)}>Editar</button>
                    <button type="button" style={estilos.botonSecundario} onClick={() => eliminarAccionista(a.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {draftAccionista ? (
            <div style={estilos.tarjetaFormulario}>
              <div style={estilos.grid2}>
                <Campo label="Nombre o razón social">
                  <input style={estilos.input} value={draftAccionista.nombre_razon_social ?? ''} onChange={(e) => actualizarDraftAccionista('nombre_razon_social', e.target.value)} />
                </Campo>
                <Campo label="Tipo de documento">
                  <select style={estilos.input} value={draftAccionista.tipo_documento ?? ''} onChange={(e) => actualizarDraftAccionista('tipo_documento', e.target.value)}>
                    {TIPOS_DOCUMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Campo>
                <Campo label="Número de documento">
                  <input style={estilos.input} value={draftAccionista.numero_documento ?? ''} onChange={(e) => actualizarDraftAccionista('numero_documento', e.target.value)} />
                </Campo>
                <Campo label="% de participación">
                  <input type="number" step="any" style={estilos.input} value={draftAccionista.porcentaje_participacion ?? ''} onChange={(e) => actualizarDraftAccionista('porcentaje_participacion', e.target.value === '' ? '' : Number(e.target.value))} />
                </Campo>
                <Campo label="País de domicilio">
                  <input style={estilos.input} value={draftAccionista.pais_domicilio ?? ''} onChange={(e) => actualizarDraftAccionista('pais_domicilio', e.target.value)} />
                </Campo>
              </div>

              <PreguntaSiNo texto="¿Beneficiario final?" valor={draftAccionista.beneficiario_final} onChange={(v) => actualizarDraftAccionista('beneficiario_final', v)} />
              <PreguntaSiNo texto="¿Persona expuesta políticamente (PEP)?" valor={draftAccionista.pep} onChange={(v) => actualizarDraftAccionista('pep', v)} />
              <PreguntaSiNo texto="¿Es servidor público o pariente de uno?" valor={draftAccionista.servidor_publico_pariente} onChange={(v) => actualizarDraftAccionista('servidor_publico_pariente', v)} />
              <PreguntaSiNo texto="¿Es representante legal o directivo?" valor={draftAccionista.representante_legal_directivo} onChange={(v) => actualizarDraftAccionista('representante_legal_directivo', v)} />

              <Campo label="Observaciones">
                <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={draftAccionista.observaciones ?? ''} onChange={(e) => actualizarDraftAccionista('observaciones', e.target.value)} />
              </Campo>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" style={estilos.botonSecundario} onClick={cancelarAccionista}>Cancelar</button>
                <button type="button" disabled={guardandoAccionista} style={estilos.boton} onClick={guardarAccionista}>{guardandoAccionista ? 'Guardando…' : 'Guardar accionista'}</button>
              </div>
            </div>
          ) : (
            <button type="button" style={estilos.botonSecundario} onClick={abrirNuevoAccionista}>+ Agregar un accionista</button>
          )}
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Actividad económica</h2>
          <div style={estilos.grid2}>
            <Campo label="Actividad económica principal (código CIIU y descripción)">
              <input style={estilos.input} placeholder="6201 – Desarrollo de sistemas informáticos" value={form.ciiu_principal ?? ''} onChange={(e) => actualizarCampo('ciiu_principal', e.target.value)} />
            </Campo>
            <Campo label="Actividades económicas secundarias (CIIU)">
              <input style={estilos.input} placeholder="6202; 6311" value={form.ciiu_secundarios ?? ''} onChange={(e) => actualizarCampo('ciiu_secundarios', e.target.value)} />
            </Campo>
            <Campo label="Responsabilidades tributarias del RUT">
              <input style={estilos.input} placeholder="05 – Renta; 48 – IVA" value={form.responsabilidades_tributarias ?? ''} onChange={(e) => actualizarCampo('responsabilidades_tributarias', e.target.value)} />
            </Campo>
            <Campo label="Tamaño de la empresa">
              <select style={estilos.input} value={form.tamano_empresa ?? ''} onChange={(e) => actualizarCampo('tamano_empresa', e.target.value)}>
                {TAMANOS_EMPRESA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Campo>
          </div>
          <Campo label="Objeto social (texto completo, copiado de la Cámara de Comercio, sin resumir)">
            <textarea
              style={{ ...estilos.input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.objeto_social ?? ''}
              onChange={(e) => actualizarCampo('objeto_social', e.target.value)}
            />
          </Campo>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Contacto</h2>
          <div style={estilos.grid2}>
            <Campo label="Correo electrónico de notificaciones">
              <input type="email" style={estilos.input} value={form.correo_notificaciones ?? ''} onChange={(e) => actualizarCampo('correo_notificaciones', e.target.value)} />
            </Campo>
            <Campo label="Teléfono de contacto">
              <input style={estilos.input} value={form.telefono_contacto ?? ''} onChange={(e) => actualizarCampo('telefono_contacto', e.target.value)} />
            </Campo>
            <Campo label="Sitio web">
              <input style={estilos.input} value={form.sitio_web ?? ''} onChange={(e) => actualizarCampo('sitio_web', e.target.value)} />
            </Campo>
          </div>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Cumplimiento y antecedentes</h2>
          <p style={estilos.ayuda}>Respóndelas una sola vez. Con esto al día, el checklist de cumplimiento de cualquier proceso nuevo se da por resuelto automáticamente.</p>

          <h3 style={estilos.tituloSubseccion}>Checklist general de viabilidad</h3>
          <p style={estilos.ayuda}>Un vistazo rápido de si la empresa está en capacidad de participar, antes de entrar al detalle.</p>
          {PREGUNTAS_CHECKLIST_GENERAL.map((p) => (
            <PreguntaSiNo key={p.key} texto={p.texto} valor={form[p.key]} onChange={(v) => actualizarCampo(p.key, v)} />
          ))}

          <h3 style={estilos.tituloSubseccion}>Contabilidad y revisoría fiscal</h3>
          <PreguntaSiNo texto="¿Tiene revisor fiscal?" valor={form.cump_tiene_revisor_fiscal} onChange={(v) => actualizarCampo('cump_tiene_revisor_fiscal', v)} />
          <div style={estilos.grid2}>
            {form.cump_tiene_revisor_fiscal === true && (
              <Campo label="Nombre y T.P. del revisor fiscal">
                <input style={estilos.input} placeholder="Juan Pérez – T.P. 12345-T" value={form.cump_revisor_fiscal_nombre_tp ?? ''} onChange={(e) => actualizarCampo('cump_revisor_fiscal_nombre_tp', e.target.value)} />
              </Campo>
            )}
            <Campo label="Nombre y T.P. del contador público">
              <input style={estilos.input} placeholder="Laura Díaz – T.P. 67890-T" value={form.cump_contador_nombre_tp ?? ''} onChange={(e) => actualizarCampo('cump_contador_nombre_tp', e.target.value)} />
            </Campo>
          </div>

          <h3 style={estilos.tituloSubseccion}>Seguridad social y parafiscales</h3>
          <PreguntaSiNo
            texto="¿Puedes contar con un certificado de pago a seguridad social y parafiscales menor a 30 días?"
            valor={form.cump_certificado_ss_parafiscales_30d}
            onChange={(v) => actualizarCampo('cump_certificado_ss_parafiscales_30d', v)}
          />
          <PreguntaSiNo
            texto="¿Está al día en aportes (sin deudas ni mora)?"
            valor={form.cump_aportes_al_dia}
            onChange={(v) => actualizarCampo('cump_aportes_al_dia', v)}
          />

          <h3 style={estilos.tituloSubseccion}>Antecedentes</h3>
          <p style={estilos.ayuda}>Consulta cada uno en la entidad correspondiente y selecciona el resultado.</p>
          <div style={estilos.grid2}>
            {PREGUNTAS_ANTECEDENTES.map((p) => (
              <Campo key={p.key} label={p.texto}>
                <select style={estilos.input} value={form[p.key] ?? ''} onChange={(e) => actualizarCampo(p.key, e.target.value)}>
                  {OPCIONES_ANTECEDENTES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Campo>
            ))}
          </div>

          <h3 style={estilos.tituloSubseccion}>Sanciones y contingencias</h3>
          <div style={estilos.filaPregunta}>
            <span style={estilos.textoPregunta}>¿Ha tenido multas, sanciones, caducidades o incumplimientos con entidades estatales en los últimos 5 años?</span>
            <div style={estilos.opcionesSiNo}>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="cump_tiene_sanciones_5_anios" checked={form.cump_tiene_sanciones_5_anios === true} onChange={() => actualizarCampo('cump_tiene_sanciones_5_anios', true)} /> Sí
              </label>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="cump_tiene_sanciones_5_anios" checked={form.cump_tiene_sanciones_5_anios === false} onChange={() => actualizarCampo('cump_tiene_sanciones_5_anios', false)} /> No
              </label>
            </div>
          </div>
          {form.cump_tiene_sanciones_5_anios === true && (
            <Campo label="Detalle de multas, sanciones o incumplimientos (entidad, fecha, valor, estado)">
              <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={form.cump_detalle_sanciones ?? ''} onChange={(e) => actualizarCampo('cump_detalle_sanciones', e.target.value)} />
            </Campo>
          )}
          <div style={estilos.filaPregunta}>
            <span style={estilos.textoPregunta}>¿Tiene procesos judiciales, arbitrales o embargos relevantes en su contra?</span>
            <div style={estilos.opcionesSiNo}>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="cump_tiene_procesos_judiciales" checked={form.cump_tiene_procesos_judiciales === true} onChange={() => actualizarCampo('cump_tiene_procesos_judiciales', true)} /> Sí
              </label>
              <label style={estilos.opcionSiNo}>
                <input type="radio" name="cump_tiene_procesos_judiciales" checked={form.cump_tiene_procesos_judiciales === false} onChange={() => actualizarCampo('cump_tiene_procesos_judiciales', false)} /> No
              </label>
            </div>
          </div>
          {form.cump_tiene_procesos_judiciales === true && (
            <Campo label="Detalle de esos procesos (cuantía, estado)">
              <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={form.cump_detalle_procesos_judiciales ?? ''} onChange={(e) => actualizarCampo('cump_detalle_procesos_judiciales', e.target.value)} />
            </Campo>
          )}

          <h3 style={estilos.tituloSubseccion}>Sistemas de gestión y contratación electrónica</h3>
          <div style={estilos.grid2}>
            <Campo label="Puntaje de autoevaluación SG-SST (Resolución 0312 de 2019) — %">
              <input type="number" step="any" style={estilos.input} value={form.cump_puntaje_sgsst ?? ''} onChange={(e) => actualizarCampo('cump_puntaje_sgsst', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
          </div>
          {PREGUNTAS_CUMPLIMIENTO_SINO.filter((p) =>
            ['cump_politica_proteccion_datos', 'cump_programa_etica_sarlaft', 'cump_secop_ii_activo'].includes(p.key)
          ).map((p) => (
            <PreguntaSiNo key={p.key} texto={p.texto} valor={form[p.key]} onChange={(v) => actualizarCampo(p.key, v)} />
          ))}
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Cupos y garantías</h2>
          <p style={estilos.ayuda}>Para respaldar las pólizas que piden los procesos (seriedad de la oferta, cumplimiento, entre otras).</p>
          <PreguntaSiNo
            texto="¿Cuenta con un corredor de seguros para expedir garantía de seriedad?"
            valor={form.cupos_corredor_seguros_seriedad}
            onChange={(v) => actualizarCampo('cupos_corredor_seguros_seriedad', v)}
          />
          <PreguntaSiNo
            texto="¿Tiene capacidad de expedir pólizas de cumplimiento?"
            valor={form.cupos_capacidad_polizas_cumplimiento}
            onChange={(v) => actualizarCampo('cupos_capacidad_polizas_cumplimiento', v)}
          />
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Capacidades y portafolio</h2>
          <p style={estilos.ayuda}>Infraestructura, esquema de soporte, metodologías y servicios — esto es lo que se cruza contra lo que pide cada pliego.</p>
          <Campo label="Infraestructura y herramientas propias (licencias, plataformas, laboratorios)">
            <textarea style={{ ...estilos.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={form.cap_infraestructura_herramientas ?? ''} onChange={(e) => actualizarCampo('cap_infraestructura_herramientas', e.target.value)} />
          </Campo>
          <Campo label="Sedes y ciudades donde tiene presencia">
            <input style={estilos.input} placeholder="Bogotá (sede principal); equipo remoto en el resto del país" value={form.cap_sedes_ciudades ?? ''} onChange={(e) => actualizarCampo('cap_sedes_ciudades', e.target.value)} />
          </Campo>
          <Campo label="Esquema de soporte o mesa de ayuda (horario, canales, tiempos de respuesta)">
            <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={form.cap_esquema_soporte ?? ''} onChange={(e) => actualizarCampo('cap_esquema_soporte', e.target.value)} />
          </Campo>
          <Campo label="Metodologías que aplica (PMI, Scrum, ITIL, etc.)">
            <input style={estilos.input} placeholder="PMI; Scrum; ITIL 4" value={form.cap_metodologias ?? ''} onChange={(e) => actualizarCampo('cap_metodologias', e.target.value)} />
          </Campo>
          <Campo label="Servicios y soluciones principales">
            <textarea style={{ ...estilos.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={form.cap_servicios_principales ?? ''} onChange={(e) => actualizarCampo('cap_servicios_principales', e.target.value)} />
          </Campo>
          <Campo label="Sectores en los que tiene experiencia">
            <input style={estilos.input} placeholder="Financiero, salud, gobierno" value={form.cap_sectores_experiencia ?? ''} onChange={(e) => actualizarCampo('cap_sectores_experiencia', e.target.value)} />
          </Campo>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Certificaciones de la empresa</h2>
          <p style={estilos.ayuda}>
            ISO, partner de fabricante (Microsoft, AWS, Google, etc.) u otras certificaciones de la empresa.
            Esta sección es opcional, y no hace falta adjuntar el soporte.
          </p>

          <h3 style={estilos.tituloSubseccion}>Cargar varias certificaciones a la vez</h3>
          <p style={estilos.ayuda}>Puedes subir la plantilla llena en Excel (.xlsx) o en CSV, como prefieras.</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              type="button"
              style={estilos.botonSecundario}
              disabled={preparandoPlantillaCertificacionesEmpresa}
              onClick={async () => {
                setPreparandoPlantillaCertificacionesEmpresa(true);
                setMensajeCertificacionesEmpresa(null);
                try {
                  await descargarPlantillaCertificacionesEmpresaExcel();
                } catch {
                  setMensajeCertificacionesEmpresa({ tipo: 'error', texto: 'No se pudo preparar la plantilla en Excel. Intenta de nuevo o descárgala en CSV.' });
                } finally {
                  setPreparandoPlantillaCertificacionesEmpresa(false);
                }
              }}
            >
              {preparandoPlantillaCertificacionesEmpresa ? 'Preparando…' : 'Descargar plantilla (Excel)'}
            </button>
            <button type="button" style={estilos.botonSecundario} onClick={descargarPlantillaCertificacionesEmpresaCSV}>
              Descargar plantilla (CSV)
            </button>
            <label style={{ ...estilos.boton, display: 'inline-block', cursor: 'pointer' }}>
              {importandoCertificacionesEmpresa ? 'Importando…' : 'Subir Excel o CSV lleno'}
              <input type="file" accept=".csv,.xlsx,.xls" onChange={manejarArchivoImportadoCertificacionesEmpresa} disabled={importandoCertificacionesEmpresa} style={{ display: 'none' }} />
            </label>
          </div>

          {mensajeCertificacionesEmpresa && (
            <p style={mensajeCertificacionesEmpresa.tipo === 'error' ? estilos.mensajeError : estilos.mensajeOk}>{mensajeCertificacionesEmpresa.texto}</p>
          )}

          <h3 style={estilos.tituloSubseccion}>Certificaciones guardadas</h3>
          {cargandoCertificacionesEmpresa ? (
            <p style={estilos.ayuda}>Cargando…</p>
          ) : certificacionesEmpresa.length === 0 && !draftCertificacionEmpresa ? (
            <p style={estilos.ayuda}>Todavía no has agregado ninguna certificación.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {certificacionesEmpresa.map((c) => (
                <div key={c.id} style={estilos.filaTabla}>
                  <div>
                    <strong>{c.norma_programa_nombre || 'Sin nombre'}</strong>
                    {c.entidad_certificadora ? ` — ${c.entidad_certificadora}` : ''}
                    <div style={estilos.ayuda}>
                      {c.tipo ? `${TIPOS_CERTIFICACION_EMPRESA.find((t) => t.value === c.tipo)?.label ?? c.tipo}` : ''}
                      {c.fecha_vencimiento ? ` · vence ${String(c.fecha_vencimiento).slice(0, 10)}` : ' · sin vencimiento'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button type="button" style={estilos.botonSecundario} onClick={() => abrirEditarCertificacionEmpresa(c)}>Editar</button>
                    <button type="button" style={estilos.botonSecundario} onClick={() => eliminarCertificacionEmpresa(c.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {draftCertificacionEmpresa ? (
            <div style={estilos.tarjetaFormulario}>
              <div style={estilos.grid2}>
                <Campo label="Tipo">
                  <select style={estilos.input} value={draftCertificacionEmpresa.tipo ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('tipo', e.target.value)}>
                    {TIPOS_CERTIFICACION_EMPRESA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Campo>
                <Campo label="Norma, programa o nombre">
                  <input style={estilos.input} placeholder="ISO 27001:2022" value={draftCertificacionEmpresa.norma_programa_nombre ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('norma_programa_nombre', e.target.value)} />
                </Campo>
                <Campo label="Entidad certificadora o fabricante">
                  <input style={estilos.input} placeholder="Icontec" value={draftCertificacionEmpresa.entidad_certificadora ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('entidad_certificadora', e.target.value)} />
                </Campo>
                <Campo label="Alcance o nivel">
                  <input style={estilos.input} placeholder="Desarrollo y soporte de software / nivel Gold" value={draftCertificacionEmpresa.alcance_nivel ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('alcance_nivel', e.target.value)} />
                </Campo>
                <Campo label="Fecha de emisión">
                  <input type="date" style={estilos.input} value={draftCertificacionEmpresa.fecha_emision ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('fecha_emision', e.target.value)} />
                </Campo>
                <Campo label="Fecha de vencimiento">
                  <input type="date" style={estilos.input} value={draftCertificacionEmpresa.fecha_vencimiento ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('fecha_vencimiento', e.target.value)} />
                </Campo>
              </div>

              <Campo label="Observaciones">
                <textarea style={{ ...estilos.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} value={draftCertificacionEmpresa.observaciones ?? ''} onChange={(e) => actualizarDraftCertificacionEmpresa('observaciones', e.target.value)} />
              </Campo>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" style={estilos.botonSecundario} onClick={cancelarCertificacionEmpresa}>Cancelar</button>
                <button type="button" disabled={guardandoCertificacionEmpresa} style={estilos.boton} onClick={guardarCertificacionEmpresa}>{guardandoCertificacionEmpresa ? 'Guardando…' : 'Guardar certificación'}</button>
              </div>
            </div>
          ) : (
            <button type="button" style={estilos.botonSecundario} onClick={abrirNuevaCertificacionEmpresa}>+ Agregar una certificación</button>
          )}
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Factores ponderables</h2>
          <p style={estilos.ayuda}>Datos para anticipar el puntaje adicional que dan algunos pliegos (MIPYME, industria nacional, discapacidad, mujeres).</p>

          <PreguntaSiNo texto="¿Es MIPYME?" valor={form.pond_es_mipyme} onChange={(v) => actualizarCampo('pond_es_mipyme', v)} />
          {form.pond_es_mipyme === true && (
            <div style={estilos.grid2}>
              <Campo label="Quién certifica la condición de MIPYME">
                <input style={estilos.input} placeholder="Contador público / revisor fiscal" value={form.pond_mipyme_quien_certifica ?? ''} onChange={(e) => actualizarCampo('pond_mipyme_quien_certifica', e.target.value)} />
              </Campo>
              <Campo label="Fecha de la certificación de MIPYME">
                <input type="date" style={estilos.input} value={form.pond_mipyme_fecha_certificacion ?? ''} onChange={(e) => actualizarCampo('pond_mipyme_fecha_certificacion', e.target.value)} />
              </Campo>
            </div>
          )}

          <PreguntaSiNo texto="¿Los servicios ofrecidos califican como de origen nacional?" valor={form.pond_origen_nacional} onChange={(v) => actualizarCampo('pond_origen_nacional', v)} />

          <Campo label="Número de personas con discapacidad vinculadas en nómina">
            <input type="number" style={estilos.input} value={form.pond_num_personas_discapacidad ?? ''} onChange={(e) => actualizarCampo('pond_num_personas_discapacidad', e.target.value === '' ? '' : Number(e.target.value))} />
          </Campo>
          {Number(form.pond_num_personas_discapacidad) > 0 && (
            <>
              <div style={estilos.grid2}>
                <Campo label="Fecha de la vinculación más reciente de personas con discapacidad">
                  <input type="date" style={estilos.input} value={form.pond_fecha_vinculacion_discapacidad ?? ''} onChange={(e) => actualizarCampo('pond_fecha_vinculacion_discapacidad', e.target.value)} />
                </Campo>
              </div>
              <PreguntaSiNo
                texto="¿Tiene certificado del Ministerio de Trabajo sobre personas con discapacidad?"
                valor={form.pond_certificado_mintrabajo_discapacidad}
                onChange={(v) => actualizarCampo('pond_certificado_mintrabajo_discapacidad', v)}
              />
            </>
          )}

          <Campo label="Participación de mujeres en cargos directivos o en el capital">
            <input style={estilos.input} placeholder="60% del capital; gerente mujer" value={form.pond_participacion_mujeres ?? ''} onChange={(e) => actualizarCampo('pond_participacion_mujeres', e.target.value)} />
          </Campo>
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Portafolio de servicios</h2>
          <p style={estilos.ayuda}>Esto es lo que el motor de evaluación usa para encontrar procesos que te apliquen.</p>
          <Campo label="Códigos UNSPSC en los que estás registrada (separados por comas)">
            <input
              style={estilos.input}
              placeholder="Ej: 43211500, 81112501"
              value={form.unspsc_codigos ?? ''}
              onChange={(e) => actualizarCampo('unspsc_codigos', e.target.value)}
            />
          </Campo>
          <Campo label="¿A qué se dedica la empresa? (párrafo libre)">
            <textarea
              style={{ ...estilos.input, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Describe el tipo de proyectos y servicios que maneja la empresa..."
              value={form.descripcion_servicios ?? ''}
              onChange={(e) => actualizarCampo('descripcion_servicios', e.target.value)}
            />
          </Campo>
        </section>

        <div style={estilos.pieFormulario}>
          {mensaje && (
            <span style={mensaje.tipo === 'ok' ? estilos.mensajeOk : estilos.mensajeError}>{mensaje.texto}</span>
          )}
          <button type="submit" disabled={guardando} style={estilos.boton}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </main>
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

const estilos = {
  pagina: { maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#12181F' },
  titulo: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  subtitulo: { color: '#5B6572', marginBottom: 32, lineHeight: 1.5 },
  formulario: { display: 'flex', flexDirection: 'column', gap: 32 },
  seccion: { border: '1px solid #E3E7EC', borderRadius: 12, padding: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E3E7EC' },
  tab: { padding: '10px 16px', textDecoration: 'none', color: '#5B6572', fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent' },
  tabActiva: { color: '#12181F', borderBottom: '2px solid #12181F' },
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
  pieFormulario: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  boton: { background: '#12181F', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  botonSecundario: { background: '#fff', color: '#12181F', border: '1px solid #D0D5DD', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C0362C', fontSize: 14 },
};
