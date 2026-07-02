export const dynamic = "force-dynamic";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabaseClient } from "@/lib/supabase";
import { Gauge, Zap, Car, ArrowRight } from "lucide-react";

const CATEGORIES = ["Todos", "Sport", "Supercar", "Muscle", "SUV", "Offroad", "Van", "Moto"];

async function getCars() {
  const supabase = supabaseClient();
  const { data } = await supabase
    .from("cars")
    .select("id, name, brand, category, price, is_free, image_url, stats, handling_name, description")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

function StatMini({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1 bg-dark rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-primary tracking-[0.3em] uppercase">— FiveMercado</span>
          </div>
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl uppercase text-white text-glow-orange mb-3">
            Catálogo de Carros
          </h1>
          <p className="font-rajdhani text-white/50 text-lg max-w-xl">
            Cada carro incluye el archivo <span className="text-primary font-semibold">handling.meta</span> que puedes personalizar antes de descargar. Editas la velocidad, frenado, suspensión y más — directo desde la web.
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const count = cat === "Todos" ? cars.length : cars.filter(c => c.category === cat).length;
            return (
              <span key={cat} className="px-3 py-1.5 border border-white/10 rounded-lg text-sm font-rajdhani font-semibold text-white/50 hover:border-primary/40 hover:text-white cursor-pointer transition-all">
                {cat} <span className="text-white/30 text-xs">{count}</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Grid de carros */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {cars.length === 0 ? (
            <div className="text-center py-20 text-white/30 font-rajdhani text-xl">
              No hay carros publicados todavía.<br />
              <span className="text-sm">El equipo está preparando el catálogo.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cars.map((car) => {
                const stats = car.stats as { speed: number; acceleration: number; braking: number; handling: number } | null;
                return (
                  <Link key={car.id} href={`/cars/${car.id}`} className="card-gta rounded-2xl overflow-hidden group block">
                    {/* Imagen */}
                    <div className="relative aspect-video bg-dark-lighter overflow-hidden">
                      {car.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={car.image_url} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-16 h-16 text-white/10" />
                        </div>
                      )}
                      {/* Categoría badge */}
                      <span className="absolute top-2 left-2 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 bg-dark/80 border border-primary/30 text-primary rounded">
                        {car.category}
                      </span>
                      {/* Handling badge */}
                      <span className="absolute top-2 right-2 font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 bg-neon/10 border border-neon/30 text-neon rounded">
                        ✎ Editable
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-0.5">{car.brand}</p>
                      <h3 className="font-orbitron font-bold text-base uppercase text-white group-hover:text-primary transition-colors leading-tight mb-3">
                        {car.name}
                      </h3>

                      {/* Stats bars */}
                      {stats && (
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-white/25 w-12 uppercase">Speed</span>
                            <StatMini value={stats.speed}        color="bg-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-white/25 w-12 uppercase">Accel</span>
                            <StatMini value={stats.acceleration} color="bg-neon" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-white/25 w-12 uppercase">Brake</span>
                            <StatMini value={stats.braking}      color="bg-secondary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-white/25 w-12 uppercase">Handle</span>
                            <StatMini value={stats.handling}     color="bg-pink" />
                          </div>
                        </div>
                      )}

                      {/* Precio + CTA */}
                      <div className="flex items-center justify-between">
                        <div>
                          {car.is_free ? (
                            <span className="text-neon font-mono font-bold text-sm">GRATIS</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-primary" />
                              <span className="text-primary font-mono font-bold text-sm">{car.price} CR</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-rajdhani font-semibold text-white/30 group-hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider">
                          Ver y editar <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info box */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="border border-neon/15 rounded-2xl p-6 bg-neon/3">
            <div className="flex gap-4 items-start">
              <Gauge className="w-8 h-8 text-neon flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-orbitron font-bold text-white uppercase text-sm mb-1">¿Cómo funciona el handling editor?</h3>
                <p className="text-white/45 font-rajdhani text-base leading-relaxed">
                  Cada carro tiene un archivo <code className="text-neon text-sm">handling.meta</code> que controla cómo se siente al conducir en FiveM.
                  Desde la ficha de cada carro puedes ajustar velocidad máxima, fuerza de frenos, suspensión, tracción y más.
                  El sistema valida cada valor contra <strong className="text-white/60">1.253 carros reales</strong> de nuestra base de datos — si algo está fuera de rango, te avisa.
                  Al comprar, recibes el archivo <code className="text-neon text-sm">.meta</code> ya configurado con tus valores directamente por Discord.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
