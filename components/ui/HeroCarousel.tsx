"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BASE = "https://img.fivemercado.com";

const SLIDES = [
  {
    src: `${BASE}/hero-marketplace.webm`,
    label: "MARKETPLACE",
    title: "Scripts Premium",
    sub: "Los mejores recursos FiveM en español",
    color: "from-primary/60",
  },
  {
    src: `${BASE}/car-customization.webm`,
    label: "EXCLUSIVO",
    title: "Edita el Handling",
    sub: "Personaliza cada carro desde la web",
    color: "from-secondary/50",
  },
  {
    src: `${BASE}/scripts-codigo.webm`,
    label: "SCRIPTS",
    title: "Código Verificado",
    sub: "Recursos revisados por nuestra comunidad",
    color: "from-pink/50",
  },
  {
    src: `${BASE}/ciudad-gta-noche.webm`,
    label: "FIVEM",
    title: "Lleva tu servidor",
    sub: "Al siguiente nivel",
    color: "from-primary/60",
  },
  {
    src: `${BASE}/carros-racing.webm`,
    label: "CARROS",
    title: "Catálogo de Vehículos",
    sub: "Con handling personalizado incluido",
    color: "from-neon/40",
  },
];

export function HeroCarousel() {
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((idx + SLIDES.length) % SLIDES.length);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const prev = () => go(current - 1);
  const next = useCallback(() => go(current + 1), [current, go]);

  // Reiniciar video al cambiar slide
  useEffect(() => {
    videoRef.current?.load();
  }, [current]);

  // Auto-advance cada 8s
  useEffect(() => {
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-primary/20 shadow-neon-orange group"
      style={{ aspectRatio: "16/7" }}
    >
      {/* Video de fondo */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>
        <video
          ref={videoRef}
          key={slide.src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={slide.src} type="video/webm" />
        </video>
      </div>

      {/* Overlay gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-dark/60 to-dark/20`} />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)" }}
      />

      {/* Contenido */}
      <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-10 transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        <span className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
          <span className="w-6 h-px bg-primary" />
          {slide.label}
        </span>
        <h2 className="font-orbitron font-black text-3xl sm:text-5xl uppercase text-white text-glow-orange leading-tight">
          {slide.title}
        </h2>
        <p className="font-rajdhani text-white/60 text-lg mt-1">{slide.sub}</p>
      </div>

      {/* Botones nav */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-dark/60 border border-primary/20 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/60 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-dark/60 border border-primary/20 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/60 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all rounded-full ${
              i === current
                ? "w-6 h-1.5 bg-primary shadow-neon-orange"
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute top-4 right-4 font-mono text-xs text-white/30">
        {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </div>
  );
}
