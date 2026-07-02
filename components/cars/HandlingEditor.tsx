"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, HelpCircle, Flame, ChevronRight } from "lucide-react";
import knowledgeRaw from "@/lib/handling_knowledge.json";
import { calcVisualStats } from "@/lib/handling-xml";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FieldStats { min: number; max: number; avg: number; p25: number; p50: number; p75: number }
interface KB { total_cars: number; global: { fields: Record<string, FieldStats> }; categories: Record<string, { count: number; fields: Record<string, FieldStats> }> }
const KB = knowledgeRaw as KB;

// ── Solo los 8 parámetros que un jugador entiende ─────────────────────────────
interface Param { key: string; label: string; unit: string; step: number; decimals: number; tip: string; game_tip: string; emoji: string }

const PARAMS: Param[] = [
  {
    key: "fInitialDriveMaxFlatVel", label: "Velocidad Máxima",   unit: "km/h", step: 5,    decimals: 0,
    emoji: "🏎", tip: "Velocidad tope en recta",
    game_tip: "Cuanto más alto, más velocidad máxima alcanza el carro. Para sport/supercar sube a 280–320 km/h.",
  },
  {
    key: "fInitialDriveForce",      label: "Potencia del Motor", unit: "",     step: 0.01, decimals: 3,
    emoji: "⚡", tip: "Fuerza de aceleración",
    game_tip: "Determina qué tan fuerte empuja el motor. Muy alto hace las ruedas patinar al salir.",
  },
  {
    key: "nInitialDriveGears",      label: "Número de Marchas",  unit: "vel",  step: 1,    decimals: 0,
    emoji: "⚙️", tip: "Velocidades del gearbox",
    game_tip: "Más marchas = aceleración más suave y progresiva. Sport: 6-7, Supercar: 7-8.",
  },
  {
    key: "fBrakeForce",             label: "Potencia de Frenos", unit: "",     step: 0.05, decimals: 2,
    emoji: "🛑", tip: "Qué tan corto frena",
    game_tip: "Más alto frena más corto. Muy alto puede bloquear ruedas en curvas. Sport: 0.6–0.9.",
  },
  {
    key: "fHandBrakeForce",         label: "Freno de Mano",      unit: "",     step: 0.1,  decimals: 1,
    emoji: "💨", tip: "Para drifts y handbrake turns",
    game_tip: "Alto para hacer drifts y derrapes controlados. Bajo para grip en pista.",
  },
  {
    key: "fTractionCurveMax",       label: "Grip de Tracción",   unit: "",     step: 0.05, decimals: 2,
    emoji: "🛞", tip: "Agarre al acelerar",
    game_tip: "Más alto = más grip, menos derrape. Bajo = derrapa fácil (drift). Sport: 2.0–2.8.",
  },
  {
    key: "fSuspensionForce",        label: "Dureza Suspensión",  unit: "",     step: 0.1,  decimals: 1,
    emoji: "🌀", tip: "Suave ↔ Dura",
    game_tip: "1-2 = suave (cómoda). 3-4 = sport (pegada al suelo). 5+ = competición (muy dura).",
  },
  {
    key: "fDriveBiasFront",         label: "Distribución 4x4",   unit: "",     step: 0.1,  decimals: 2,
    emoji: "🚗", tip: "0=Trasera · 0.5=AWD · 1=Delantera",
    game_tip: "0 = tracción solo trasera (RWD, sport). 0.5 = 4x4 total. 1 = tracción delantera (FWD).",
  },
];

