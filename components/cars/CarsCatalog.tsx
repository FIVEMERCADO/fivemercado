"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, Car, Search, Gauge, Wind, Disc, ChevronLeft, ChevronRight, X } from "lucide-react";

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
interface CarStats {
  speed: number; acceleration: number; braking: number; handling: number;
  engine?: string; drive?: string; gears?: number; topSpeed?: number; weight?: number;
}
interface Car {
  id: string; name: string; brand: string; category: string;
  price: number; is_free: boolean; image_url: string | null;
  stats: CarStats | null;
  photos?: string[] | null;
  is_animated?: boolean;
  description?: string | null;
}

// ── Stat bar (IntersectionObserver para cards) ────────────────────────────────
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setWidth(value), 100); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase text-white/30 w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{
          width: `${width}%`, backgroundColor: color,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: width > 0 ? `0 0 6px ${color}80` : "none"
        }} />
      </div>
      <span className="font-orbitron text-[10px] font-bold w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

// ── Stat bar (timeout para modal — no depende de IO) ─────────────────────────
function ModalStatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 250);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase text-white/30 w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{
          width: `${width}%`, backgroundColor: color,
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: width > 0 ? `0 0 8px ${color}90` : "none"
        }} />
      </div>
      <span className="font-orbitron text-[10px] font-bold w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
function CarModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const cfg    = getCat(car.category);
  const photos = car.photos?.length ? car.photos : (car.image_url ? [car.image_url] : []);
  const s      = car.stats;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    import("animejs").then(({ animate }) => {
      animate(".car-modal-panel", {
        opacity: [0, 1],
        scale: [0.93, 1],
        translateY: [20, 0],
        duration: 420,
        ease: "easeOutExpo",
      });
    });
  }, []);

  const prev = useCallback(() => setPhotoIdx(p => (p - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setPhotoIdx(p => (p + 1) % photos.length), [photos.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)" }}
      onClick={onClose}
    >
      <div
        className="car-modal-panel relative w-full max-w-5xl rounded-2xl border overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${cfg.bg}, #07070f)`,
          borderColor: `${cfg.color}25`,
          boxShadow: `0 0 100px ${cfg.glow.replace("0.5", "0.12")}, 0 0 0 1px ${cfg.color}10`,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* ── Galería ─────────────────────────────────────── */}
          <div className="lg:w-[56%] relative bg-black flex-shrink-0">
            {photos.length > 0 ? (
              <>
                <div className="relative" style={{ aspectRatio: "16/10" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={photoIdx}
                    src={photos[photoIdx]}
                    alt={car.name}
                    className="w-full h-full object-cover photo-fade"
                    style={{ filter: "brightness(0.95) contrast(1.06) saturate(1.12)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Arrows */}
                  {photos.length > 1 && (
                    <>
                      <button onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/90 transition-all z-10 backdrop-blur-sm">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/90 transition-all z-10 backdrop-blur-sm">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {photos.map((_, i) => (
                        <button key={i} onClick={() => setPhotoIdx(i)}
                          className="rounded-full transition-all duration-200"
                          style={{
                            width: i === photoIdx ? "22px" : "6px",
                            height: "6px",
                            backgroundColor: i === photoIdx ? cfg.color : "rgba(255,255,255,0.25)",
                          }} />
                      ))}
                    </div>
                  )}

                  {/* Top speed en foto */}
                  {s?.topSpeed && (
                    <div className="absolute bottom-10 right-4 text-right z-10">
                      <span className="font-orbitron font-black text-3xl leading-none" style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.color}` }}>
                        {s.topSpeed}
                      </span>
                      <span className="font-mono text-[9px] text-white/30 ml-1">km/h</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-1.5 p-2 bg-black/70 overflow-x-auto">
                    {photos.map((p, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className="flex-shrink-0 rounded-md overflow-hidden transition-all duration-200"
                        style={{
                          width: "64px", height: "42px",
                          opacity: i === photoIdx ? 1 : 0.38,
                          outline: i === photoIdx ? `2px solid ${cfg.color}` : "none",
                          outlineOffset: "1px",
                        }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[16/10] flex items-center justify-center">
                <Car className="w-24 h-24 text-white/5" />
              </div>
            )}
          </div>

          {/* ── Info ────────────────────────────────────────── */}
          <div className="lg:w-[44%] p-6 flex flex-col gap-5">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-widest border"
                style={{ borderColor: `${cfg.color}40`, color: cfg.color, backgroundColor: cfg.bg }}>
                {cfg.emoji} {car.category}
              </span>
              {car.is_animated && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-widest border"
                  style={{ borderColor: "rgba(0,229,255,0.45)", color: "#00e5ff", backgroundColor: "rgba(0,229,255,0.07)", animation: "pulse-anim 2s ease-in-out infinite" }}>
                  ✦ ANIMADO
                </span>
              )}
              <span className="px-2 py-1 rounded-md text-[8px] font-mono border"
                style={{ borderColor: "rgba(0,255,159,0.25)", color: "#00ff9f", backgroundColor: "rgba(0,255,159,0.06)" }}>
                ✎ Handling Pro
              </span>
            </div>

            {/* Nombre */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: `${cfg.color}70` }}>{car.brand}</p>
              <h2 className="font-orbitron font-black text-2xl sm:text-3xl uppercase text-white leading-tight">{car.name}</h2>
            </div>

            {/* Descripción */}
            {car.description && (
              <p className="font-rajdhani text-white/45 text-sm leading-relaxed border-l-2 pl-3" style={{ borderColor: `${cfg.color}50` }}>
                {car.description}
              </p>
            )}

            {/* Specs grid */}
            {s && (s.engine || s.drive || s.gears || s.topSpeed) && (
              <div className="grid grid-cols-2 gap-2">
                {s.engine && (
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-1">Motor</p>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      <p className="font-orbitron font-bold text-sm" style={{ color: cfg.color }}>{s.engine}</p>
                    </div>
                  </div>
                )}
                {s.drive && (
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-1">Tracción</p>
                    <div className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-white/40" />
                      <p className="font-orbitron font-bold text-sm text-white">{s.drive}</p>
                    </div>
                  </div>
                )}
                {s.gears && (
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-1">Marchas</p>
                    <div className="flex items-center gap-1.5">
                      <Disc className="w-3.5 h-3.5 text-white/40" />
                      <p className="font-orbitron font-bold text-sm text-white">{s.gears}</p>
                    </div>
                  </div>
                )}
                {s.weight && (
                  <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mb-1">Peso</p>
                    <p className="font-orbitron font-bold text-sm text-white">{s.weight} <span className="text-[9px] text-white/30 font-sans">kg</span></p>
                  </div>
                )}
              </div>
            )}

            {/* Performance bars */}
            {s && (
              <div className="space-y-2.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">Performance</p>
                <ModalStatBar label="Velocidad"    value={s.speed}        color={cfg.color} />
                <ModalStatBar label="Aceleración"  value={s.acceleration} color={cfg.color} />
                <ModalStatBar label="Frenado"      value={s.braking}      color={cfg.color} />
                <ModalStatBar label="Grip"         value={s.handling}     color={cfg.color} />
              </div>
            )}

            {/* Precio + CTA */}
            <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between gap-4">
              {car.is_free ? (
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Precio</p>
                  <p className="font-orbitron font-black text-3xl" style={{ color: "#00ff9f" }}>GRATIS</p>
                </div>
              ) : (
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Precio</p>
                  <div className="flex items-baseline gap-1.5">
                    <Zap className="w-5 h-5 mb-0.5" style={{ color: cfg.color }} />
                    <span className="font-orbitron font-black text-3xl" style={{ color: cfg.color }}>{car.price}</span>
                    <span className="font-mono text-xs text-white/30">CR</span>
                  </div>
                </div>
              )}
              <button
                className="flex-shrink-0 px-8 py-3 rounded-xl font-orbitron font-bold text-sm uppercase tracking-widest text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color}ee, ${cfg.color}99)`,
                  boxShadow: `0 4px 24px ${cfg.glow.replace("0.5", "0.45")}`,
                }}>
                {car.is_free ? "Descargar" : "Comprar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function CarCard({ car, index, onSelect }: { car: Car; index: number; onSelect: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cfg     = getCat(car.category);
  const photos  = car.photos?.length ? car.photos : (car.image_url ? [car.image_url] : []);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [hovered,  setHovered]  = useState(false);

  useEffect(() => {
    if (!hovered || photos.length <= 1) return;
    const interval = setInterval(() => setPhotoIdx(p => (p + 1) % photos.length), 1800);
    return () => clearInterval(interval);
  }, [hovered, photos.length]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.setProperty("--rx",      `${y * -10}deg`);
    el.style.setProperty("--ry",      `${x * 10}deg`);
    el.style.setProperty("--shine-x", `${(e.clientX - rect.left).toFixed(0)}px`);
    el.style.setProperty("--shine-y", `${(e.clientY - rect.top).toFixed(0)}px`);
    el.style.setProperty("--glow-o",  "1");
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current; if (!el) return;
    el.style.setProperty("--rx",    "0deg");
    el.style.setProperty("--ry",    "0deg");
    el.style.setProperty("--glow-o","0");
    setHovered(false);
  }, []);

  const s = car.stats;

  return (
    <div className="car-card-enter block cursor-pointer" style={{ "--i": index } as React.CSSProperties} onClick={onSelect}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        className="group relative rounded-2xl overflow-hidden border h-full"
        style={{
          borderColor: `${cfg.color}20`,
          background: `linear-gradient(145deg, ${cfg.bg}, rgba(7,7,16,0.97))`,
          transform: "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          transition: "transform 0.12s ease, box-shadow 0.35s ease, border-color 0.3s ease",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Shine */}
        <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
          style={{ background: `radial-gradient(circle 100px at var(--shine-x,50%) var(--shine-y,50%), ${cfg.color}12, transparent 70%)`, opacity: "var(--glow-o,0)", transition: "opacity 0.3s" }} />

        {/* Imagen */}
        <div className="relative overflow-hidden bg-black" style={{ aspectRatio: "16/10" }}>
          {photos.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={photoIdx}
                src={photos[photoIdx]}
                alt={car.name}
                className="w-full h-full object-cover photo-fade"
                style={{ filter: "brightness(0.92) contrast(1.08) saturate(1.1)" }}
              />
              {photos.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photos.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                      className="rounded-full transition-all duration-200"
                      style={{ width: i === photoIdx ? "16px" : "5px", height: "5px", backgroundColor: i === photoIdx ? cfg.color : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-16 h-16 text-white/5" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-[#07071040] to-transparent" />

          {/* Badge categoría */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg backdrop-blur-sm border text-[9px] font-mono uppercase tracking-widest z-10"
            style={{ backgroundColor: cfg.bg, borderColor: `${cfg.color}40`, color: cfg.color }}>
            {cfg.emoji} {car.category}
          </div>

          {/* Badge derecho: ANIMADO o Pro */}
          {car.is_animated ? (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md backdrop-blur-sm border text-[8px] font-mono z-10 flex items-center gap-1"
              style={{ backgroundColor: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.35)", color: "#00e5ff", animation: "pulse-anim 2s ease-in-out infinite" }}>
              ✦ ANIMADO
            </div>
          ) : (
            <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm border text-[8px] font-mono z-10"
              style={{ backgroundColor: "rgba(0,255,159,0.08)", borderColor: "rgba(0,255,159,0.25)", color: "#00ff9f" }}>
              ✎ Pro
            </div>
          )}

          {/* Top speed */}
          {s?.topSpeed && (
            <div className="absolute bottom-8 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-10">
              <div className="text-right">
                <span className="font-orbitron font-black text-xl leading-none" style={{ color: cfg.color }}>{s.topSpeed}</span>
                <span className="font-mono text-[8px] text-white/30 ml-0.5">km/h</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: `${cfg.color}70` }}>{car.brand}</p>
            <h3 className="font-orbitron font-black text-sm uppercase text-white leading-tight">{car.name}</h3>
          </div>

          {s && (s.engine || s.drive || s.gears) && (
            <div className="flex gap-2 flex-wrap">
              {s.engine && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono border"
                  style={{ borderColor: `${cfg.color}25`, color: `${cfg.color}90`, backgroundColor: cfg.bg }}>
                  <Gauge className="w-2.5 h-2.5" /> {s.engine}
                </span>
              )}
              {s.drive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono border border-white/8 text-white/30">
                  <Wind className="w-2.5 h-2.5" /> {s.drive}
                </span>
              )}
              {s.gears && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono border border-white/8 text-white/30">
                  <Disc className="w-2.5 h-2.5" /> {s.gears}V
                </span>
              )}
            </div>
          )}

          {s && (
            <div className="space-y-1.5">
              <StatBar label="Vel"   value={s.speed}        color={cfg.color} />
              <StatBar label="Acel"  value={s.acceleration} color={cfg.color} />
              <StatBar label="Freno" value={s.braking}      color={cfg.color} />
              <StatBar label="Grip"  value={s.handling}     color={cfg.color} />
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            {car.is_free ? (
              <span className="font-orbitron font-black text-xs" style={{ color: "#00ff9f" }}>GRATIS</span>
            ) : (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" style={{ color: cfg.color }} />
                <span className="font-orbitron font-black text-base" style={{ color: cfg.color }}>{car.price}</span>
                <span className="font-mono text-[9px] text-white/30">CR</span>
              </div>
            )}
            <span className="flex items-center gap-1 text-[10px] font-rajdhani font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: cfg.color }}>
              Ver detalle →
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.color}, transparent)` }} />
      </div>
    </div>
  );
}

// ── Fondo ──────────────────────────────────────────────────────────────────────
function AnimatedBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 opacity-[0.022]"
        style={{ backgroundImage: "linear-gradient(#fff1 1px,transparent 1px),linear-gradient(to right,#fff1 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.07]" style={{ background: "#ff6600" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-[0.06]" style={{ background: "#a855f7" }} />
      {[8,18,32,48,62,76,88].map((p,i) => (
        <div key={i} className="absolute top-0 bottom-0 w-px opacity-[0.025]"
          style={{ left: `${p}%`, background: "linear-gradient(to bottom, transparent 0%, #fff 30%, #fff 70%, transparent)" }} />
      ))}
    </div>
  );
}

function AnimatedCount({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0; const step = Math.ceil(target / 40);
    const t = setInterval(() => { cur = Math.min(cur + step, target); setN(cur); if (cur >= target) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{n}</>;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function CarsCatalog({ cars }: { cars: Car[] }) {
  const [activeCat,    setActiveCat]    = useState("Todos");
  const [search,       setSearch]       = useState("");
  const [selectedCar,  setSelectedCar]  = useState<Car | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("animejs").then(({ animate, stagger }) => {
      animate(".car-card-enter", {
        opacity: [0, 1],
        translateY: [32, 0],
        scale: [0.96, 1],
        delay: stagger(70, { start: 100 }),
        duration: 600,
        ease: "easeOutExpo",
      });
    });
  }, [activeCat, search]);

  const categories = ["Todos", ...Array.from(new Set(cars.map(c => c.category))).sort()];
  const filtered = cars.filter(c => {
    const matchCat    = activeCat === "Todos" || c.category === activeCat;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="relative min-h-screen">
      <AnimatedBg />

      {selectedCar && (
        <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-24">

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase">FiveMercado · Carros 2026</span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          <div className="relative">
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl uppercase leading-none tracking-tighter">
              <span className="text-white">CATÁLOGO</span><br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#ff6600 0%,#a855f7 50%,#00e5ff 100%)" }}>
                DE CARROS
              </span>
            </h1>
            <div className="absolute -right-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="font-orbitron font-black text-4xl text-white"><AnimatedCount target={cars.length} /></p>
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">carros disponibles</p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>
          </div>
          <p className="font-rajdhani text-white/35 text-lg mt-4 max-w-xl">
            Cada carro incluye <span className="text-primary">handling.meta</span> real — editá velocidad, grip y suspensión antes de descargar.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar carro o marca..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-mid/80 border border-white/8 text-white text-sm font-rajdhani placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => {
              const cfg = cat === "Todos" ? null : getCat(cat);
              const count = cat === "Todos" ? cars.length : cars.filter(c => c.category === cat).length;
              const isActive = activeCat === cat;
              return (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  className="px-3 py-2 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wide transition-all duration-200 border"
                  style={isActive && cfg ? {
                    borderColor: `${cfg.color}60`, backgroundColor: cfg.bg, color: cfg.color,
                    boxShadow: `0 0 14px ${cfg.glow.replace("0.5","0.18")}`
                  } : isActive ? {
                    borderColor: "#ffffff40", backgroundColor: "rgba(255,255,255,0.08)", color: "#fff"
                  } : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                  {cfg && <span className="mr-1">{cfg.emoji}</span>}
                  {cat}
                  <span className="ml-1.5 opacity-40 text-[9px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-orbitron text-white/10 text-2xl uppercase">Sin resultados</p>
            <p className="font-mono text-white/20 text-sm mt-2">Prueba otra categoría o búsqueda</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((car, i) => (
              <div key={car.id} style={{ opacity: 0 }}>
                <CarCard car={car} index={i} onSelect={() => setSelectedCar(car)} />
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-16 p-6 rounded-2xl border border-white/5 bg-dark-mid/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white uppercase text-sm mb-2">¿Cómo funciona el Handling Editor?</h3>
              <p className="text-white/35 font-rajdhani text-sm leading-relaxed">
                Cada carro incluye el <code className="text-primary/70 text-xs">handling.meta</code> original del modelo.
                Al comprar podés editar velocidad, frenado, grip y suspensión — el archivo XML se genera con tus cambios aplicados sobre los valores reales.
              </p>
            </div>
            <div className="flex gap-6 flex-shrink-0">
              {[{ n: "10", label: "Parámetros editables" }, { n: "6", label: "Presets incluidos" }, { n: "100%", label: "XML original" }].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-orbitron font-black text-2xl text-primary">{s.n}</p>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes photo-fade { from { opacity:0; transform:scale(1.03); } to { opacity:1; transform:scale(1); } }
        .photo-fade { animation: photo-fade 0.35s ease-out; }
        @keyframes pulse-anim {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(0,229,255,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 16px rgba(0,229,255,0.7); }
        }
      `}</style>
    </div>
  );
}
