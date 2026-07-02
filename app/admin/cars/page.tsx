"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Car, Loader2, X, Check, Upload, FileCode, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["Supercar", "Sport", "Muscle", "Sedan", "SUV", "Offroad", "Van", "Moto"];

interface CarRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  image_url: string | null;
  r2_path: string | null;
  handling_name: string;
  handling_xml: string | null;
  stats: { speed: number; acceleration: number; braking: number; handling: number };
  handling: Record<string, number>;
  created_at: string;
}

const EMPTY_CAR = {
  name: "", brand: "", category: "Sport", description: "", price: 0, is_free: false,
  image_url: "", r2_path: "", handling_name: "",
  stats: { speed: 50, acceleration: 50, braking: 50, handling: 50 },
  handling: {} as Record<string, number>,
  handling_xml: "" as string,
};

// ── Parsea el XML del handling.meta en el cliente ─────────────────────────────
function parseHandlingXml(xml: string): Record<string, number> {
  const result: Record<string, number> = {};
  Array.from(xml.matchAll(/<(\w+)\s+value="([^"]+)"\s*\/?>/gi)).forEach(m => {
    const v = parseFloat(m[2]);
    if (!isNaN(v)) result[m[1]] = v;
  });
  Array.from(xml.matchAll(/<(\w+)>([^<]+)<\/\s*\w+\s*>/gi)).forEach(m => {
    const v = parseFloat(m[2]);
    if (!isNaN(v)) result[m[1]] = v;
  });
  return result;
}

function StatBar({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-primary font-bold">{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5 rounded-full" />
    </div>
  );
}

