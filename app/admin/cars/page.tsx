"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Car, Loader2, X, Check } from "lucide-react";

const CATEGORIES = ["Supercar", "Sport", "Muscle", "Sedan", "SUV", "Offroad", "Van", "Moto"];

interface Car {
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
  stats: { speed: number; acceleration: number; braking: number; handling: number };
  handling: Record<string, number>;
  created_at: string;
}

const EMPTY_CAR = {
  name: "",
  brand: "",
  category: "Sport",
  description: "",
  price: 0,
  is_free: false,
  image_url: "",
  r2_path: "",
  handling_name: "",
  stats: { speed: 50, acceleration: 50, braking: 50, handling: 50 },
  handling: {
    fMass: 1500,
    fInitialDragCoeff: 10.0,
    fMaxVelocity: 250.0,
    fBrakeForce: 0.7,
    fBrakeBiasFront: 0.38,
    fHandBrakeForce: 0.6,
    fSteeringLock: 40.0,
    fTractionCurveMax: 2.4,
    fTractionCurveMin: 1.8,
    fTractionBiasFront: 0.47,
    fDriveInertia: 1.0,
    nInitialDriveGears: 6,
    fInitialDriveForce: 0.32,
    fInitialDriveMaxFlatVel: 160.0,
    fSuspensionForce: 2.0,
    fSuspensionCompDamp: 1.5,
    fSuspensionReboundDamp: 2.0,
    fSuspensionUpperLimit: 0.10,
    fSuspensionLowerLimit: -0.10,
    fSuspensionRaise: 0.0,
    fSuspensionBiasFront: 0.5,
    fAntiRollBarForce: 0.4,
    fAntiRollBarBiasFront: 0.5,
    fCollisionDamageMult: 1.0,
    fWeaponDamageMult: 1.0,
    fDeformationDamageMult: 0.6,
    fEngineDamageMult: 1.5,
    fPetrolTankVolume: 65.0,
  },
};

function StatBar({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-primary font-bold">{value}</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5 rounded-full"
      />
    </div>
  );
}

export default function AdminCarsPage() {
  const [cars, setCars]         = useState<Car[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Car | null>(null);
  const [form, setForm]         = useState<typeof EMPTY_CAR>(EMPTY_CAR);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState<"basic" | "stats" | "handling">("basic");
  const [msg, setMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
    setTab("basic");
    setShowForm(true);
  }

  function openEdit(car: Car) {
    setEditing(car);
    setForm({
      name: car.name,
      brand: car.brand,
      category: car.category,
      description: "",
      price: car.price,
      is_free: car.is_free,
      image_url: car.image_url ?? "",
      r2_path: car.r2_path ?? "",
      handling_name: car.handling_name,
      stats: car.stats,
      handling: car.handling as typeof EMPTY_CAR.handling,
    });
    setTab("basic");
    setShowForm(true);
  }

  async function saveCar() {
    setSaving(true);
    setMsg(null);
    const url    = editing ? `/api/admin/cars/${editing.id}` : "/api/admin/cars";
    const method = editing ? "PATCH" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  async function togglePublish(car: Car) {
    await fetch(`/api/admin/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !car.is_published }),
    });
    fetchCars();
  }

  async function deleteCar(car: Car) {
    if (!confirm(`¿Eliminar "${car.name}"?`)) return;
    await fetch(`/api/admin/cars/${car.id}`, { method: "DELETE" });
    fetchCars();
  }

  function setHandling(key: string, val: number) {
    setForm((f) => ({ ...f, handling: { ...f.handling, [key]: val } }));
  }

  function setStat(key: string, val: number) {
    setForm((f) => ({ ...f, stats: { ...f.stats, [key]: val } }));
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
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-dark font-rajdhani font-black uppercase px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar carro
          </button>
        </div>

        {/* Mensaje */}
        {msg && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
            msg.type === "ok"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {msg.type === "ok" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
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
                  <th className="text-left px-4 py-3">Handling name</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {car.image_url ? (
                          <img src={car.image_url} alt={car.name} className="w-12 h-8 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                            <Car className="w-4 h-4 text-white/20" />
                          </div>
                        )}
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
                        : <span className="text-primary font-bold">{car.price} cr</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-white/40 text-xs">{car.handling_name}</code>
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

            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
              <h2 className="font-rajdhani font-black uppercase text-lg">
                {editing ? `Editar — ${editing.name}` : "Agregar carro"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {(["basic", "stats", "handling"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-xs font-rajdhani font-black uppercase tracking-wider transition-colors ${
                    tab === t ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {t === "basic" ? "Básico" : t === "stats" ? "Stats visuales" : "Handling base"}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {tab === "basic" && (
                <>
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
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Handling name *</label>
                      <input value={form.handling_name} onChange={(e) => setForm({ ...form, handling_name: e.target.value.toUpperCase() })}
                        className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:border-primary outline-none"
                        placeholder="FERRARI488" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Precio (créditos)</label>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
                      placeholder="https://..." />
                    {form.image_url && (
                      <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-xl object-cover" />
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Ruta en R2 (archivo base)</label>
                    <input value={form.r2_path} onChange={(e) => setForm({ ...form, r2_path: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:border-primary outline-none"
                      placeholder="cars/ferrari-488/base.zip" />
                  </div>
                </>
              )}

              {tab === "stats" && (
                <div className="space-y-5">
                  <p className="text-white/40 text-xs">Estas stats se muestran como barras visuales en la card del marketplace (0–100).</p>
                  <StatBar label="Velocidad" value={form.stats.speed} onChange={(v) => setStat("speed", v)} />
                  <StatBar label="Aceleración" value={form.stats.acceleration} onChange={(v) => setStat("acceleration", v)} />
                  <StatBar label="Frenado" value={form.stats.braking} onChange={(v) => setStat("braking", v)} />
                  <StatBar label="Manejo" value={form.stats.handling} onChange={(v) => setStat("handling", v)} />
                </div>
              )}

              {tab === "handling" && (
                <div className="space-y-3">
                  <p className="text-white/40 text-xs">Estos son los valores base del handling.meta. El usuario los puede ajustar desde la página del carro.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(form.handling).map(([key, val]) => (
                      <div key={key}>
                        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block font-mono">{key}</label>
                        <input
                          type="number"
                          step={key.startsWith("n") ? 1 : 0.01}
                          value={val}
                          onChange={(e) => setHandling(key, Number(e.target.value))}
                          className="w-full bg-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:border-primary outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
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
