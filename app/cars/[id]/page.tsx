"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HandlingEditor } from "@/components/cars/HandlingEditor";
import { Zap, Car, ArrowLeft, Download, CheckCircle } from "lucide-react";

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

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar]         = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying]   = useState(false);
  const [done, setDone]       = useState(false);
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
        body: JSON.stringify({ handling: customHandling }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error en la compra");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Navbar />
        <div className="font-mono text-primary animate-pulse">Cargando...</div>
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

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
        {/* Back */}
        <button
          onClick={() => router.push("/cars")}
          className="flex items-center gap-2 text-white/30 hover:text-white font-mono text-sm mt-6 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Catálogo de Carros
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ── Columna izquierda: info + imagen ── */}
          <div className="space-y-6">
            {/* Imagen */}
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

            {/* Header */}
            <div>
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">{car.brand}</p>
              <h1 className="font-orbitron font-black text-3xl sm:text-4xl uppercase text-white text-glow-orange">
                {car.name}
              </h1>
              <p className="font-mono text-sm text-white/30 mt-1">
                Handling: <span className="text-primary">{car.handling_name}</span>
              </p>
            </div>

            {car.description && (
              <p className="text-white/50 font-rajdhani text-base leading-relaxed border-l-2 border-primary/30 pl-4">
                {car.description}
              </p>
            )}

            {/* Precio */}
            <div className="flex items-center gap-4 p-4 bg-dark-mid rounded-xl border border-white/5">
              {car.is_free ? (
                <div>
                  <p className="text-neon font-orbitron font-black text-3xl">GRATIS</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">Descarga directa</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <p className="text-primary font-orbitron font-black text-3xl">{car.price} CR</p>
                  </div>
                  <p className="text-white/30 text-xs font-mono mt-0.5">Créditos FiveMercado</p>
                </div>
              )}
              <div className="ml-auto text-right">
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Incluye</p>
                <p className="text-white/60 font-rajdhani text-sm">handling.meta personalizado</p>
                <p className="text-white/60 font-rajdhani text-sm">Entrega por Discord DM</p>
              </div>
            </div>

            {/* Éxito */}
            {done && (
              <div className="flex items-start gap-3 p-4 bg-neon/5 border border-neon/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-orbitron font-bold text-neon text-sm">¡Compra exitosa!</p>
                  <p className="text-white/60 font-rajdhani text-sm mt-0.5">
                    Tu <code className="text-neon">{car.handling_name}_handling.meta</code> fue enviado a tu Discord. Revisa tus mensajes directos del bot de FiveMercado.
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
          </div>

          {/* ── Columna derecha: editor de handling ── */}
          <div>
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-neon" />
                <h2 className="font-orbitron font-bold uppercase text-sm text-white tracking-wider">
                  Editor de Handling
                </h2>
                <span className="font-mono text-[10px] text-neon/50 ml-auto">
                  validado con 1.253 carros reales
                </span>
              </div>

              <HandlingEditor
                initialHandling={car.handling}
                handlingName={car.handling_name}
                category={car.category}
                onSave={handlePurchase}
                saving={buying}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