export default function AdminCarsPage() {
  const [cars, setCars]         = useState<CarRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<CarRow | null>(null);
  const [form, setForm]         = useState<typeof EMPTY_CAR>(EMPTY_CAR);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState<"basic" | "stats" | "handling">("basic");
  const [msg, setMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [xmlFields, setXmlFields] = useState<number>(0); // cuántos campos parseamos del XML
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCars(); }, []);

  async function fetchCars() {
    setLoading(true);
    const res = await fetch("/api/admin/cars");
    if (res.ok) setCars(await res.json());
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY_CAR);
    setXmlFields(0);
    setTab("basic");
    setShowForm(true);
  }

  function openEdit(car: CarRow) {
    setEditing(car);
    setForm({
      name: car.name, brand: car.brand, category: car.category, description: "",
      price: car.price, is_free: car.is_free, image_url: car.image_url ?? "",
      r2_path: car.r2_path ?? "", handling_name: car.handling_name,
      stats: car.stats, handling: car.handling ?? {},
      handling_xml: car.handling_xml ?? "",
    });
    setXmlFields(car.handling_xml ? Object.keys(parseHandlingXml(car.handling_xml)).length : 0);
    setTab("basic");
    setShowForm(true);
  }

  // ── Upload del handling.meta ──────────────────────────────────────────────
  function handleXmlUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result as string;
      if (!xml.includes("CHandlingDataMgr") && !xml.includes("CHandlingData")) {
        setMsg({ type: "err", text: "El archivo no parece un handling.meta válido de FiveM." });
        return;
      }
      // Extraer handling_name automáticamente
      const nameMatch = xml.match(/<handlingName>([^<]+)<\/handlingName>/i);
      if (nameMatch && !form.handling_name) {
        setForm(f => ({ ...f, handling_name: nameMatch[1].trim(), handling_xml: xml }));
      } else {
        setForm(f => ({ ...f, handling_xml: xml }));
      }
      const parsed = parseHandlingXml(xml);
      setXmlFields(Object.keys(parsed).length);
      // Auto-rellenar valores de handling para el editor
      setForm(f => ({ ...f, handling_xml: xml, handling: parsed,
        handling_name: nameMatch ? nameMatch[1].trim() : f.handling_name }));
      setMsg({ type: "ok", text: `handling.meta cargado — ${Object.keys(parsed).length} campos detectados. Todo listo.` });
    };
    reader.readAsText(file);
  }

  async function saveCar() {
    setSaving(true);
    setMsg(null);
    const url    = editing ? `/api/admin/cars/${editing.id}` : "/api/admin/cars";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        handling_xml: form.handling_xml || null,
      }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: editing ? "Carro actualizado." : "Carro creado." });
      setShowForm(false);
      fetchCars();
    } else {
      const e = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: e.error ?? "Error al guardar." });
    }
    setSaving(false);
  }

  async function togglePublish(car: CarRow) {
    await fetch(`/api/admin/cars/${car.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !car.is_published }),
    });
    fetchCars();
  }

  async function deleteCar(car: CarRow) {
    if (!confirm(`¿Eliminar "${car.name}"?`)) return;
    await fetch(`/api/admin/cars/${car.id}`, { method: "DELETE" });
    fetchCars();
  }

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-rajdhani font-black uppercase text-2xl">Admin — Carros</h1>
              <p className="text-white/40 text-sm">{cars.length} carros en el catálogo</p>
            </div>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-primary text-dark font-rajdhani font-black uppercase px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Agregar carro
          </button>
        </div>

        {msg && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
            msg.type === "ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {msg.type === "ok" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay carros. Agrega el primero.</p>
          </div>
        ) : (
          <div className="bg-dark-lighter border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase text-xs tracking-wider">
                  <th className="text-left px-4 py-3">Carro</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="text-left px-4 py-3">Precio</th>
                  <th className="text-left px-4 py-3">Handling</th>
                  <th className="text-left px-4 py-3">XML</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {car.image_url
                          ? <img src={car.image_url} alt={car.name} className="w-12 h-8 object-cover rounded-lg" />
                          : <div className="w-12 h-8 bg-white/5 rounded-lg flex items-center justify-center"><Car className="w-4 h-4 text-white/20" /></div>
                        }
                        <div>
                          <p className="font-semibold text-white">{car.name}</p>
                          <p className="text-white/40 text-xs">{car.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-white/5 rounded-lg text-white/60 text-xs">{car.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      {car.is_free
                        ? <span className="text-green-400 font-bold">GRATIS</span>
                        : <span className="text-primary font-bold">{car.price} cr</span>}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-white/40 text-xs">{car.handling_name}</code>
                    </td>
                    {/* Indicador de si tiene XML original guardado */}
                    <td className="px-4 py-3">
                      {car.handling_xml
                        ? <span className="flex items-center gap-1 text-neon text-xs font-mono"><CheckCircle2 className="w-3 h-3" />Original</span>
                        : <span className="flex items-center gap-1 text-yellow-500/60 text-xs font-mono"><FileCode className="w-3 h-3" />Sin XML</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        car.is_published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {car.is_published ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePublish(car)} title={car.is_published ? "Ocultar" : "Publicar"}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          {car.is_published ? <EyeOff className="w-3.5 h-3.5 text-white/50" /> : <Eye className="w-3.5 h-3.5 text-white/50" />}
                        </button>
                        <button onClick={() => openEdit(car)} title="Editar"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button onClick={() => deleteCar(car)} title="Eliminar"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-dark-lighter border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
              <h2 className="font-rajdhani font-black uppercase text-lg">
                {editing ? `Editar — ${editing.name}` : "Agregar carro"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-white/10 flex-shrink-0">
              {(["basic", "stats", "handling"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-3 text-xs font-rajdhani font-black uppercase tracking-wider transition-colors ${
                    tab === t ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white/60"
                  }`}>
                  {t === "basic" ? "Básico" : t === "stats" ? "Stats" : "Handling JSON"}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {tab === "basic" && (
                <>
                  {/* ── Upload del handling.meta — LA PIEZA CLAVE ─── */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-neon/20 bg-neon/3">
                    <div className="flex items-start gap-3">
                      <FileCode className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-rajdhani font-bold text-white text-sm">
                          handling.meta original
                          {xmlFields > 0 && (
                            <span className="ml-2 text-neon text-xs font-mono">✓ {xmlFields} campos cargados</span>
                          )}
                        </p>
                        <p className="text-white/35 text-xs mt-0.5">
                          Sube el archivo original del carro. Se guardará completo y solo se modificarán los campos que el cliente edite — garantiza strModelFlags, SubHandlingData y todo lo demás correcto.
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <input
                            ref={fileRef}
                            type="file"
                            accept=".meta,.xml,text/xml"
                            className="hidden"
                            onChange={e => { if (e.target.files?.[0]) handleXmlUpload(e.target.files[0]); }}
                          />
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon/10 border border-neon/30 text-neon text-xs font-mono hover:bg-neon/15 transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            {form.handling_xml ? "Cambiar archivo" : "Subir handling.meta"}
                          </button>
                          {form.handling_xml && (
                            <button
                              onClick={() => { setForm(f => ({ ...f, handling_xml: "" })); setXmlFields(0); }}
                              className="text-xs text-white/30 hover:text-red-400 transition-colors"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Nombre *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none"
                        placeholder="Ferrari 488 GTB" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Marca *</label>
                      <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none"
                        placeholder="Ferrari" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Categoría</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none">
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                        Handling name *
                        {xmlFields > 0 && <span className="text-neon/60 ml-1">(auto)</span>}
                      </label>
                      <input value={form.handling_name} onChange={(e) => setForm({ ...form, handling_name: e.target.value.toUpperCase() })}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:border-primary outline-none"
                        placeholder="FERRARI488" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Precio (CR)</label>
                      <input type="number" value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        disabled={form.is_free}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none disabled:opacity-40" />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input type="checkbox" id="is_free" checked={form.is_free}
                        onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: e.target.checked ? 0 : form.price })}
                        className="w-4 h-4 accent-primary" />
                      <label htmlFor="is_free" className="text-sm text-white/60">Gratis</label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">URL de imagen</label>
                    <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none"
                      placeholder="https://img.fivemercado.com/cars/..." />
                    {form.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-xl object-cover" />
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Ruta R2 (ZIP del carro)</label>
                    <input value={form.r2_path} onChange={(e) => setForm({ ...form, r2_path: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:border-primary outline-none"
                      placeholder="cars/ferrari-488/files.zip" />
                  </div>
                </>
              )}

              {tab === "stats" && (
                <div className="space-y-5">
                  <p className="text-white/40 text-xs">Barras visuales en la card del catálogo (0–100).</p>
                  <StatBar label="Velocidad"   value={form.stats.speed}        onChange={(v) => setForm(f => ({ ...f, stats: { ...f.stats, speed: v } }))} />
                  <StatBar label="Aceleración" value={form.stats.acceleration} onChange={(v) => setForm(f => ({ ...f, stats: { ...f.stats, acceleration: v } }))} />
                  <StatBar label="Frenado"     value={form.stats.braking}      onChange={(v) => setForm(f => ({ ...f, stats: { ...f.stats, braking: v } }))} />
                  <StatBar label="Manejo"      value={form.stats.handling}     onChange={(v) => setForm(f => ({ ...f, stats: { ...f.stats, handling: v } }))} />
                </div>
              )}

              {tab === "handling" && (
                <div className="space-y-3">
                  {xmlFields > 0 ? (
                    <div className="flex items-center gap-2 text-neon text-xs font-mono p-3 bg-neon/5 border border-neon/15 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {xmlFields} campos extraídos automáticamente del handling.meta original. Estos son los valores reales del carro.
                    </div>
                  ) : (
                    <p className="text-yellow-400/60 text-xs p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                      ⚠ Sin handling.meta subido. Sube el archivo en la pestaña Básico para auto-rellenar estos valores.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(form.handling).map(([key, val]) => (
                      <div key={key}>
                        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block font-mono">{key}</label>
                        <input type="number" step={key.startsWith("n") ? 1 : 0.01} value={val}
                          onChange={(e) => setForm(f => ({ ...f, handling: { ...f.handling, [key]: Number(e.target.value) } }))}
                          className="w-full bg-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:border-primary outline-none" />
                      </div>
                    ))}
                    {Object.keys(form.handling).length === 0 && (
                      <p className="col-span-2 text-white/25 text-xs text-center py-6">
                        Sube un handling.meta para ver y editar los campos aquí
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10 flex-shrink-0">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={saveCar} disabled={saving || !form.name || !form.brand || !form.handling_name}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-dark font-rajdhani font-black uppercase rounded-xl text-sm hover:opacity-90 disabled:opacity-40 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear carro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
