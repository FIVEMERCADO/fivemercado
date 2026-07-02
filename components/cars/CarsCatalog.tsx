"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Car, Search } from "lucide-react";

// ── Colores por categoría ─────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, { color: string; glow: string; bg: string; label: string; emoji: string }> = {
  Sport:    { color: "#ff6600", glow: "rgba(255,102,0,0.5)",   bg: "rgba(255,102,0,0.06)",   label: "Sport",    emoji: "🏎" },
  Supercar: { color: "#a855f7", glow: "rgba(168,85,247,0.5)",  bg: "rgba(168,85,247,0.06)",  label: "Supercar", emoji: "⚡" },
  Muscle:   { color: "#ef4444", glow: "rgba(239,68,68,0.5)",   bg: "rgba(239,68,68,0.06)",   label: "Muscle",   emoji: "💪" },
  SUV:      { color: "#3b82f6", glow: "rgba(59,130,246,0.5)",  bg: "rgba(59,130,246,0.06)",  label: "SUV",      emoji: "🚙" },
  Offroad:  { color: "#eab308", glow: "rgba(234,179,8,0.5)",   bg: "rgba(234,179,8,0.06)",   label: "Offroad",  emoji: "🏔" },
  Moto:     { color: "#ec4899", glow: "rgba(236,72,153,0.5)",  bg: "rgba(236,72,153,0.06)",  label: "Moto",     emoji: "🏍" },
  Van:      { color: "#6b7280", glow: "rgba(107,114,128,0.5)", bg: "rgba(107,114,128,0.06)", label: "Van",      emoji: "🚐" },
  Truck:    { color: "#10b981", glow: "rgba(16,185,129,0.5)",  bg: "rgba(16,185,129,0.06)",  label: "Truck",    emoji: "🚛" },
  Sedan:    { color: "#00e5ff", glow: "rgba(0,229,255,0.5)",   bg: "rgba(0,229,255,0.06)",   label: "Sedan",    emoji: "🚗" },
};
function getCat(cat: string) { return CAT_CONFIG[cat] ?? CAT_CONFIG.Sport; }

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Car {
  id: string; name: string; brand: string; category: string;
  price: number; is_free: boolean; image_url: string | null;
  stats: { speed: number; acceleration: number; braking: number; handling: number } | null;
}

// ── Barra de stat animada con IntersectionObserver ────────────────────────────
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setWidth(value), 80); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase text-white/25 w-10 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[9px] text-white/25 w-5 text-right">{value}</span>
    </div>
  );
}

