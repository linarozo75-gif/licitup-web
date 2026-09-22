'use client';

import { useEffect, useMemo, useState } from 'react';

const TIPOS_TERMINO = [
  { value: 'palabra_clave', label: 'Palabra clave' },
  { value: 'unspsc', label: 'Código UNSPSC' },
  { value: 'entidad', label: 'Entidad específica' },
];

function formatearValor(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Valor no especificado';
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'Valor no especificado';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(numero);
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  const texto = String(fecha).slice(0, 10);
  const [aaaa, mm, dd] = texto.split('-');
  if (!aaaa || !mm || !dd) return texto;
  return `${dd}/${mm}/${aaaa}`;
}

export default function RadarPage() {
  const [terminos, setTerminos] = useState([]);
  const [cargandoTerminos, setCargandoTerminos] = useState(true);
  const [nuevoTerminoTipo, setNuevoTerminoTipo] = useState('palabra_clave');
  const [nuevoTerminoValor, setNuevoTerminoValor] = useState('');
  const [guardandoTermino, setGuardandoTermino] = useState(false);
  const [mensajeTerminos, setMensajeTerminos] = useState(null);

  const [resultados, setResultados] = useState([]);
  const [cargandoResultados, setCargandoResultados] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [mensajeActualizacion, setMensajeActualizacion] = useState(null);

  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');

  function cargarTerminos() {
    setCargandoTerminos(true);
    fetch('/api/radar/terminos')
      .then((r) => r.json())
      .then((data) => setTerminos(data.terminos ?? []))
      .catch(() => setMensajeTerminos({ tipo: 'error', texto: 'No se pudo cargar la lista de términos.' }))
      .finally(() => setCargandoTerminos(false));
  }

  function cargarResultados() {
    setCargandoResultados(true);
    fetch('/api/radar/resultados')
      .then((r) => r.json())
      .then((data) => {
        setResultados(data.resultados ?? []);
        setUltimaActualizacion(data.ultima_actualizacion ?? null);
      })
      .catch(() => setMensajeActualizacion({ tipo: 'error', texto: 'No se pudo cargar los resultados.' }))
      .finally(() => setCargandoResultados(false));
  }

  useEffect(() => {
    cargarTerminos();
    cargarResultados();
  }, []);

  async function agregarTermino(e) {
    e.preventDefault();
    const valor = nuevoTerminoValor.trim();
    if (!valor) return;
    setGuardandoTermino(true);
    setMensajeTerminos(null);
    try {
      const res = await fetch('/api/radar/terminos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: nuevoTerminoTipo, valor }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setNuevoTerminoValor('');
      cargarTerminos();
    } catch {
      setMensajeTerminos({ tipo: 'error', texto: 'No se pudo guardar el término. Intenta de nuevo.' });
    } finally {
      setGuardandoTermino(false);
    }
  }

  async function eliminarTermino(id) {
    try {
      const res = await fetch(`/api/radar/terminos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setTerminos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setMensajeTerminos({ tipo: 'error', texto: 'No se pudo eliminar. Intenta de nuevo.' });
    }
  }

  async function actualizarRadarAhora() {
    setActualizando(true);
    setMensajeActualizacion(null);
    try {
      const res = await fetch('/api/radar/actualizar', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      if (data.mensaje) {
        setMensajeActualizacion({ tipo: 'ok', texto: data.mensaje });
      } else {
        setMensajeActualizacion({ tipo: 'ok', texto: `Radar actualizado: ${data.total} procesos encontrados.` });
      }
      cargarResultados();
    } catch (error) {
      setMensajeActualizacion({
        tipo: 'error',
        texto: 'No se pudo actualizar el radar ahora mismo. Puedes intentar de nuevo en un momento.',
      });
    } finally {
      setActualizando(false);
    }
  }

  const modalidadesDisponibles = useMemo(
    () => [...new Set(resultados.map((r) => r.modalidad).filter(Boolean))].sort(),
    [resultados]
  );
  const departamentosDisponibles = useMemo(
    () => [...new Set(resultados.map((r) => r.departamento).filter(Boolean))].sort(),
    [resultados]
  );

  const resultadosFiltrados = useMemo(() => {
    return resultados.filter((r) => {
      if (filtroModalidad && r.modalidad !== filtroModalidad) return false;
      if (filtroDepartamento && r.departamento !== filtroDepartamento) return false;
      const valor = r.valor_base !== null && r.valor_base !== undefined ? Number(r.valor_base) : null;
      // Un proceso sin valor registrado en SECOP nunca se oculta por los
      // filtros de valor — se descarta la ausencia de dato con "no aplica el
      // filtro", no con "no cumple el filtro".
      if (valor !== null) {
        if (filtroValorMin !== '' && valor < Number(filtroValorMin)) return false;
        if (filtroValorMax !== '' && valor > Number(filtroValorMax)) return false;
      }
      return true;
    });
  }, [resultados, filtroModalidad, filtroDepartamento, filtroValorMin, filtroValorMax]);

  const terminosUnspsc = terminos.filter((t) => t.tipo === 'unspsc');
  const terminosPalabras = terminos.filter((t) => t.tipo === 'palabra_clave');
  const terminosEntidades = terminos.filter((t) => t.tipo === 'entidad');

  return (
    <div style={estilos.pagina}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Manrope:wght@400;500;600;700&display=swap');`}</style>

      <aside style={estilos.sidebar}>
        <div style={estilos.sidebarLogoWrap}>
          <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 56 A 48 48 0 0 1 56 8" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round" opacity="0.35"></path>
            <path d="M20 56 A 36 36 0 0 1 56 20" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round" opacity="0.6"></path>
            <path d="M32 56 A 24 24 0 0 1 56 32" stroke="#D7FF3D" strokeWidth="3" strokeLinecap="round"></path>
            <circle cx="56" cy="56" r="6" fill="#D7FF3D"></circle>
          </svg>
          <div style={estilos.logoWordmark}>Licit<span style={{ color: '#D7FF3D' }}>Up</span></div>
          <div style={estilos.logoTagline}>Inteligencia de licitaciones</div>
        </div>

        <nav style={estilos.sidebarNav}>
          <a href="/mi-empresa" style={estilos.sidebarLink}>Mi Empresa</a>
          <a href="/radar" style={{ ...estilos.sidebarLink, ...estilos.sidebarLinkActiva }}>Identificar procesos</a>
          <span style={estilos.sidebarLinkDeshabilitada}>Evaluar proceso<span style={estilos.sidebarBadge}>Pronto</span></span>
          <span style={estilos.sidebarLinkDeshabilitada}>Construir oferta<span style={estilos.sidebarBadge}>Pronto</span></span>
          <span style={estilos.sidebarLinkDeshabilitada}>Gestionar contrato<span style={estilos.sidebarBadge}>Pronto</span></span>
        </nav>
      </aside>

      <main style={estilos.contenido}>
        <h1 style={estilos.titulo}>Identificar procesos</h1>
        <p style={estilos.subtitulo}>
          El radar busca todos los días procesos abiertos en SECOP II que coincidan con tus códigos UNSPSC
          o tus palabras clave, y los deja listos aquí para que los revises. Puedes dejar la configuración
          vacía por ahora y completarla cuando quieras — el radar simplemente no traerá resultados hasta
          que agregues al menos un término.
        </p>

        {/* ===== Configuración ===== */}
        <section style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Configuración de búsqueda</h2>
          <p style={estilos.ayuda}>
            Agrega los códigos UNSPSC y/o las palabras clave que describen lo que ofreces. Si escribes una
            frase completa como palabra clave ("desarrollo de software"), el radar la parte en palabras
            sueltas y busca cualquiera de ellas — no hace falta que coincida exacta. Si lo que quieres es
            seguirle la pista a una entidad puntual (por ejemplo un cliente con el que ya estás trabajando),
            no la agregues como palabra clave — usa "Entidad específica": ese tipo busca el nombre completo
            de la entidad tal cual, en vez de partirlo en palabras sueltas que podrían traer procesos de
            entidades totalmente distintas.
          </p>

          <form
            onSubmit={agregarTermino}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}
          >
            <label style={estilos.campo}>
              <span style={estilos.etiqueta}>Tipo</span>
              <select
                value={nuevoTerminoTipo}
                onChange={(e) => setNuevoTerminoTipo(e.target.value)}
                style={estilos.input}
              >
                {TIPOS_TERMINO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label style={{ ...estilos.campo, flex: 1, minWidth: 200 }}>
              <span style={estilos.etiqueta}>
                {nuevoTerminoTipo === 'unspsc'
                  ? 'Código UNSPSC'
                  : nuevoTerminoTipo === 'entidad'
                  ? 'Nombre de la entidad'
                  : 'Palabra o frase clave'}
              </span>
              <input
                type="text"
                value={nuevoTerminoValor}
                onChange={(e) => setNuevoTerminoValor(e.target.value)}
                placeholder={
                  nuevoTerminoTipo === 'unspsc'
                    ? 'Ej: 81111500'
                    : nuevoTerminoTipo === 'entidad'
                    ? 'Ej: Secretaría Distrital de Planeación'
                    : 'Ej: desarrollo de software'
                }
                style={estilos.input}
              />
            </label>
            <button type="submit" disabled={guardandoTermino} style={estilos.boton}>
              {guardandoTermino ? 'Agregando…' : '+ Agregar'}
            </button>
          </form>

          {mensajeTerminos && (
            <p style={mensajeTerminos.tipo === 'ok' ? estilos.mensajeOk : estilos.mensajeError}>
              {mensajeTerminos.texto}
            </p>
          )}

          {cargandoTerminos ? (
            <p style={estilos.ayuda}>Cargando…</p>
          ) : terminos.length === 0 ? (
            <p style={estilos.ayuda}>Todavía no has agregado ningún código ni palabra clave.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {terminosUnspsc.length > 0 && (
                <div>
                  <h3 style={estilos.tituloSubseccion}>Códigos UNSPSC</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {terminosUnspsc.map((t) => (
                      <div key={t.id} style={estilos.filaTabla}>
                        <span>{t.valor}</span>
                        <button type="button" onClick={() => eliminarTermino(t.id)} style={estilos.botonSecundario}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {terminosPalabras.length > 0 && (
                <div>
                  <h3 style={estilos.tituloSubseccion}>Palabras clave</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {terminosPalabras.map((t) => (
                      <div key={t.id} style={estilos.filaTabla}>
                        <span>{t.valor}</span>
                        <button type="button" onClick={() => eliminarTermino(t.id)} style={estilos.botonSecundario}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {terminosEntidades.length > 0 && (
                <div>
                  <h3 style={estilos.tituloSubseccion}>Entidades específicas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {terminosEntidades.map((t) => (
                      <div key={t.id} style={estilos.filaTabla}>
                        <span>{t.valor}</span>
                        <button type="button" onClick={() => eliminarTermino(t.id)} style={estilos.botonSecundario}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== Resultados ===== */}
        <section style={estilos.seccion}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={estilos.tituloSeccion}>Resultados</h2>
              <p style={estilos.ayuda}>
                {ultimaActualizacion
                  ? `Última actualización: ${new Date(ultimaActualizacion).toLocaleString('es-CO')}`
                  : 'Todavía no se ha hecho ninguna actualización.'}
                {' '}El radar se actualiza solo todos los días. También puedes forzar una actualización ahora.
              </p>
            </div>
            <button type="button" onClick={actualizarRadarAhora} disabled={actualizando} style={estilos.boton}>
              {actualizando ? 'Actualizando…' : 'Actualizar ahora'}
            </button>
          </div>

          {mensajeActualizacion && (
            <p style={mensajeActualizacion.tipo === 'ok' ? estilos.mensajeOk : estilos.mensajeError}>
              {mensajeActualizacion.texto}
            </p>
          )}

          <div style={{ ...estilos.grid2, marginTop: 16, marginBottom: 16 }}>
            <label style={estilos.campo}>
              <span style={estilos.etiqueta}>Modalidad</span>
              <select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)} style={estilos.input}>
                <option value="">Todas</option>
                {modalidadesDisponibles.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label style={estilos.campo}>
              <span style={estilos.etiqueta}>Departamento</span>
              <select value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)} style={estilos.input}>
                <option value="">Todos</option>
                {departamentosDisponibles.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label style={estilos.campo}>
              <span style={estilos.etiqueta}>Valor mínimo (COP)</span>
              <input
                type="number"
                value={filtroValorMin}
                onChange={(e) => setFiltroValorMin(e.target.value)}
                placeholder="Sin mínimo"
                style={estilos.input}
              />
            </label>
            <label style={estilos.campo}>
              <span style={estilos.etiqueta}>Valor máximo (COP)</span>
              <input
                type="number"
                value={filtroValorMax}
                onChange={(e) => setFiltroValorMax(e.target.value)}
                placeholder="Sin máximo"
                style={estilos.input}
              />
            </label>
          </div>

          {cargandoResultados ? (
            <p style={estilos.ayuda}>Cargando…</p>
          ) : resultadosFiltrados.length === 0 ? (
            <p style={estilos.ayuda}>
              {resultados.length === 0
                ? 'Todavía no hay resultados. Agrega al menos un término arriba y presiona "Actualizar ahora".'
                : 'Ningún resultado coincide con los filtros que elegiste.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resultadosFiltrados.map((r) => (
                <div key={r.id} style={estilos.tarjetaResultado}>
                  <div style={estilos.tarjetaResultadoMeta}>
                    {r.entidad || 'Entidad no especificada'}
                    {r.departamento ? ` · ${r.departamento}` : ''}
                    {r.ciudad ? ` (${r.ciudad})` : ''}
                  </div>
                  <div style={estilos.tarjetaResultadoTitulo}>{r.objeto || 'Sin objeto registrado'}</div>
                  <div style={estilos.tarjetaResultadoDetalle}>
                    {r.modalidad || 'Modalidad no especificada'} · {formatearValor(r.valor_base)} · Publicado: {formatearFecha(r.fecha_publicacion)}
                  </div>
                  {r.url_proceso && (
                    <a href={r.url_proceso} target="_blank" rel="noreferrer" style={estilos.tarjetaResultadoLink}>
                      Ver proceso en SECOP →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const estilos = {
  pagina: { display: 'flex', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#F6F8FA', fontFamily: "'Manrope', system-ui, sans-serif", color: '#12181F' },
  sidebar: { width: 240, flexShrink: 0, backgroundColor: '#0E1420', color: '#EDF1F5', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 28, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box', overflowY: 'auto' },
  sidebarLogoWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  sidebarNav: { display: 'flex', flexDirection: 'column', gap: 4 },
  sidebarLink: { display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#C3CCD6', fontSize: 14, fontWeight: 600, borderLeft: '3px solid transparent' },
  sidebarLinkActiva: { backgroundColor: 'rgba(215,255,61,0.12)', color: '#EDF1F5', borderLeft: '3px solid #D7FF3D' },
  sidebarLinkDeshabilitada: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 8, color: '#5B6572', fontSize: 14, fontWeight: 600, cursor: 'default' },
  sidebarBadge: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#9AA6B4', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 999, flexShrink: 0 },
  contenido: { flex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 24px', boxSizing: 'border-box' },
  logoWordmark: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: '#EDF1F5', lineHeight: 1 },
  logoTagline: { fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA6B4', marginTop: 4 },
  titulo: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4 },
  subtitulo: { color: '#5B6572', marginBottom: 32, lineHeight: 1.5 },
  seccion: { border: '1px solid #E3E7EC', borderRadius: 12, padding: 24, marginBottom: 24, backgroundColor: '#FFFFFF' },
  tituloSeccion: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 },
  tituloSubseccion: { fontSize: 15, fontWeight: 600, marginTop: 4, marginBottom: 8, color: '#374151' },
  ayuda: { color: '#5B6572', fontSize: 14, marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 },
  etiqueta: { fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '8px 10px', border: '1px solid #D0D5DD', borderRadius: 8, fontSize: 14 },
  filaTabla: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid #E3E7EC', borderRadius: 8 },
  boton: { background: '#0E1420', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  botonSecundario: { background: '#fff', color: '#12181F', border: '1px solid #D0D5DD', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  mensajeOk: { color: '#0A7F5C', fontSize: 14 },
  mensajeError: { color: '#C43F2E', fontSize: 14, fontWeight: 600 },
  tarjetaResultado: { backgroundColor: '#FFFFFF', border: '1px solid #E3E7EC', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 },
  tarjetaResultadoMeta: { fontSize: 11, fontWeight: 600, color: '#6B7684', letterSpacing: '0.04em', textTransform: 'uppercase' },
  tarjetaResultadoTitulo: { fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 700, fontSize: 17 },
  tarjetaResultadoDetalle: { fontSize: 13, color: '#6B7684' },
  tarjetaResultadoLink: { fontSize: 13, fontWeight: 600, color: '#12181F', textDecoration: 'none', marginTop: 4 },
};