// ── Presets ───────────────────────────────────────────────────────────────────
interface Preset { label: string; color: string; glowClass: string; desc: string; values: Partial<Record<string, number>> }
const PRESETS: Record<string, Preset> = {
  stock:   { label: "Original",  color: "#ffffff60",  glowClass: "",                     desc: "Configuración original del fabricante",          values: {} },
  race:    { label: "Carrera",   color: "#ff6600",    glowClass: "shadow-primary/30",     desc: "Máxima velocidad y frenado agresivo",            values: { fInitialDriveForce: 0.48, fBrakeForce: 1.1, fTractionCurveMax: 2.8, fSuspensionForce: 3.5, fInitialDriveMaxFlatVel: 300, nInitialDriveGears: 7 } },
  drift:   { label: "Drift",     color: "#ec4899",    glowClass: "shadow-pink/30",        desc: "Trasera suelta para derrapes controlados",       values: { fInitialDriveForce: 0.4,  fTractionCurveMax: 1.3, fHandBrakeForce: 1.8, fBrakeForce: 0.6, fDriveBiasFront: 0, nInitialDriveGears: 6 } },
  grip:    { label: "Grip",      color: "#00ff9f",    glowClass: "shadow-neon/30",        desc: "Máximo agarre para circuitos técnicos",          values: { fTractionCurveMax: 3.2, fSuspensionForce: 3.8, fHandBrakeForce: 0.3, fBrakeForce: 0.9, fDriveBiasFront: 0 } },
  offroad: { label: "Offroad",   color: "#facc15",    glowClass: "shadow-yellow-400/30",  desc: "Suspensión alta y tracción total para campo",    values: { fSuspensionForce: 1.2, fDriveBiasFront: 0.5, fTractionCurveMax: 2.0, fInitialDriveMaxFlatVel: 180, nInitialDriveGears: 5 } },
  street:  { label: "Calle",     color: "#7c3aed",    glowClass: "shadow-secondary/30",   desc: "Balance diario — rápido y cómodo para tráfico", values: { fInitialDriveForce: 0.32, fBrakeForce: 0.7, fSuspensionForce: 2.0, fTractionCurveMax: 2.3, fInitialDriveMaxFlatVel: 220 } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBounds(key: string, cat: string) {
  return KB.categories[cat]?.fields[key] ?? KB.global.fields[key] ?? null;
}
type Level = "ok" | "warn" | "danger";
function getLevel(val: number, bounds: ReturnType<typeof getBounds>): Level {
  if (!bounds) return "ok";
  if (val < bounds.min || val > bounds.max) return "danger";
  if (val < bounds.p25 || val > bounds.p75) return "warn";
  return "ok";
}
function pct(val: number, min: number, max: number) {
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

// ── Gauge SVG animado ─────────────────────────────────────────────────────────
function StatGauge({ label, value, color, emoji, delta }: { label: string; value: number; color: string; emoji: string; delta: number }) {
  const R = 28;
  const circ = 2 * Math.PI * R;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[68px] h-[68px]">
        <svg className="-rotate-90 w-full h-full" viewBox="0 0 68 68">
          {/* Track */}
          <circle cx="34" cy="34" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          {/* Progress arc */}
          <circle
            cx="34" cy="34" r={R} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl leading-none">{emoji}</span>
          <span className="font-orbitron font-black text-[11px] mt-0.5" style={{ color }}>{value}</span>
        </div>
      </div>
      <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider mt-1">{label}</p>
      {delta !== 0 && (
        <p className={`font-mono text-[9px] font-bold ${delta > 0 ? "text-neon" : "text-red-400"}`}>
          {delta > 0 ? "+" : ""}{delta}
        </p>
      )}
    </div>
  );
}

// ── Slider de parámetro ───────────────────────────────────────────────────────
function ParamSlider({ param, value, original, bounds, catKey, helpActive, onHelp, onChange, onReset }: {
  param: Param; value: number; original: number; bounds: ReturnType<typeof getBounds>;
  catKey: string; helpActive: boolean; onHelp: () => void;
  onChange: (v: number) => void; onReset: () => void;
}) {
  const level   = getLevel(value, bounds);
  const changed = value !== original;
  const sMin    = bounds ? Math.min(bounds.min * 0.8, original * 0.5, 0) : 0;
  const sMax    = bounds ? Math.max(bounds.max * 1.2, original * 2, 1)   : 10;
  const fillPct = pct(value, sMin, sMax);
  const origPct = pct(original, sMin, sMax);

  const accent = level === "danger" ? "#ef4444" : level === "warn" ? "#facc15" : changed ? "#ff6600" : "rgba(255,255,255,0.25)";

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      changed       ? "border-primary/30 bg-primary/3"       :
      level === "danger" ? "border-red-500/20 bg-red-500/3"   :
      level === "warn"   ? "border-yellow-500/20"             :
      "border-white/6 hover:border-white/10"
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl select-none">{param.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-rajdhani font-bold text-white text-sm">{param.label}</span>
              {param.unit && (
                <span className="font-mono text-[9px] text-white/25 border border-white/10 px-1.5 py-0.5 rounded">{param.unit}</span>
              )}
              {changed && (
                <span className="font-mono text-[9px] text-white/25">
                  orig: <span className="text-primary/60">{original.toFixed(param.decimals)}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/30 font-rajdhani mt-0.5">{param.tip}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {changed && (
              <button onClick={onReset} title="Restaurar original"
                className="w-7 h-7 rounded-lg bg-dark/60 border border-white/8 flex items-center justify-center text-white/30 hover:text-primary hover:border-primary/30 transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onHelp}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                helpActive ? "bg-secondary/10 border-secondary/40 text-secondary" : "bg-dark/60 border-white/8 text-white/30 hover:text-secondary hover:border-secondary/30"
              }`}>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <input
              type="number" value={value} step={param.step}
              onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(parseFloat(v.toFixed(param.decimals))); }}
              className="w-[72px] text-right font-orbitron font-bold text-sm rounded-xl px-2.5 py-1.5 border bg-dark/80 outline-none focus:ring-1 transition-all"
              style={{ color: accent, borderColor: `${accent}50`, boxShadow: changed ? `0 0 8px ${accent}25` : "none" }}
            />
          </div>
        </div>

        {/* Tooltip de ayuda */}
        {helpActive && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-secondary/5 border border-secondary/15 text-[11px] text-secondary/80 font-rajdhani leading-relaxed flex gap-2">
            <span className="flex-shrink-0">💡</span>
            <div>
              {param.game_tip}
              {bounds && (
                <span className="block mt-1.5 font-mono text-white/25 text-[10px]">
                  Zona normal para {catKey}: {bounds.p25}–{bounds.p75} · Promedio: {bounds.avg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Track + slider */}
        <div className="relative">
          <div className="relative h-3 bg-dark/60 rounded-full">
            {/* Zona p25-p75 saludable */}
            {bounds && (
              <div className="absolute top-0 bottom-0 rounded-full bg-neon/10 pointer-events-none"
                style={{ left: `${pct(bounds.p25, sMin, sMax)}%`, right: `${100 - pct(bounds.p75, sMin, sMax)}%` }} />
            )}
            {/* Fill */}
            <div className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
              style={{ width: `${fillPct}%`, backgroundColor: accent, boxShadow: changed ? `0 0 10px ${accent}60` : "none", transition: "width 0.25s ease, background-color 0.3s" }}
            />
            {/* Marcador del original */}
            {changed && (
              <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-sm bg-white/40 pointer-events-none z-10"
                style={{ left: `calc(${origPct}% - 3px)` }} />
            )}
            <input type="range" min={sMin} max={sMax} step={param.step} value={value}
              onChange={e => onChange(parseFloat(parseFloat(e.target.value).toFixed(param.decimals)))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-mono">
            <span className="text-white/12">{sMin.toFixed(param.decimals)}</span>
            {bounds && <span className="text-neon/20">zona normal: {bounds.p25}–{bounds.p75}</span>}
            <span className="text-white/12">{sMax.toFixed(param.decimals)}</span>
          </div>
        </div>

        {/* Advertencia inline */}
        {level !== "ok" && bounds && (
          <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-mono ${level === "danger" ? "text-red-400" : "text-yellow-400"}`}>
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {level === "danger"
              ? `Fuera del rango real (${bounds.min}–${bounds.max}). Puede romper el handling en-game.`
              : `Inusual para ${catKey}. Zona normal: ${bounds.p25}–${bounds.p75}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface HandlingEditorProps {
  originalHandling: Record<string, number>;
  handlingName: string;
  category: string;
  onConfirm?: (values: Record<string, number>) => void;
  saving?: boolean;
  editPrice?: number;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function HandlingEditor({ originalHandling, handlingName, category, onConfirm, saving, editPrice = 0 }: HandlingEditorProps) {
  const [values, setValues]           = useState<Record<string, number>>(originalHandling);
  const [activeHelp, setActiveHelp]   = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState("stock");
  const [flash, setFlash]             = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const catKey   = category in KB.categories ? category : "Sport";
  const catCount = KB.categories[catKey]?.count ?? 0;

  const origStats = useMemo(() => calcVisualStats(originalHandling), [originalHandling]);
  const currStats = useMemo(() => calcVisualStats(values), [values]);

  const changedParams = PARAMS.filter(p => {
    const curr = values[p.key] ?? originalHandling[p.key];
    return curr !== undefined && curr !== originalHandling[p.key];
  });
  const hasChanges = changedParams.length > 0;

  let warns = 0, errors = 0;
  for (const p of PARAMS) {
    const lvl = getLevel(values[p.key] ?? originalHandling[p.key] ?? 0, getBounds(p.key, catKey));
    if (lvl === "warn")   warns++;
    if (lvl === "danger") errors++;
  }

  const setVal = useCallback((key: string, v: number) => {
    setValues(prev => ({ ...prev, [key]: v }));
    setActivePreset("custom");
  }, []);

  const resetParam = useCallback((key: string) => {
    setValues(prev => ({ ...prev, [key]: originalHandling[key] }));
  }, [originalHandling]);

  const applyPreset = (id: string) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    if (id === "stock") {
      setValues({ ...originalHandling });
    } else {
      const preset = PRESETS[id];
      setValues(prev => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(preset.values)) {
          if (next[k] !== undefined) next[k] = v as number;
        }
        return next;
      });
    }
    setActivePreset(id);
  };

  if (!mounted) return <div className="h-96 animate-pulse bg-dark-mid rounded-2xl" />;

  const GAUGES = [
    { label: "Velocidad",   emoji: "🏎", val: currStats.speed,        orig: origStats.speed,        color: "#ff6600" },
    { label: "Aceleración", emoji: "⚡",  val: currStats.acceleration, orig: origStats.acceleration, color: "#00ff9f" },
    { label: "Frenado",     emoji: "🛑", val: currStats.braking,      orig: origStats.braking,      color: "#7c3aed" },
    { label: "Manejo",      emoji: "🛞", val: currStats.handling,     orig: origStats.handling,     color: "#ec4899" },
  ];

  return (
    <div className={`space-y-4 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

      {/* ── Gauges ──────────────────────────────────────────────────── */}
      <div className={`p-4 rounded-2xl border bg-dark-mid transition-all duration-300 ${flash ? "border-primary/50 shadow-lg shadow-primary/10" : "border-white/6"}`}>
        <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-4">
          Estadísticas en tiempo real <span className="text-white/10 ml-2">│ barra blanca = original</span>
        </p>
        <div className="flex justify-around">
          {GAUGES.map(g => (
            <StatGauge key={g.label} label={g.label} value={g.val} color={g.color} emoji={g.emoji} delta={g.val - g.orig} />
          ))}
        </div>
      </div>

      {/* ── Presets ─────────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Perfil de manejo</p>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(PRESETS).map(([id, p]) => (
            <button key={id} onClick={() => applyPreset(id)}
              className={`px-3 py-1.5 rounded-xl font-rajdhani font-bold text-xs uppercase tracking-wide border transition-all duration-200 ${
                activePreset === id
                  ? `border-opacity-40 bg-opacity-10 shadow-md ${p.glowClass}`
                  : "border-white/8 text-white/35 hover:border-white/20 hover:text-white/60"
              }`}
              style={activePreset === id ? { borderColor: `${p.color}60`, backgroundColor: `${p.color}12`, color: p.color } : {}}>
              {p.label}
            </button>
          ))}
          {activePreset === "custom" && (
            <span className="px-3 py-1.5 rounded-xl font-rajdhani font-bold text-xs uppercase tracking-wide border border-neon/30 bg-neon/5 text-neon">
              ✏ Custom
            </span>
          )}
        </div>
        {activePreset !== "stock" && activePreset !== "custom" && PRESETS[activePreset] && (
          <p className="text-[11px] text-white/25 font-rajdhani mt-1.5 pl-1">{PRESETS[activePreset].desc}</p>
        )}
      </div>

      {/* ── Validación ──────────────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono px-1">
        <span className="text-white/20">{catCount} carros {catKey} analizados</span>
        {errors > 0 && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors} error{errors > 1 ? "es" : ""}</span>}
        {warns  > 0 && <span className="text-yellow-400">⚠ {warns} inusual{warns > 1 ? "es" : ""}</span>}
        {!errors && !warns && <span className="text-neon flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Todo en rango seguro</span>}
        {hasChanges && <span className="ml-auto text-primary/60">{changedParams.length} parámetro{changedParams.length > 1 ? "s" : ""} modificado{changedParams.length > 1 ? "s" : ""}</span>}
      </div>

      {/* ── Sliders ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {PARAMS.map(param => {
          const val  = values[param.key]  ?? originalHandling[param.key] ?? 0;
          const orig = originalHandling[param.key] ?? val;
          return (
            <ParamSlider
              key={param.key}
              param={param}
              value={val}
              original={orig}
              bounds={getBounds(param.key, catKey)}
              catKey={catKey}
              helpActive={activeHelp === param.key}
              onHelp={() => setActiveHelp(activeHelp === param.key ? null : param.key)}
              onChange={v => setVal(param.key, v)}
              onReset={() => resetParam(param.key)}
            />
          );
        })}
      </div>

      {/* ── Resumen de cambios ───────────────────────────────────────── */}
      {hasChanges && (
        <div className="p-4 rounded-xl border border-primary/15 bg-primary/3">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Cambios aplicados</p>
          <div className="space-y-1.5">
            {changedParams.map(p => {
              const orig  = originalHandling[p.key] ?? 0;
              const curr  = values[p.key] ?? 0;
              const delta = curr - orig;
              return (
                <div key={p.key} className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-white/40 flex-1">{p.label}</span>
                  <span className="text-white/20">{orig.toFixed(p.decimals)}</span>
                  <ChevronRight className="w-3 h-3 text-white/15" />
                  <span className="text-primary font-bold">{curr.toFixed(p.decimals)}</span>
                  <span className={`text-[9px] ${delta > 0 ? "text-neon" : "text-red-400"}`}>
                    ({delta > 0 ? "+" : ""}{delta.toFixed(p.decimals)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      {onConfirm && (
        <div className="space-y-2 pt-1">
          {errors > 0 ? (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Corrige los valores en rojo antes de continuar — podrían romper el handling en-game.
            </div>
          ) : (
            <button
              onClick={() => onConfirm(values)}
              disabled={saving}
              className="w-full btn-gta py-4 rounded-2xl font-orbitron font-black text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generando archivo...</>
              ) : hasChanges ? (
                <><Flame className="w-4 h-4" /> Confirmar handling personalizado{editPrice > 0 ? ` (+${editPrice} CR)` : ""}</>
              ) : (
                <>Usar handling original (valores de fábrica)</>
              )}
            </button>
          )}
          <p className="text-center text-[10px] font-mono text-white/15">
            Recibirás <code className="text-neon/40">{handlingName}_handling.meta</code> listo para instalar · entrega por Discord DM
          </p>
        </div>
      )}
    </div>
  );
}