// ── Card con efecto 3D tilt ───────────────────────────────────────────────────
function CarCard({ car, index }: { car: Car; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cfg = getCat(car.category);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${y * -12}deg`);
    el.style.setProperty("--ry", `${x * 12}deg`);
    el.style.setProperty("--shine-x", `${(e.clientX - rect.left).toFixed(0)}px`);
    el.style.setProperty("--shine-y", `${(e.clientY - rect.top).toFixed(0)}px`);
    el.style.setProperty("--glow-opacity", "1");
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <Link href={`/cars/${car.id}`} className="block" style={{ animationDelay: `${index * 60}ms` }}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="car-card-3d group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer"
        style={{
          borderColor: `${cfg.color}25`,
          background: `linear-gradient(135deg, ${cfg.bg}, rgba(13,13,31,0.95))`,
          transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Shine effect en cursor */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 120px at var(--shine-x, 50%) var(--shine-y, 50%), ${cfg.glow.replace("0.5", "0.08")}, transparent 70%)`,
          }}
        />

        {/* Borde luminoso al hacer hover */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{ boxShadow: `inset 0 0 30px ${cfg.glow.replace("0.5", "0.12")}` }}
        />

        {/* Imagen */}
        <div className="relative aspect-video overflow-hidden bg-dark">
          {car.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.image_url} alt={car.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-16 h-16 text-white/5" />
            </div>
          )}

          {/* Overlay gradiente sobre imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />

          {/* Speed lines decorativas */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
            {[15, 35, 55, 75].map((pct) => (
              <div key={pct} className="absolute top-0 bottom-0 w-px"
                style={{ left: `${pct}%`, background: `linear-gradient(to bottom, transparent, ${cfg.color}40, transparent)`, animation: "speedline 0.6s ease-out forwards" }} />
            ))}
          </div>

          {/* Badge categoría */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm border text-[10px] font-mono uppercase tracking-widest"
            style={{ backgroundColor: `${cfg.bg}`, borderColor: `${cfg.color}40`, color: cfg.color }}>
            <span>{cfg.emoji}</span>
            {car.category}
          </div>

          {/* Badge editable */}
          <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm border text-[9px] font-mono"
            style={{ backgroundColor: "rgba(0,255,159,0.08)", borderColor: "rgba(0,255,159,0.3)", color: "#00ff9f" }}>
            ✎ Pro
          </div>

          {/* Precio sobre imagen (bottom) */}
          <div className="absolute bottom-2.5 right-2.5">
            {car.is_free ? (
              <span className="px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-orbitron font-black text-neon border border-neon/30 bg-neon/10">
                GRATIS
              </span>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm border border-primary/30 bg-primary/10">
                <Zap className="w-3 h-3" style={{ color: cfg.color }} />
                <span className="font-orbitron font-black text-sm" style={{ color: cfg.color }}>{car.price}</span>
                <span className="font-mono text-[9px] text-white/40">CR</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: `${cfg.color}80` }}>{car.brand}</p>
          <h3 className="font-orbitron font-black text-sm uppercase text-white group-hover:text-white transition-colors leading-tight mb-3">
            {car.name}
          </h3>

          {/* Stat bars animadas */}
          {car.stats && (
            <div className="space-y-1.5 mb-3">
              <StatBar label="Speed"  value={car.stats.speed}        color={cfg.color} />
              <StatBar label="Accel"  value={car.stats.acceleration} color={cfg.color} />
              <StatBar label="Brake"  value={car.stats.braking}      color={cfg.color} />
              <StatBar label="Handle" value={car.stats.handling}     color={cfg.color} />
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-end">
            <span className="flex items-center gap-1 text-[11px] font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ color: cfg.color }}>
              Ver carro <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Borde inferior luminoso */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.color}, transparent)` }} />
      </div>
    </Link>
  );
}

// ── Fondo animado con speed lines ─────────────────────────────────────────────
function AnimatedBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(to right, #ffffff22 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      {/* Glow corners */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: "#ff6600" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-8" style={{ background: "#a855f7" }} />
      {/* Speed lines estáticas */}
      {[8, 18, 28, 42, 58, 72, 82, 92].map((p, i) => (
        <div key={i} className="absolute top-0 bottom-0 w-px opacity-[0.03]"
          style={{ left: `${p}%`, background: "linear-gradient(to bottom, transparent 0%, #ffffff 30%, #ffffff 70%, transparent 100%)" }} />
      ))}
    </div>
  );
}

// ── Contador animado ──────────────────────────────────────────────────────────
function AnimatedCount({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setN(current);
      if (current >= target) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{n}</>;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function CarsCatalog({ cars }: { cars: Car[] }) {
  const [activeCat, setActiveCat]   = useState("Todos");
  const [search, setSearch]         = useState("");

  const categories = ["Todos", ...Array.from(new Set(cars.map(c => c.category))).sort()];

  const filtered = cars.filter(c => {
    const matchCat  = activeCat === "Todos" || c.category === activeCat;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="relative min-h-screen">
      <AnimatedBg />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-24">

        {/* ── Hero header ─────────────────────────────────────────── */}
        <div className="mb-12">
          {/* Etiqueta */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase">FiveMercado · Carros 2026</span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          {/* Título grande */}
          <div className="relative">
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl uppercase leading-none tracking-tighter">
              <span className="text-white">CATÁLOGO</span>
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ff6600 0%, #a855f7 50%, #00e5ff 100%)" }}>
                DE CARROS
              </span>
            </h1>
            {/* Línea decorativa */}
            <div className="absolute -right-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="font-orbitron font-black text-4xl text-white">
                  <AnimatedCount target={cars.length} />
                </p>
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">carros disponibles</p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          <p className="font-rajdhani text-white/35 text-lg mt-4 max-w-xl">
            Cada carro incluye <span className="text-primary">handling.meta</span> real. Edita velocidad, grip, suspensión y más antes de descargar.
          </p>
        </div>

        {/* ── Filtros ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar carro o marca..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-mid/80 border border-white/8 text-white text-sm font-rajdhani placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all"
            />
          </div>

          {/* Pills categoría */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => {
              const cfg = cat === "Todos" ? null : getCat(cat);
              const count = cat === "Todos" ? cars.length : cars.filter(c => c.category === cat).length;
              const isActive = activeCat === cat;
              return (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  className="relative px-3 py-2 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wide transition-all duration-200 border"
                  style={isActive && cfg ? {
                    borderColor: `${cfg.color}60`, backgroundColor: `${cfg.bg}`,
                    color: cfg.color, boxShadow: `0 0 12px ${cfg.glow.replace("0.5","0.2")}`
                  } : isActive ? {
                    borderColor: "#ffffff40", backgroundColor: "rgba(255,255,255,0.08)", color: "#ffffff"
                  } : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                >
                  {cfg && <span className="mr-1">{cfg.emoji}</span>}
                  {cat}
                  <span className="ml-1.5 opacity-40 text-[9px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Grid de carros ───────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-orbitron text-white/10 text-2xl uppercase">Sin resultados</p>
            <p className="font-mono text-white/20 text-sm mt-2">Prueba otra categoría o búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((car, i) => (
              <div key={car.id} className="animate-fade-in" style={{ animationDelay: `${(i % 12) * 50}ms`, opacity: 0, animationFillMode: "forwards" }}>
                <CarCard car={car} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* ── Info box ─────────────────────────────────────────────── */}
        <div className="mt-16 p-6 rounded-2xl border border-white/5 bg-dark-mid/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white uppercase text-sm mb-2">
                ¿Cómo funciona el Handling Editor?
              </h3>
              <p className="text-white/35 font-rajdhani text-sm leading-relaxed">
                Cada carro tiene un <code className="text-primary/70 text-xs">handling.meta</code> real extraído de servidores FiveM activos.
                Al comprar puedes ajustar velocidad máxima, frenado, grip y suspensión con validación en tiempo real —
                comparando contra <strong className="text-white/50">1,253 carros reales</strong> para que los valores sean siempre seguros.
              </p>
            </div>
            <div className="flex gap-6 flex-shrink-0">
              {[
                { n: "1,253", label: "Carros analizados" },
                { n: "8",     label: "Parámetros editables" },
                { n: "100%",  label: "XML validado" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-orbitron font-black text-2xl text-primary">{s.n}</p>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS para speed lines en hover */}
      <style jsx global>{`
        @keyframes speedline {
          0%   { transform: scaleY(0) translateY(-100%); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: scaleY(1) translateY(0%); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
