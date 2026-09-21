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
  representante_legal: '',
  revisor_fiscal: '',
  ciiu_principal: '',
  ciiu_secundarios: '',
  objeto_social: '',
  responsabilidades_tributarias: '',
  tamano_empresa: '',
  correo_notificaciones: '',
  telefono_contacto: '',
  sitio_web: '',
  jur_camara_comercio_vigente: null,
  jur_antecedentes_ok: null,
  jur_formatos_propios_ok: null,
  jur_parafiscales_revisor_ok: null,
  jur_rut_vigente: null,
  jur_documentos_financieros_ok: null,
  fin_regimen: 'normal',
  fin_indice_liquidez: '',
  fin_indice_endeudamiento: '',
  fin_razon_cobertura_intereses: '',
  fin_capital_trabajo: '',
  fin_rentabilidad_patrimonio: '',
  fin_rentabilidad_activo: '',
  unspsc_codigos: '',
  descripcion_servicios: '',
};

const PREGUNTAS_JURIDICAS = [
  { key: 'jur_camara_comercio_vigente', texto: '¿Siempre puedes obtener una Cámara de Comercio vigente antes del cierre?' },
  { key: 'jur_antecedentes_ok', texto: '¿Puedes tramitar antecedentes de Procuraduría, Contraloría, Policía, RNMC y REDAM sin problema?' },
  { key: 'jur_formatos_propios_ok', texto: '¿Estás en capacidad de diligenciar los formatos propios que pida cada entidad (anticorrupción, tratamiento de datos, compromiso de integridad, etc.)?' },
  { key: 'jur_parafiscales_revisor_ok', texto: '¿Cuentas con certificado de Paz y salvo de parafiscales menor a 30 días y documentos del revisor fiscal si aplica?' },
  { key: 'jur_rut_vigente', texto: '¿Cuentas con RUT vigente?' },
  { key: 'jur_documentos_financieros_ok', texto: '¿Cuentas con documentos financieros (estados financieros del último año, certificación bancaria, declaración de renta al día, documentos del contador y revisor fiscal si aplica), entre otros?' },
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
          for (const campoFecha of ['fecha_constitucion', 'fecha_camara_comercio']) {
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
            <Campo label="Representante legal">
              <input style={estilos.input} value={form.representante_legal ?? ''} onChange={(e) => actualizarCampo('representante_legal', e.target.value)} />
            </Campo>
            <Campo label="Revisor fiscal (si aplica)">
              <input style={estilos.input} value={form.revisor_fiscal ?? ''} onChange={(e) => actualizarCampo('revisor_fiscal', e.target.value)} />
            </Campo>
          </div>
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
          <h2 style={estilos.tituloSeccion}>Capacidad jurídica</h2>
          <p style={estilos.ayuda}>Respóndelas una sola vez. Con todas en "Sí", el checklist jurídico de cualquier proceso nuevo se da por cumplido automáticamente.</p>
          {PREGUNTAS_JURIDICAS.map((p) => (
            <div key={p.key} style={estilos.filaPregunta}>
              <span style={estilos.textoPregunta}>{p.texto}</span>
              <div style={estilos.opcionesSiNo}>
                <label style={estilos.opcionSiNo}>
                  <input
                    type="radio"
                    name={p.key}
                    checked={form[p.key] === true}
                    onChange={() => actualizarCampo(p.key, true)}
                  /> Sí
                </label>
                <label style={estilos.opcionSiNo}>
                  <input
                    type="radio"
                    name={p.key}
                    checked={form[p.key] === false}
                    onChange={() => actualizarCampo(p.key, false)}
                  /> No
                </label>
              </div>
            </div>
          ))}
        </section>

        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Indicadores financieros</h2>
          <Campo label="Régimen">
            <select style={estilos.input} value={form.fin_regimen ?? 'normal'} onChange={(e) => actualizarCampo('fin_regimen', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="mipyme">Mipyme</option>
            </select>
          </Campo>
          <div style={estilos.grid2}>
            {INDICADORES_FINANCIEROS.map((f) => (
              <Campo key={f.key} label={f.label}>
                <input
                  type="number"
                  step="any"
                  style={estilos.input}
                  value={form[f.key] ?? ''}
                  onChange={(e) => actualizarCampo(f.key, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Campo>
            ))}
          </div>
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
