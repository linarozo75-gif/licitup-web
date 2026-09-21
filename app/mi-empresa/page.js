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

const INDICADORES_FINANCIEROS = [
  { key: 'fin_indice_liquidez', label: 'Índice de Liquidez' },
  { key: 'fin_indice_endeudamiento', label: 'Índice de Endeudamiento (%)' },
  { key: 'fin_razon_cobertura_intereses', label: 'Razón de Cobertura de Intereses' },
  { key: 'fin_capital_trabajo', label: 'Capital de Trabajo (COP)' },
  { key: 'fin_rentabilidad_patrimonio', label: 'Rentabilidad del Patrimonio (%)' },
  { key: 'fin_rentabilidad_activo', label: 'Rentabilidad del Activo (%)' },
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

const ESTADOS_RUP = [
  { value: '', label: 'Selecciona...' },
  { value: 'en_firme', label: 'En firme' },
  { value: 'en_proceso_renovacion', label: 'En proceso de renovación' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'cancelado', label: 'Cancelado' },
];

// Documentos financieros adicionales al RUP (Módulo 5): antes se pedía adjuntar, ahora solo Sí/No
// "dependeDe" = solo se muestra si esa otra pregunta del formulario está en Sí
const DOCUMENTOS_FINANCIEROS_ADICIONALES = [
  { key: 'fin_doc_estados_financieros_notas', texto: 'Estados financieros del último cierre con notas' },
  { key: 'fin_doc_dictamen_revisor_fiscal', texto: '¿Los estados financieros tienen dictamen del revisor fiscal?', dependeDe: 'cump_tiene_revisor_fiscal' },
  { key: 'fin_doc_declaracion_renta', texto: 'Declaración de renta del último año gravable' },
  { key: 'fin_doc_certificacion_bancaria', texto: 'Certificación bancaria' },
];

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

  useEffect(() => {
    fetch('/api/mi-empresa')
      .then((r) => r.json())
      .then((data) => {
        if (data.empresa) {
          const empresa = { ...data.empresa };
          // Las fechas llegan como timestamp ISO completo; los campos <input type="date"> solo entienden "aaaa-mm-dd"
          for (const campoFecha of ['fecha_constitucion', 'fecha_camara_comercio', 'rl_fecha_nombramiento', 'fin_fecha_renovacion_rup', 'fin_fecha_corte_informacion']) {
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

  if (cargando) {
    return <main style={estilos.pagina}><p>Cargando perfil…</p></main>;
  }

  return (
    <main style={estilos.pagina}>
      <h1 style={estilos.titulo}>Mi Empresa</h1>
      <p style={estilos.subtitulo}>
        Este perfil alimenta el motor de evaluación. Puedes guardarlo incompleto y volver después —
        lo que falte simplemente no se podrá verificar todavía.
      </p>

      <form onSubmit={guardar} style={estilos.formulario}>
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
          <h2 style={estilos.tituloSeccion}>Financiero</h2>
          <p style={estilos.ayuda}>Los datos base (en COP) permiten recalcular los indicadores automáticamente y combinarlos cuando se oferta en Unión Temporal o Consorcio.</p>

          <h3 style={estilos.tituloSubseccion}>Registro Único de Proponentes (RUP)</h3>
          <div style={estilos.grid2}>
            <Campo label="Estado del RUP">
              <select style={estilos.input} value={form.fin_estado_rup ?? ''} onChange={(e) => actualizarCampo('fin_estado_rup', e.target.value)}>
                {ESTADOS_RUP.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Campo>
            <Campo label="Fecha de renovación del RUP">
              <input type="date" style={estilos.input} value={form.fin_fecha_renovacion_rup ?? ''} onChange={(e) => actualizarCampo('fin_fecha_renovacion_rup', e.target.value)} />
            </Campo>
            <Campo label="Fecha de corte de la información financiera del RUP">
              <input type="date" style={estilos.input} value={form.fin_fecha_corte_informacion ?? ''} onChange={(e) => actualizarCampo('fin_fecha_corte_informacion', e.target.value)} />
            </Campo>
            <Campo label="Capacidad de contratación K residual — COP (solo obra pública)">
              <input type="number" step="any" style={estilos.input} value={form.fin_k_residual ?? ''} onChange={(e) => actualizarCampo('fin_k_residual', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
          </div>

          <h3 style={estilos.tituloSubseccion}>Datos base (cifras en COP, tomadas del RUP o de los estados financieros)</h3>
          <div style={estilos.grid2}>
            <Campo label="Activo corriente"><input type="number" step="any" style={estilos.input} value={form.fin_activo_corriente ?? ''} onChange={(e) => actualizarCampo('fin_activo_corriente', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Activo total"><input type="number" step="any" style={estilos.input} value={form.fin_activo_total ?? ''} onChange={(e) => actualizarCampo('fin_activo_total', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Pasivo corriente"><input type="number" step="any" style={estilos.input} value={form.fin_pasivo_corriente ?? ''} onChange={(e) => actualizarCampo('fin_pasivo_corriente', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Pasivo total"><input type="number" step="any" style={estilos.input} value={form.fin_pasivo_total ?? ''} onChange={(e) => actualizarCampo('fin_pasivo_total', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Patrimonio"><input type="number" step="any" style={estilos.input} value={form.fin_patrimonio ?? ''} onChange={(e) => actualizarCampo('fin_patrimonio', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Ingresos operacionales"><input type="number" step="any" style={estilos.input} value={form.fin_ingresos_operacionales ?? ''} onChange={(e) => actualizarCampo('fin_ingresos_operacionales', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Utilidad operacional"><input type="number" step="any" style={estilos.input} value={form.fin_utilidad_operacional ?? ''} onChange={(e) => actualizarCampo('fin_utilidad_operacional', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Utilidad neta"><input type="number" step="any" style={estilos.input} value={form.fin_utilidad_neta ?? ''} onChange={(e) => actualizarCampo('fin_utilidad_neta', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
            <Campo label="Gastos de intereses"><input type="number" step="any" style={estilos.input} value={form.fin_gastos_intereses ?? ''} onChange={(e) => actualizarCampo('fin_gastos_intereses', e.target.value === '' ? '' : Number(e.target.value))} /></Campo>
          </div>

          <h3 style={estilos.tituloSubseccion}>Indicadores tal como aparecen en el RUP</h3>
          <Campo label="Régimen">
            <select style={estilos.input} value={form.fin_regimen ?? 'normal'} onChange={(e) => actualizarCampo('fin_regimen', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="mipyme">Mipyme</option>
            </select>
          </Campo>
          <div style={estilos.grid2}>
            <Campo label="Índice de Liquidez">
              <input type="number" step="any" style={estilos.input} value={form.fin_indice_liquidez ?? ''} onChange={(e) => actualizarCampo('fin_indice_liquidez', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
            <Campo label="Índice de Endeudamiento (%)">
              <input type="number" step="any" style={estilos.input} value={form.fin_indice_endeudamiento ?? ''} onChange={(e) => actualizarCampo('fin_indice_endeudamiento', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
            <Campo label="Razón de Cobertura de Intereses (número, o escribe 'Indeterminado')">
              <input style={estilos.input} placeholder="11.71 / Indeterminado" value={form.fin_razon_cobertura_intereses ?? ''} onChange={(e) => actualizarCampo('fin_razon_cobertura_intereses', e.target.value)} />
            </Campo>
            <Campo label="Capital de Trabajo (COP)">
              <input type="number" step="any" style={estilos.input} value={form.fin_capital_trabajo ?? ''} onChange={(e) => actualizarCampo('fin_capital_trabajo', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
            <Campo label="Rentabilidad del Patrimonio — ROE (%)">
              <input type="number" step="any" style={estilos.input} value={form.fin_rentabilidad_patrimonio ?? ''} onChange={(e) => actualizarCampo('fin_rentabilidad_patrimonio', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
            <Campo label="Rentabilidad del Activo — ROA (%)">
              <input type="number" step="any" style={estilos.input} value={form.fin_rentabilidad_activo ?? ''} onChange={(e) => actualizarCampo('fin_rentabilidad_activo', e.target.value === '' ? '' : Number(e.target.value))} />
            </Campo>
          </div>

          <h3 style={estilos.tituloSubseccion}>Documentos financieros adicionales al RUP</h3>
          <p style={estilos.ayuda}>Solo marca si los tienes disponibles — no hace falta adjuntarlos aquí.</p>
          {DOCUMENTOS_FINANCIEROS_ADICIONALES
            .filter((p) => !p.dependeDe || form[p.dependeDe] === true)
            .map((p) => (
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
  pieFormulario: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  boton: { background: '#12181F', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C0362C', fontSize: 14 },
};
