"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp } from "lucide-react";
import knowledgeRaw from "@/lib/handling_knowledge.json";
import { calcVisualStats } from "@/lib/handling-xml";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface FieldStats { min: number; max: number; avg: number; p25: number; p50: number; p75: number; }
interface KnowledgeBase {
  total_cars: number;
  global: { fields: Record<string, FieldStats> };
  categories: Record<string, { count: number; fields: Record<string, FieldStats> }>;
}
const KB = knowledgeRaw as KnowledgeBase;

// ── Definición de parámetros editables ───────────────────────────────────────
interface ParamDef {
  key: string;
  label: string;
  description: string;
  unit: string;
  step: number;
  decimals: number;
  group: string;
}

const PARAMS: ParamDef[] = [
  // Motor
  { key: "fInitialDriveForce",    label: "Fuerza del Motor",        description: "Potencia y aceleración del vehículo. Más alto = acelera más rápido.",            unit: "",    step: 0.01, decimals: 3, group: "Motor" },
  { key: "fInitialDriveMaxFlatVel", label: "Velocidad Máxima",      description: "Velocidad tope en km/h en terreno plano.",                                       unit: "km/h",step: 5,    decimals: 0, group: "Motor" },
  { key: "nInitialDriveGears",    label: "Marchas",                  description: "Número de marchas de la transmisión.",                                            unit: "",    step: 1,    decimals: 0, group: "Motor" },
  { key: "fDriveInertia",         label: "Inercia del Motor",        description: "Qué tan rápido responde el motor. Menos = respuesta más brusca.",                 unit: "",    step: 0.05, decimals: 2, group: "Motor" },
  { key: "fDriveBiasFront",       label: "Tracción Delantera",       description: "0 = tracción trasera (sport), 0.5 = AWD, 1 = tracción delantera.",               unit: "",    step: 0.05, decimals: 2, group: "Motor" },
  // Frenado
  { key: "fBrakeForce",           label: "Potencia de Frenos",       description: "Qué tan fuerte frena el vehículo. Más alto = frena más corto.",                  unit: "",    step: 0.05, decimals: 2, group: "Frenado" },
  { key: "fHandBrakeForce",       label: "Freno de Mano",            description: "Potencia del freno de mano para derrapar.",                                       unit: "",    step: 0.05, decimals: 2, group: "Frenado" },
  { key: "fBrakeBiasFront",       label: "Balance de Frenos",        description: "0 = todo atrás, 0.5 = equilibrado, 1 = todo delante.",                           unit: "",    step: 0.02, decimals: 2, group: "Frenado" },
  // Tracción
  { key: "fTractionCurveMax",     label: "Tracción Máxima",          description: "Agarre máximo de los neumáticos. Más alto = mejor grip.",                        unit: "",    step: 0.05, decimals: 2, group: "Tracción" },
  { key: "fTractionCurveMin",     label: "Tracción Mínima",          description: "Agarre mínimo (al derrapar). Más bajo = derrapa más.",                           unit: "",    step: 0.05, decimals: 2, group: "Tracción" },
  { key: "fTractionBiasFront",    label: "Balance de Tracción",      description: "Distribución de tracción. 0.5 = equilibrado.",                                   unit: "",    step: 0.02, decimals: 2, group: "Tracción" },
  { key: "fSteeringLock",         label: "Ángulo de Dirección",      description: "Cuánto giran las ruedas. Más alto = giros más cerrados.",                        unit: "°",   step: 1,    decimals: 0, group: "Tracción" },
  // Suspensión
  { key: "fSuspensionForce",      label: "Dureza Suspensión",        description: "1-2 = suave, 3-4 = dura/sport. Afecta el rebote.",                              unit: "",    step: 0.1,  decimals: 1, group: "Suspensión" },
  { key: "fSuspensionCompDamp",   label: "Amortiguación Compresión", description: "Qué tan rápido se comprime la suspensión al golpear.",                           unit: "",    step: 0.1,  decimals: 1, group: "Suspensión" },
  { key: "fSuspensionReboundDamp",label: "Amortiguación Rebote",     description: "Qué tan rápido vuelve la suspensión a su posición.",                             unit: "",    step: 0.1,  decimals: 1, group: "Suspensión" },
  { key: "fSuspensionUpperLimit", label: "Límite Superior Suspensión",description: "Recorrido hacia arriba. Más alto = más altura.",                                unit: "m",   step: 0.01, decimals: 2, group: "Suspensión" },
  { key: "fSuspensionLowerLimit", label: "Límite Inferior Suspensión",description: "Recorrido hacia abajo (negativo = más bajo).",                                  unit: "m",   step: 0.01, decimals: 2, group: "Suspensión" },
  // Masa
  { key: "fMass",                 label: "Masa del Vehículo",        description: "Peso en kg. Más pesado = más estable pero menos ágil.",                          unit: "kg",  step: 50,   decimals: 0, group: "Físicas" },
  { key: "fInitialDragCoeff",     label: "Resistencia al Aire",      description: "Fricción aerodinámica. Más alto = pierde velocidad más rápido.",                 unit: "",    step: 0.5,  decimals: 1, group: "Físicas" },
  { key: "fCollisionDamageMult",  label: "Daño por Colisión",        description: "Multiplicador de daño al chocar. 0 = indestructible, 2 = muy frágil.",           unit: "x",   step: 0.1,  decimals: 1, group: "Físicas" },
];

