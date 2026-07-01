"use client";

import { useState, useMemo } from "react";
import { Search, Folder, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import productsData from "@/data/products.json";

const CATEGORIES = [
  { label: "Todos los Recursos", value: "Todos los Recursos" },
  { label: "Standalone", value: "STANDALONE" },
  { label: "QBCORE/QBOX", value: "QBCORE/QBOX" },
  { label: "ESX", value: "ESX" },
  { label: "Server Dumps", value: "Server Dumps" },
  { label: "Otro", value: "Other" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos los Recursos");
  const [freeFilter, setFreeFilter] = useState(false);
  const [paidFilter, setPaidFilter] = useState(false);

  const filtered = useMemo(() => {
    return productsData.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "Todos los Recursos" || p.type === activeCategory;

      const matchesPrice =
        !freeFilter && !paidFilter
          ? true
          : freeFilter && paidFilter
          ? true
          : freeFilter
          ? p.isFree
          : !p.isFree;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [search, activeCategory, freeFilter, paidFilter]);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <h1 className="font-rajdhani font-bold italic uppercase text-5xl md:text-7xl leading-none mb-4 relative z-10">
          <span className="text-white">FIVE</span>
          <span className="text-primary">MERCADO</span>
        </h1>
        <p className="text-gray-400 font-inter text-lg max-w-xl mx-auto relative z-10">
          Explora más de 1,307 recursos verificados para FiveM. Filtra por framework, precio y mucho más.
        </p>
      </section>

      {/* Search bar */}
      <div className="max-w-3xl mx-auto px-4 mb-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, autor, descripción..."
              className="w-full bg-dark-lighter/80 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <button className="px-6 py-3.5 bg-primary text-white font-rajdhani font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            BUSCAR
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-dark-lighter/70 border border-white/5 rounded-2xl p-5">
                <h3 className="font-rajdhani font-bold uppercase tracking-wider text-xs text-gray-500 mb-3">
                  CATEGORÍAS
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-inter transition-all text-left ${
                        activeCategory === cat.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="bg-dark-lighter/70 border border-white/5 rounded-2xl p-5">
                <h3 className="font-rajdhani font-bold uppercase tracking-wider text-xs text-gray-500 mb-3">
                  FILTROS RÁPIDOS
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFreeFilter(!freeFilter)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-rajdhani font-bold uppercase tracking-wider transition-all ${
                      freeFilter
                        ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-400"
                        : "border border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    🎁 Gratis
                  </button>
                  <button
                    onClick={() => setPaidFilter(!paidFilter)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-rajdhani font-bold uppercase tracking-wider transition-all ${
                      paidFilter
                        ? "bg-primary/20 border border-primary/60 text-primary"
                        : "border border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    💎 Premium
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-inter text-center">
                Mostrando <span className="text-primary font-bold">{filtered.length}</span> recursos
              </p>

              {/* Sell banner */}
              <div className="bg-gradient-to-br from-primary/20 to-cyan-500/5 border border-primary/30 rounded-2xl p-5">
                <h3 className="font-rajdhani font-bold uppercase text-white text-sm tracking-wider mb-2">
                  🚀 VENDE TU TRABAJO
                </h3>
                <p className="text-xs text-gray-400 font-inter mb-4 leading-relaxed">
                  Únete a nuestro programa de desarrolladores y empieza a ganar créditos.
                </p>
                <a
                  href="/upload"
                  className="block w-full text-center py-2.5 bg-primary text-dark text-xs font-rajdhani font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all"
                >
                  SABER MÁS
                </a>
              </div>
            </div>
          </aside>

          {/* Mobile filters */}
          <div className="lg:hidden mb-6 flex flex-wrap gap-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat.value
                      ? "bg-primary text-white"
                      : "border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFreeFilter(!freeFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase transition-all ${
                  freeFilter
                    ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-400"
                    : "border border-white/10 text-gray-400"
                }`}
              >
                🎁 Gratis
              </button>
              <button
                onClick={() => setPaidFilter(!paidFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase transition-all ${
                  paidFilter
                    ? "bg-primary/20 border border-primary/60 text-primary"
                    : "border border-white/10 text-gray-400"
                }`}
              >
                💎 Premium
              </button>
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-rajdhani font-bold italic uppercase text-2xl text-white mb-2">
                  SIN RESULTADOS
                </h3>
                <p className="text-gray-500 font-inter text-sm">
                  Intenta ajustar los filtros o el término de búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} showRating />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
