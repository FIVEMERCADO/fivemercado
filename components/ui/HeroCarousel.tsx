"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Terminal } from "lucide-react";

const BASE = "https://img.fivemercado.com";

const SLIDES = [
  { src: `${BASE}/hero-marketplace.webp`,  label: "MARKETPLACE",  title: "Scripts Premium",       sub: "Los mejores recursos FiveM en español" },
  { src: `${BASE}/car-customization.webp`, label: "EXCLUSIVO",    title: "Edita el Handling",     sub: "Personaliza cada carro desde la web"   },
  { src: `${BASE}/scripts-codigo.webp`,    label: "SCRIPTS",      title: "Código Verificado",     sub: "Recursos revisados por la comunidad"   },
  { src: `${BASE}/ciudad-gta-noche.webp`,  label: "FIVEM",        title: "Lleva tu servidor",     sub: "Al siguiente nivel"                    },
  { src: `${BASE}/carros-racing.webp`,     label: "CARROS",       title: "Catálogo de Vehículos", sub: "Con handling personalizado incluido"   },
];

// ── Matrix rain canvas ────────────────────────────────────────────────────────
const CHARS = "01FIVEMERCADOアイウエカキクサシスタチツ∑∆Ω{}[]<>|#$%^&*!?";

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sync = () => {
      canvas.width  = canvas.offsetWidth  || 1280;
      canvas.height = canvas.offsetHeight || 560;
    };
    sync();

    const obs = new ResizeObserver(sync);
    obs.observe(canvas);

    const FS = 13;
    let drops: number[] = [];

    const init = () => {
      drops = Array(Math.ceil(canvas.width / FS))
        .fill(0)
        .map(() => -Math.floor(Math.random() * 60));
    };
    init();

    const tick = () => {
      // Trail fade
      ctx.fillStyle = "rgba(7,7,16,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FS}px 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FS;
        if (y < 0) { drops[i]++; continue; }

        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Head = bright white, rest = green fading with depth
        if (drops[i] >= 0 && drops[i] <= 2) {
          ctx.fillStyle = "#ffffff";
        } else {
          const fade = Math.max(0, 1 - (drops[i] * FS) / canvas.height);
          ctx.fillStyle = `rgba(0,255,159,${0.15 + fade * 0.6})`;
        }

        ctx.fillText(ch, i * FS, y);
        drops[i]++;
        if (y > canvas.height) drops[i] = -Math.floor(Math.random() * 40);
      }
    };

    const id = setInterval(tick, 45);
    return () => { clearInterval(id); obs.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// ── Main hero ─────────────────────────────────────────────────────────────────
export function HeroCarousel() {
  const [current,      setCurrent]      = useState(0);
  const [glitching,    setGlitching]    = useState(false);
  const [transitioning,setTransitioning]= useState(false);
  const [typed,        setTyped]        = useState("");

  // Slide change with glitch effect
  const go = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setGlitching(true);
    setTimeout(() => {
      setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
      setGlitching(false);
      setTimeout(() => setTransitioning(false), 150);
    }, 380);
  }, [transitioning]);

  const prev = () => go(current - 1);
  const next = useCallback(() => go(current + 1), [current, go]);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  // Typing effect on slide label
  useEffect(() => {
    setTyped("");
    const label = SLIDES[current].label;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(label.slice(0, i));
      if (i >= label.length) clearInterval(t);
    }, 65);
    return () => clearInterval(t);
  }, [current]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-neon/25 group"
      style={{ aspectRatio: "16/7", boxShadow: "0 0 40px rgba(0,255,159,0.12), 0 0 1px rgba(0,255,159,0.4)" }}
    >
      {/* ── Layer 1: Matrix rain (base) ── */}
      <MatrixRain />

      {/* ── Layer 2: Imagen semi-transparente ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: glitching ? 0 : 0.55 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
      </div>

      {/* ── Glitch chromatic aberration ── */}
      {glitching && (
        <>
          <div className="absolute inset-0" style={{ opacity: 0.35, mixBlendMode: "screen", transform: "translate(-5px,1px)", filter: "hue-rotate(180deg) saturate(300%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ opacity: 0.35, mixBlendMode: "screen", transform: "translate(5px,-1px)", filter: "hue-rotate(0deg) saturate(300%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Horizontal glitch bands */}
          {[15, 42, 68].map((y) => (
            <div key={y} className="absolute left-0 right-0 h-3 bg-neon/8 pointer-events-none"
              style={{ top: `${y}%`, transform: `translateX(${y % 2 === 0 ? -10 : 10}px)` }} />
          ))}
        </>
      )}

      {/* ── Layer 3: Gradientes oscuros ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark/75 via-dark/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-dark/20" />

      {/* ── Scanlines verdes sutiles ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,159,0.025) 3px,rgba(0,255,159,0.025) 4px)" }} />

      {/* ── Corner brackets estilo hacker ── */}
      <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-neon/50" />
      <div className="absolute top-3 right-12 w-5 h-5 border-r-2 border-t-2 border-neon/50" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-neon/50" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-neon/50" />

      {/* ── Status top-right ── */}
      <div className="absolute top-3 right-3 font-mono text-[10px] text-neon/50 flex items-center gap-3 pr-1">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          SYS_ONLINE
        </span>
        <span>{String(current + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}</span>
      </div>

      {/* ── Contenido ── */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        {/* Terminal label */}
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-3.5 h-3.5 text-neon flex-shrink-0" />
          <span className="font-mono text-xs text-neon tracking-[0.35em] uppercase">
            {typed}
            <span className={`inline-block w-[7px] h-[13px] bg-neon align-middle ml-0.5 ${typed.length >= slide.label.length ? "animate-pulse" : ""}`} />
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-orbitron font-black text-3xl sm:text-5xl uppercase text-white leading-tight mb-2"
          style={{ textShadow: "0 0 20px rgba(0,255,159,0.4), 0 0 60px rgba(0,255,159,0.1)" }}
        >
          {slide.title}
        </h2>

        {/* Sub */}
        <p className="font-mono text-sm text-neon/50 tracking-wider">
          <span className="text-neon/30">&gt;&gt; </span>{slide.sub}
        </p>
      </div>

      {/* ── Nav buttons ── */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 border border-neon/20 bg-dark/60 flex items-center justify-center text-neon/40 hover:text-neon hover:border-neon/60 transition-all opacity-0 group-hover:opacity-100 rounded"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 border border-neon/20 bg-dark/60 flex items-center justify-center text-neon/40 hover:text-neon hover:border-neon/60 transition-all opacity-0 group-hover:opacity-100 rounded"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all rounded-sm ${
              i === current
                ? "w-6 h-1.5 bg-neon shadow-neon-green"
                : "w-1.5 h-1.5 bg-white/20 hover:bg-neon/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