const GROUPS = ["Motor", "Frenado", "Tracción", "Suspensión", "Físicas"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getFieldBounds(field: string, category: string): { min: number; max: number; avg: number; p25: number; p75: number } | null {
  const catStats = KB.categories[category]?.fields[field];
  const globalStats = KB.global.fields[field];
  const s = catStats ?? globalStats;
  if (!s) return null;
  return { min: s.min, max: s.max, avg: s.avg, p25: s.p25, p75: s.p75 };
}

type ValidationLevel = "ok" | "warn" | "danger";
function validateValue(value: number, bounds: { p25: number; p75: number; min: number; max: number } | null): ValidationLevel {
  if (!bounds) return "ok";
  if (value < bounds.min || value > bounds.max) return "danger";
  if (value < bounds.p25 || value > bounds.p75) return "warn";
  return "ok";
}

function levelColor(level: ValidationLevel) {
  if (level === "danger") return "text-red-400";
  if (level === "warn")   return "text-yellow-400";
  return "text-neon";
}

function StatBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-white/50 uppercase tracking-wider">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-dark rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface HandlingEditorProps {
  initialHandling: Record<string, number>;
  handlingName: string;
  category: string;
  onSave?: (values: Record<string, number>) => void;
  saving?: boolean;
}

export function HandlingEditor({ initialHandling, handlingName, category, onSave, saving }: HandlingEditorProps) {
  const [values, setValues] = useState<Record<string, number>>(initialHandling);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Motor: true });
  const [showXml, setShowXml] = useState(false);

  const catKey = category in KB.categories ? category : "Sport";
  const catData = KB.categories[catKey];
  const stats = calcVisualStats(values);

  const set = useCallback((key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleGroup = (g: string) => setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const resetToAvg = () => {
    const next = { ...values };
    for (const p of PARAMS) {
      const b = getFieldBounds(p.key, catKey);
      if (b) next[p.key] = parseFloat(b.avg.toFixed(p.decimals));
    }
    setValues(next);
  };

  // Cuenta warnings/errors globales
  let warns = 0, errors = 0;
  for (const p of PARAMS) {
    const b = getFieldBounds(p.key, catKey);
    const level = validateValue(values[p.key] ?? 0, b);
    if (level === "warn")   warns++;
    if (level === "danger") errors++;
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-dark-mid rounded-xl border border-white/5">
        <StatBar label="Velocidad"    value={stats.speed}        color="bg-primary" />
        <StatBar label="Aceleración"  value={stats.acceleration} color="bg-neon" />
        <StatBar label="Frenado"      value={stats.braking}      color="bg-secondary" />
        <StatBar label="Manejo"       value={stats.handling}     color="bg-pink" />
      </div>

      {/* Badges de validación */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-white/40">Base de datos: {catData?.count ?? 0} carros {catKey}</span>
        {errors > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="w-3 h-3" /> {errors} valor{errors > 1 ? "es" : ""} fuera de rango
          </span>
        )}
        {warns > 0 && (
          <span className="flex items-center gap-1 text-yellow-400">
            <Info className="w-3 h-3" /> {warns} valor{warns > 1 ? "es" : ""} inusual
          </span>
        )}
        {errors === 0 && warns === 0 && (
          <span className="flex items-center gap-1 text-neon">
            <CheckCircle2 className="w-3 h-3" /> Todos los valores en rango normal
          </span>
        )}
        <button onClick={resetToAvg} className="ml-auto text-white/30 hover:text-white transition-colors">
          ↺ Resetear a promedio
        </button>
      </div>

      {/* Grupos de parámetros */}
      {GROUPS.map((group) => {
        const groupParams = PARAMS.filter((p) => p.group === group);
        const isOpen = !!openGroups[group];
        const groupErrors = groupParams.filter(p => validateValue(values[p.key] ?? 0, getFieldBounds(p.key, catKey)) !== "ok").length;

        return (
          <div key={group} className="border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-mid hover:bg-dark-lighter transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-bold text-sm uppercase tracking-wider text-white">{group}</span>
                {groupErrors > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                    {groupErrors}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-white/5">
                {groupParams.map((param) => {
                  const raw = values[param.key] ?? 0;
                  const bounds = getFieldBounds(param.key, catKey);
                  const level = validateValue(raw, bounds);

                  // Rango para el slider basado en datos reales
                  const sliderMin = bounds ? Math.min(bounds.min * 0.8, raw * 0.5) : 0;
                  const sliderMax = bounds ? Math.max(bounds.max * 1.2, raw * 1.5) : 10;
                  const pct = sliderMax > sliderMin ? ((raw - sliderMin) / (sliderMax - sliderMin)) * 100 : 50;

                  return (
                    <div key={param.key} className="px-4 py-3 bg-dark-card hover:bg-dark-mid/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-rajdhani font-semibold text-white">{param.label}</span>
                            {param.unit && <span className="text-[10px] font-mono text-white/30">{param.unit}</span>}
                            {level === "danger" && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                            {level === "warn"   && <Info className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-white/35 mt-0.5 leading-tight">{param.description}</p>
                        </div>

                        {/* Input numérico */}
                        <input
                          type="number"
                          value={raw}
                          step={param.step}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) set(param.key, parseFloat(v.toFixed(param.decimals)));
                          }}
                          className={`w-20 text-right text-sm font-mono bg-dark border rounded-lg px-2 py-1 outline-none focus:border-primary/60 transition-colors flex-shrink-0 ${
                            level === "danger" ? "border-red-500/40 text-red-400" :
                            level === "warn"   ? "border-yellow-500/40 text-yellow-400" :
                            "border-white/10 text-white"
                          }`}
                        />
                      </div>

                      {/* Slider */}
                      <div className="relative">
                        <input
                          type="range"
                          min={sliderMin}
                          max={sliderMax}
                          step={param.step}
                          value={raw}
                          onChange={(e) => set(param.key, parseFloat(parseFloat(e.target.value).toFixed(param.decimals)))}
                          className="w-full h-1.5 appearance-none bg-dark rounded-full outline-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${
                              level === "danger" ? "#f87171" : level === "warn" ? "#facc15" : "#ff6600"
                            } 0%, ${
                              level === "danger" ? "#f87171" : level === "warn" ? "#facc15" : "#ff6600"
                            } ${pct}%, #1a1a3a ${pct}%, #1a1a3a 100%)`
                          }}
                        />
                        {/* Marcadores de rango real */}
                        {bounds && (
                          <div className="flex justify-between text-[9px] font-mono text-white/20 mt-1 px-0.5">
                            <span>{bounds.min}</span>
                            <span className="text-white/40">↕ p25-p75: {bounds.p25}–{bounds.p75}</span>
                            <span>{bounds.max}</span>
                          </div>
                        )}
                      </div>

                      {/* Tooltip de validación */}
                      {level !== "ok" && bounds && (
                        <p className={`text-[10px] font-mono mt-1 ${levelColor(level)}`}>
                          {level === "danger"
                            ? `⚠ Fuera del rango observado en ${catData?.count ?? 0} carros (${bounds.min}–${bounds.max})`
                            : `ℹ Valor inusual — zona normal: ${bounds.p25}–${bounds.p75} (promedio: ${bounds.avg})`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Preview XML */}
      <div>
        <button
          onClick={() => setShowXml(!showXml)}
          className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
        >
          {showXml ? "▲ Ocultar" : "▼ Ver"} handling.meta generado
        </button>
        {showXml && (
          <pre className="mt-2 p-3 bg-dark rounded-xl text-[10px] font-mono text-neon/70 overflow-x-auto border border-neon/10 max-h-48">
            {`<handlingName>${handlingName}</handlingName>\n`}
            {PARAMS.map(p => `<${p.key} value="${(values[p.key] ?? 0).toFixed(p.decimals)}" />`).join("\n")}
          </pre>
        )}
      </div>

      {/* Botón guardar */}
      {onSave && (
        <button
          onClick={() => onSave(values)}
          disabled={saving || errors > 0}
          className="w-full btn-gta py-4 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full" /> Procesando...</>
          ) : errors > 0 ? (
            <>⚠ Corrige los valores en rojo antes de comprar</>
          ) : (
            <>Comprar con este Handling — recibes el .meta personalizado</>
          )}
        </button>
      )}
    </div>
  );
}
