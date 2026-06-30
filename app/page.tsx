import Link from "next/link";
import Image from "next/image";
import { Code2, Users, ShieldCheck, Folder, ArrowRight, ShoppingCart, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StarRating } from "@/components/ui/StarRating";
import productsData from "@/data/products.json";
import type { Product } from "@/types/product";

const categories = [
  { name: "Standalone", count: 1213, key: "STANDALONE" },
  { name: "QBCORE/QBOX", count: 56, key: "QBCORE/QBOX" },
  { name: "ESX", count: 33, key: "ESX" },
  { name: "Other", count: 4, key: "Other" },
  { name: "Server Dumps", count: 1, key: "Server Dumps" },
];

export default function HomePage() {
  const spotlight = productsData.find((p) => p.id === "4")!;
  const featured = productsData.filter((p) => p.featured).slice(0, 6);
  const latest = productsData.slice(0, 6);
  const highestRated = [...productsData].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-lighter/80 border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-inter text-gray-300 tracking-widest uppercase">
              1,307+ Resources Available
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-rajdhani font-bold italic uppercase leading-none mb-6">
            <span className="block text-5xl sm:text-7xl lg:text-8xl text-white">
              ELEVATE YOUR
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-8xl text-primary">
              SERVER EXPERIENCE
            </span>
          </h1>

          <p className="text-gray-400 text-lg font-inter max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium FiveM scripts, assets and resources crafted by a verified community of developers.
            Install in minutes, elevate instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-rajdhani font-bold uppercase tracking-wider text-lg rounded-2xl transition-all hover:brightness-110 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Marketplace
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 border border-primary/50 text-primary font-rajdhani font-bold uppercase tracking-wider text-lg rounded-2xl transition-all hover:bg-primary/10 hover:border-primary hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Code2 className="w-6 h-6 text-primary" />, label: "Approved Scripts", value: "1,307", sub: "Verified & tested" },
            { icon: <Users className="w-6 h-6 text-primary" />, label: "Active Developers", value: "2,002", sub: "In our community" },
            { icon: <ShieldCheck className="w-6 h-6 text-primary" />, label: "Verified Assets", value: "100%", sub: "Quality guaranteed" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-inter mb-1">{stat.label}</p>
                <p className="text-2xl font-rajdhani font-bold italic text-white">{stat.value}</p>
                <p className="text-xs text-gray-600 font-inter">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPOTLIGHT PICK ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <SectionTitle white="SPOTLIGHT" cyan="PICK" className="mb-6" />

        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto min-h-[300px]">
              <Image
                src={spotlight.image}
                alt={spotlight.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-lighter/80" />
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-600/90 text-white text-xs font-rajdhani font-bold uppercase rounded-full tracking-wider">
                  FEATURED PICK
                </span>
                <CategoryBadge type={spotlight.type} />
              </div>
            </div>

            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/20">
                  <Image src={spotlight.authorAvatar} alt={spotlight.author} fill className="object-cover" />
                </div>
                <span className="text-sm text-gray-400 font-inter">{spotlight.author}</span>
                <span className="text-gray-600">•</span>
                <CategoryBadge type={spotlight.type} />
              </div>

              <h3 className="font-rajdhani font-bold italic uppercase text-3xl text-white mb-2">
                {spotlight.title}
              </h3>

              <StarRating rating={spotlight.rating} reviews={spotlight.reviews} className="mb-4" />

              <ul className="space-y-1.5 mb-6">
                {(spotlight as Product).features?.slice(0, 4).map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400 font-inter">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <PriceDisplay price={spotlight.price} isFree={spotlight.isFree} size="lg" />
                <Link
                  href={`/product/${spotlight.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/50 text-primary font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/10 hover:border-primary transition-all text-sm"
                >
                  VIEW DETAILS <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED DOWNLOADS (carousel) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <SectionTitle white="FEATURED" cyan="DOWNLOADS" className="mb-6" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product as Product}
              compact
              className="snap-start"
            />
          ))}
        </div>
      </section>

      {/* ── LATEST RELEASES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle white="LATEST" cyan="RELEASES" />
          <Link
            href="/marketplace"
            className="text-sm text-primary font-rajdhani font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
          >
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      </section>

      {/* ── HIGHEST RATED ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle white="HIGHEST" cyan="RATED" />
          <Link
            href="/marketplace"
            className="text-sm text-primary font-rajdhani font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
          >
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highestRated.map((product) => (
            <ProductCard key={product.id} product={product as Product} showRating />
          ))}
        </div>
      </section>

      {/* ── QUICK SEARCH + CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <SectionTitle white="QUICK" cyan="SEARCH" className="mb-4" />
            <form action="/marketplace" method="get" className="flex gap-2">
              <input
                name="q"
                type="text"
                placeholder="Search resources..."
                className="flex-1 bg-dark-lighter border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white font-rajdhani font-bold uppercase rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <h3 className="font-rajdhani font-bold italic uppercase text-xl tracking-wide text-white">
                BROWSE CATEGORIES
              </h3>
            </div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.key}
                  href={`/marketplace?type=${encodeURIComponent(cat.key)}`}
                  className="flex items-center gap-3 px-4 py-3 bg-dark-lighter/50 border border-white/5 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="flex-1 text-sm font-inter text-gray-300 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-600 font-rajdhani font-bold tabular-nums">
                    {cat.count.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOSTER BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-cyan-400 p-8 md:p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white rounded-full translate-y-1/2" />
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none hidden md:block">
            🛒
          </div>

          <div className="relative z-10 max-w-xl">
            <h2 className="font-rajdhani font-bold uppercase text-4xl md:text-5xl text-dark leading-none mb-3">
              BECOME A BOOSTER
            </h2>
            <p className="text-dark/70 font-inter text-base mb-6">
              Unlock exclusive perks, early access to premium scripts, and boost your server to the top of the community.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white font-rajdhani font-bold uppercase tracking-wider rounded-2xl hover:bg-dark-lighter transition-colors text-sm"
            >
              UPGRADE NOW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-3 px-10 py-5 border-2 border-primary/50 text-primary font-rajdhani font-bold italic uppercase text-xl tracking-wider rounded-3xl hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all hover:shadow-xl hover:shadow-primary/10"
        >
          <ShoppingCart className="w-6 h-6" />
          Explore Full Marketplace
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
