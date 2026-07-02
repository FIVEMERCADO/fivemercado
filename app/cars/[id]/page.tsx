"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HandlingEditor } from "@/components/cars/HandlingEditor";
import { Zap, Car, ArrowLeft, Package, Wrench, CheckCircle, Lock } from "lucide-react";

interface CarData {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  is_free: boolean;
  image_url: string | null;
  description: string;
  handling_name: string;
  handling: Record<string, number>;
  stats: { speed: number; acceleration: number; braking: number; handling: number };
}

// Precio del servicio de edición (configurable aquí)
const EDIT_ADDON_PRICE = 50; // CR adicionales para handling custom

export default function CarDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();

  const [car, setCar]         = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);

  // Paso: "info" | "editor"
  const [step, setStep]       = useState<"info" | "editor">("info");

  // Tipo de compra: "base" = carro + handling original | "custom" = + handling custom
  const [purchaseType, setPurchaseType] = useState<"base" | "custom">("base");

  const [buying, setBuying]   = useState(false);
  const [done, setDone]       = useState<"base" | "custom" | null>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then(r => r.json())
      .then(d => { setCar(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handlePurchase(customHandling: Record<string, number>) {
    if (!car) return;
    setBuying(true);
    setError("");
    try {
      const res = await fetch(`/api/cars/${car.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handling: purchaseType === "custom" ? customHandling : car.handling }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error en la compra");
      setDone(purchaseType);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBuying(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-white/30 text-sm">Cargando carro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 text-center">
          <p className="text-white/40 font-rajdhani text-xl">Carro no encontrado</p>
          <button onClick={() => router.push("/cars")} className="mt-4 text-primary font-mono text-sm hover:underline">
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = car.is_free
    ? (purchaseType === "custom" ? EDIT_ADDON_PRICE : 0)
    : (car.price + (purchaseType === "custom" ? EDIT_ADDON_PRICE : 0));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
        {/* Back */}
        <button
          onClick={() => step === "editor" ? setStep("info") : router.push("/cars")}
          className="flex items-center gap-2 text-white/30 hover:text-white font-mono text-sm mt-6 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "editor" ? "Volver a información del carro" : "Catálogo de Carros"}
        </button>

        {/* ── PASO 1: Info + selección de tier ────────────────────── */}
        {step === "info" && (
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Columna izquierda: imagen + descripción */}
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-dark-lighter">
                {car.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-24 h-24 text-white/10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 bg-dark/80 border border-primary/30 text-primary rounded">
                  {car.category}
                </span>
              </div>

              <div>
                <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">{car.brand}</p>
                <h1 className="font-orbitron font-black text-3xl sm:text-4xl uppercase text-white text-glow-orange">
                  {car.name}
                </h1>
                <p className="font-mono text-sm text-white/25 mt-1">
                  Handling: <span className="text-primary/60">{car.handling_name}</span>
                </p>
              </div>

              {car.description && (
                <p className="text-white/45 font-rajdhani text-base leading-relaxed border-l-2 border-primary/20 pl-4">
                  {car.description}
                </p>
              )}

              {/* Stats visuales */}
              {car.stats && (
                <div className="p-4 bg-dark-mid rounded-xl border border-white/5 space-y-2.5">
                  {[
                    { label: "Velocidad",   v: car.stats.speed,        color: "bg-primary" },
                    { label: "Aceleración", v: car.stats.acceleration, color: "bg-neon" },
                    { label: "Frenado",     v: car.stats.braking,      color: "bg-secondary" },
                    { label: "Manejo",      v: car.stats.handling,     color: "bg-pink" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-white/25 uppercase w-20 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-1.5 bg-dark rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.v}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-white/30 w-6 text-right">{s.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha: selección de tier */}
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-3">Elige lo que necesitas</p>

                {/* Tier 1: Solo el carro */}
                <button
                  onClick={() => setPurchaseType("base")}
                  className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 mb-3 ${
                    purchaseType === "base"
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-white/8 bg-dark-mid hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${purchaseType === "base" ? "bg-primary/20" : "bg-dark"}`}>
                      <Package className={`w-5 h-5 ${purchaseType === "base" ? "text-primary" : "text-white/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`font-orbitron font-bold text-sm uppercase ${purchaseType === "base" ? "text-primary" : "text-white/60"}`}>
                          Carro Base
                        </span>
                        <span className={`font-orbitron font-black text-lg ${purchaseType === "base" ? "text-primary" : "text-white/40"}`}>
                          {car.is_free ? "GRATIS" : `${car.price} CR`}
                        </span>
                      </div>
                      <p className="font-rajdhani text-sm text-white/35 mt-1 leading-relaxed">
                        Archivos del carro + <span className="text-white/55">handling.meta original</span> del fabricante, probado y listo para instalar.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {["Archivos del carro", "handling.meta original", "Entrega por Discord"].map(f => (
                          <span key={f} className="text-[10px] font-mono text-neon/50 border border-neon/15 rounded px-2 py-0.5">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Tier 2: Carro + Handling Custom */}
                <button
                  onClick={() => setPurchaseType("custom")}
                  className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 relative ${
                    purchaseType === "custom"
                      ? "border-neon/50 bg-neon/3 shadow-lg shadow-neon/10"
                      : "border-white/8 bg-dark-mid hover:border-white/15"
                  }`}
                >
                  {/* Badge "Pro" */}
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-neon text-dark text-[9px] font-mono font-bold uppercase tracking-widest rounded-full">
                    PRO
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${purchaseType === "custom" ? "bg-neon/15" : "bg-dark"}`}>
                      <Wrench className={`w-5 h-5 ${purchaseType === "custom" ? "text-neon" : "text-white/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`font-orbitron font-bold text-sm uppercase ${purchaseType === "custom" ? "text-neon" : "text-white/60"}`}>
                          Carro + Handling Pro
                        </span>
                        <div className="text-right">
                          <span className={`font-orbitron font-black text-lg ${purchaseType === "custom" ? "text-neon" : "text-white/40"}`}>
                            {car.is_free ? `${EDIT_ADDON_PRICE} CR` : `${car.price + EDIT_ADDON_PRICE} CR`}
                          </span>
                          {!car.is_free && (
                            <p className="text-[10px] font-mono text-white/20">{car.price} + {EDIT_ADDON_PRICE} CR edición</p>
                          )}
                        </div>
                      </div>
                      <p className="font-rajdhani text-sm text-white/35 mt-1 leading-relaxed">
                        Todo lo anterior más el <span className="text-neon/60">editor de handling personalizado</span>. Ajusta velocidad, frenado, grip y suspensión con datos de 1.253 carros reales.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {["Archivos del carro", "Editor guiado", "Presets Race/Drift/Grip", "Validación en tiempo real", "Entrega por Discord"].map(f => (
                          <span key={f} className="text-[10px] font-mono text-neon/50 border border-neon/15 rounded px-2 py-0.5">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Precio final + CTA */}
              <div className="p-4 bg-dark-mid rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-white/30">Total a pagar</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-orbitron font-black text-2xl text-primary">
                      {totalPrice === 0 ? "GRATIS" : `${totalPrice} CR`}
                    </span>
                  </div>
                </div>

                {purchaseType === "base" ? (
                  <button
                    onClick={() => handlePurchase(car.handling)}
                    disabled={buying}
                    className="w-full btn-gta py-3.5 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Procesando...</>
                    ) : (
                      <><Package className="w-4 h-4" /> Comprar Carro Base</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep("editor")}
                    className="w-full btn-gta py-3.5 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" /> Personalizar Handling →
                  </button>
                )}
              </div>

              {/* Éxito */}
              {done && (
                <div className="flex items-start gap-3 p-4 bg-neon/5 border border-neon/30 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-orbitron font-bold text-neon text-sm">¡Compra exitosa!</p>
                    <p className="text-white/55 font-rajdhani text-sm mt-0.5">
                      {done === "custom"
                        ? `Tu handling.meta personalizado + archivos del carro fueron enviados a tu Discord.`
                        : `Los archivos del carro con el handling.meta original fueron enviados a tu Discord.`}
                      {" "}Revisa los mensajes directos del bot de FiveMercado.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/30 rounded-xl text-red-400 font-rajdhani text-sm">
                  {error}
                </div>
              )}

              {/* Info delivery */}
              <div className="flex items-start gap-3 p-3.5 bg-dark/60 rounded-xl border border-white/5">
                <Lock className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/25 font-rajdhani leading-relaxed">
                  El archivo llega como DM de Discord adjunto listo para copiar a la carpeta de tu servidor FiveM.
                  No se requiere instalación adicional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 2: Editor de handling ───────────────────────────── */}
        {step === "editor" && (
          <div className="max-w-2xl mx-auto">
            {/* Header del editor */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase">— Handling Pro</span>
              </div>
              <h2 className="font-orbitron font-black text-2xl sm:text-3xl uppercase text-white">
                Personaliza tu <span className="text-primary">{car.name}</span>
              </h2>
              <p className="font-rajdhani text-white/40 mt-1.5 text-sm">
                Ajusta los parámetros y confirma. Recibirás el <code className="text-neon/60">{car.handling_name}_handling.meta</code> por Discord listo para instalar.
              </p>
            </div>

            <HandlingEditor
              originalHandling={car.handling}
              handlingName={car.handling_name}
              category={car.category}
              onConfirm={handlePurchase}
              saving={buying}
              editPrice={car.is_free ? EDIT_ADDON_PRICE : EDIT_ADDON_PRICE}
            />

            {/* Éxito / Error desde editor */}
            {done && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-neon/5 border border-neon/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-orbitron font-bold text-neon text-sm">¡Handling enviado!</p>
                  <p className="text-white/55 font-rajdhani text-sm mt-0.5">
                    Tu <code className="text-neon">{car.handling_name}_handling.meta</code> personalizado fue enviado por Discord.
                  </p>
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-500/5 border border-red-500/30 rounded-xl text-red-400 font-rajdhani text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
