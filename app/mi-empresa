'use client';

import { useEffect, useState } from 'react';

const CAMPOS_INICIALES = {
  razon_social: '',
  nit: '',
  representante_legal: '',
  revisor_fiscal: '',
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
          setForm({ ...CAMPOS_INICIALES, ...data.empresa });
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
      const res = await fetch('/api/mi-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
          <div style={estilos.grid2}>
            <Campo label="Razón social">
              <input style={estilos.input} value={form.razon_social ?? ''} onChange={(e) => actualizarCampo('razon_social', e.target.value)} />
            </Campo>
            <Campo label="NIT">
              <input style={estilos.input} value={form.nit ?? ''} onChange={(e) => actualizarCampo('nit', e.target.value)} />
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
