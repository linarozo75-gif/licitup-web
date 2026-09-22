'use client';

import { useEffect, useState } from 'react';

const ESTADOS_RUP = [
  { value: '', label: 'Selecciona...' },
  { value: 'en_firme', label: 'En firme' },
  { value: 'en_proceso_renovacion', label: 'En proceso de renovación' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'cancelado', label: 'Cancelado' },
];

// Documentos financieros adicionales al RUP: antes se pedía adjuntar, ahora solo Sí/No.
// "dependeDe" = solo se muestra si esa otra pregunta del formulario (de esta misma página) está en Sí.
const DOCUMENTOS_FINANCIEROS_ADICIONALES = [
  { key: 'fin_doc_estados_financieros_notas', texto: 'Estados financieros del último cierre con notas' },
  { key: 'fin_doc_dictamen_revisor_fiscal', texto: '¿Los estados financieros tienen dictamen del revisor fiscal?', dependeDe: 'cump_tiene_revisor_fiscal' },
  { key: 'fin_doc_declaracion_renta', texto: 'Declaración de renta del último año gravable' },
  { key: 'fin_doc_certificacion_bancaria', texto: 'Certificación bancaria' },
];

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

export default function FinancieroPage() {
  // Se carga el perfil COMPLETO de la empresa (no solo lo financiero) y se guarda completo también —
  // así lo que se edita en las otras pestañas (Mi Empresa, etc.) nunca se pierde al guardar aquí.
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    fetch('/api/mi-empresa')
      .then((r) => r.json())
      .then((data) => {
        const empresa = { ...(data.empresa ?? {}) };
        for (const campoFecha of ['fin_fecha_renovacion_rup', 'fin_fecha_corte_informacion']) {
          if (empresa[campoFecha]) {
            empresa[campoFecha] = String(empresa[campoFecha]).slice(0, 10);
          }
        }
        setForm(empresa);
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
      // Un campo vacío se manda como null — así "guardar incompleto" funciona en cualquier campo.
      // El resto de los campos del perfil (los de las otras pestañas) viajan tal cual estaban.
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])
      );
      const res = await fetch('/api/mi-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save_failed');
      setMensaje({ tipo: 'ok', texto: 'Datos financieros guardados.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando || !form) {
    return <main style={estilos.pagina}><p>Cargando…</p></main>;
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
        <a href="/mi-empresa/talento" style={estilos.tab}>Talento</a>
        <a href="/mi-empresa/financiero" style={{ ...estilos.tab, ...estilos.tabActiva }}>Financiero</a>
      </nav>

      <h1 style={estilos.titulo}>Financiero</h1>
      <p style={estilos.subtitulo}>
        Los datos base (en COP) permiten recalcular los indicadores automáticamente y combinarlos cuando
        se oferta en Unión Temporal o Consorcio. Puedes guardarlo incompleto y volver después.
      </p>

      <form onSubmit={guardar} style={estilos.formulario}>
        <section style={estilos.seccion}>
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

const estilos = {
  pagina: { maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: "'Manrope', system-ui, sans-serif", color: '#12181F', backgroundColor: '#F6F8FA', minHeight: '100vh' },
  headerMarca: { display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#0E1420', borderRadius: 14, padding: '18px 22px', marginBottom: 28 },
  logoWordmark: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: '#EDF1F5', lineHeight: 1 },
  logoTagline: { fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA6B4', marginTop: 4 },
  titulo: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4 },
  subtitulo: { color: '#5B6572', marginBottom: 32, lineHeight: 1.5 },
  formulario: { display: 'flex', flexDirection: 'column', gap: 32 },
  seccion: { border: '1px solid #E3E7EC', borderRadius: 12, padding: 24, backgroundColor: '#FFFFFF' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E3E7EC' },
  tab: { padding: '10px 16px', textDecoration: 'none', color: '#5B6572', fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent' },
  tabActiva: { color: '#12181F', fontWeight: 700, borderBottom: '3px solid #D7FF3D' },
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
  boton: { background: '#0E1420', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C43F2E', fontSize: 14, fontWeight: 600 },
};
