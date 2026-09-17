"use client";

import { useEffect, useMemo, useState } from "react";

function ChipInput({ label, placeholder, values, onChange, mono }) {
  const [borrador, setBorrador] = useState("");

  function agregar() {
    const limpio = borrador.trim();
    if (!limpio) return;
    if (!values.includes(limpio)) onChange([...values, limpio]);
    setBorrador("");
  }

  function quitar(valor) {
    onChange(values.filter((v) => v !== valor));
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          className={`flex-1 border border-primary/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 ${mono ? "font-mono" : ""}`}
          placeholder={placeholder}
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
        />
        <button
          type="button"
          onClick={agregar}
          className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          Agregar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className={`inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs ${mono ? "font-mono" : ""}`}
          >
            {v}
            <button
              type="button"
              onClick={() => quitar(v)}
              className="text-primary/60 hover:text-bad"
              aria-label={`Quitar ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function formatoCOP(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
}

export default function Home() {
  const [unspsc, setUnspsc] = useState([]);
  const [palabras, setPalabras] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState(null);

  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");

  // Recuerda la última búsqueda configurada en este navegador.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("licitup-config");
      if (guardado) {
        const { unspsc: u, palabras: p } = JSON.parse(guardado);
        if (Array.isArray(u)) setUnspsc(u);
        if (Array.isArray(p)) setPalabras(p);
      }
    } catch {
      // si falla, simplemente arranca vacío
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("licitup-config", JSON.stringify({ unspsc, palabras }));
    } catch {
      // el guardado local es solo una comodidad, no es crítico si falla
    }
  }, [unspsc, palabras]);

  async function buscar() {
    if (unspsc.length === 0 && palabras.length === 0) {
      setError("Agrega al menos un código UNSPSC o una palabra clave.");
      return;
    }
    setError("");
    setCargando(true);
    setResultados(null);
    try {
      const params = new URLSearchParams();
      if (unspsc.length > 0) params.set("unspsc", unspsc.join(","));
      if (palabras.length > 0) params.set("palabras", palabras.join(","));
      const resp = await fetch(`/api/radar?${params.toString()}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Error consultando SECOP");
      setResultados(data.resultados);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setCargando(false);
    }
  }

  const modalidades = useMemo(() => {
    if (!resultados) return [];
    return Array.from(new Set(resultados.map((r) => r.modalidad).filter(Boolean))).sort();
  }, [resultados]);

  const departamentos = useMemo(() => {
    if (!resultados) return [];
    return Array.from(new Set(resultados.map((r) => r.departamento).filter(Boolean))).sort();
  }, [resultados]);

  const resultadosFiltrados = useMemo(() => {
    if (!resultados) return [];
    return resultados.filter((r) => {
      if (filtroModalidad && r.modalidad !== filtroModalidad) return false;
      if (filtroDepartamento && r.departamento !== filtroDepartamento) return false;
      if (valorMin && (r.valorBase === null || r.valorBase < Number(valorMin))) return false;
      if (valorMax && (r.valorBase === null || r.valorBase > Number(valorMax))) return false;
      return true;
    });
  }, [resultados, filtroModalidad, filtroDepartamento, valorMin, valorMax]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-primary/10 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-baseline justify-between">
          <div>
            <h1 className="font-serif text-2xl text-primary">LicitUp</h1>
            <p className="text-xs text-primary/60 tracking-wide uppercase">Radar de oportunidades SECOP</p>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-primary/10 rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg text-primary mb-4">Configura tu búsqueda</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ChipInput
              label="Códigos UNSPSC"
              placeholder="Ej: 43211500"
              values={unspsc}
              onChange={setUnspsc}
              mono
            />
            <ChipInput
              label="Palabras clave"
              placeholder="Ej: desarrollo de software"
              values={palabras}
              onChange={setPalabras}
            />
          </div>
          <p className="text-xs text-primary/50 mt-3">
            Escribe cada código o palabra y presiona Enter (o el botón "Agregar"). Un proceso aparece si coincide
            con cualquiera de los códigos o cualquiera de las palabras.
          </p>
          <button
            onClick={buscar}
            disabled={cargando}
            className="mt-5 px-5 py-2.5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50"
          >
            {cargando ? "Buscando en SECOP..." : "Buscar procesos abiertos"}
          </button>
          {error && <p className="text-bad text-sm mt-3">{error}</p>}
        </div>

        {resultados && (
          <div className="mt-8">
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-primary/70 mb-1">Modalidad</label>
                <select
                  className="border border-primary/20 rounded-md px-2 py-1.5 text-sm"
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                >
                  <option value="">Todas</option>
                  {modalidades.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary/70 mb-1">Departamento</label>
                <select
                  className="border border-primary/20 rounded-md px-2 py-1.5 text-sm"
                  value={filtroDepartamento}
                  onChange={(e) => setFiltroDepartamento(e.target.value)}
                >
                  <option value="">Todos</option>
                  {departamentos.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary/70 mb-1">Valor base mínimo</label>
                <input
                  type="number"
                  className="border border-primary/20 rounded-md px-2 py-1.5 text-sm w-36"
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary/70 mb-1">Valor base máximo</label>
                <input
                  type="number"
                  className="border border-primary/20 rounded-md px-2 py-1.5 text-sm w-36"
                  value={valorMax}
                  onChange={(e) => setValorMax(e.target.value)}
                  placeholder="Sin límite"
                />
              </div>
              <p className="text-xs text-primary/50 pb-2">
                {resultadosFiltrados.length} de {resultados.length} procesos
              </p>
            </div>

            <div className="bg-white border border-primary/10 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 text-primary/80 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Entidad</th>
                    <th className="text-left px-4 py-3">Ubicación</th>
                    <th className="text-left px-4 py-3">Objeto</th>
                    <th className="text-left px-4 py-3">Modalidad</th>
                    <th className="text-right px-4 py-3">Valor base</th>
                    <th className="text-left px-4 py-3">Publicado</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosFiltrados.map((r, i) => (
                    <tr key={i} className="border-t border-primary/5 hover:bg-primary/[0.03]">
                      <td className="px-4 py-3">{r.entidad}</td>
                      <td className="px-4 py-3">{r.ciudad}{r.ciudad && r.departamento ? ", " : ""}{r.departamento}</td>
                      <td className="px-4 py-3 max-w-xs">{r.objeto}</td>
                      <td className="px-4 py-3">{r.modalidad}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{formatoCOP(r.valorBase)}</td>
                      <td className="px-4 py-3 text-xs">{r.fechaPublicacion}</td>
                      <td className="px-4 py-3">
                        {r.link && (
                          <a href={r.link} target="_blank" rel="noreferrer" className="text-accent hover:underline text-xs font-medium">
                            Ver proceso →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {resultadosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-primary/50">
                        No hay procesos que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
