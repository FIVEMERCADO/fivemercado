"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, Download, RefreshCw, X, Video } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StarRating } from "@/components/ui/StarRating";
import { TabPanel } from "@/components/ui/TabPanel";
import { ProductCard } from "@/components/ui/ProductCard";
import { PurchaseCard } from "@/components/ui/PurchaseCard";
import productsData from "@/data/products.json";
import type { Product } from "@/types/product";

interface PageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = productsData.find((p) => p.id === params.id);
  const [updateBannerOpen, setUpdateBannerOpen] = useState(true);

  if (!product) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <h1 className="font-rajdhani font-bold italic uppercase text-3xl text-white mb-4">PRODUCTO NO ENCONTRADO</h1>
          <Link href="/marketplace" className="text-primary hover:underline font-inter">
            ← Volver al Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const related = productsData
    .filter((p) => p.id !== product.id && p.type === product.type)
    .slice(0, 3);

  const featuresTab = (
    <div className="space-y-4">
      <p className="text-gray-400 font-inter text-sm leading-relaxed">{product.description}</p>

      {(product as Product).features && (
        <div className="mt-4">
          <h4 className="font-rajdhani font-bold uppercase text-white mb-3 text-sm tracking-wider">
            Características
          </h4>
          <ul className="space-y-2">
            {((product as Product).features ?? []).map((f: string) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-400 font-inter">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(product as Product).videoUrl && (
        <div className="mt-6 p-4 bg-dark/50 border border-white/5 rounded-xl flex items-center gap-3">
          <Video className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-inter mb-1">Video de Vista Previa</p>
            <a
              href={(product as Product).videoUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm font-inter hover:underline"
            >
              Ver en YouTube →
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const filesTab = (
    <div className="space-y-3">
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔒</div>
        <h4 className="font-rajdhani font-bold italic uppercase text-white mb-2">
          Compra Requerida
        </h4>
        <p className="text-sm text-gray-500 font-inter">
          Los archivos solo son visibles después de comprar este recurso. Usa el panel lateral para comprar
          y genera un código de descarga vía el bot de Discord.
        </p>
      </div>
    </div>
  );

  const reviewsTab = (
    <div className="space-y-4">
      {product.reviews > 0 ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-4xl font-rajdhani font-bold text-white">{product.rating}</p>
              <StarRating rating={product.rating} showCount={false} />
              <p className="text-xs text-gray-500 font-inter mt-1">{product.reviews} reseñas</p>
            </div>
          </div>
          {/* Placeholder reviews */}
          {Array.from({ length: Math.min(product.reviews, 3) }, (_, i) => (
            <div key={i} className="p-4 bg-dark/50 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm font-inter text-white">User{1000 + i}</span>
                <StarRating rating={product.rating} showCount={false} className="ml-auto" />
              </div>
              <p className="text-sm text-gray-400 font-inter">
                {i === 0
                  ? "Excelente recurso, muy bien documentado y fácil de instalar."
                  : i === 1
                  ? "Funciona perfecto en nuestro servidor QBCore. El soporte fue muy rápido."
                  : "Código limpio, buena optimización. ¡Lo recomiendo totalmente!"}
              </p>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⭐</div>
          <h4 className="font-rajdhani font-bold italic uppercase text-white mb-2">
            Sin Reseñas Aún
          </h4>
          <p className="text-sm text-gray-500 font-inter">Sé el primero en reseñar este recurso.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Update Banner */}
      {updateBannerOpen && (
        <div className="bg-primary/90 backdrop-blur-sm border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-inter text-white">
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>🔄 ¡NUEVA ACTUALIZACIÓN DISPONIBLE!</strong> Haz clic para ver los archivos más recientes.
              </span>
            </div>
            <button
              onClick={() => setUpdateBannerOpen(false)}
              className="text-white/70 hover:text-white flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-inter text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">INICIO</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/marketplace" className="hover:text-gray-300 transition-colors">MARKETPLACE</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400 line-clamp-1">{product.title.toUpperCase()}</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <CategoryBadge type={product.type} />
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs font-rajdhani font-bold uppercase text-yellow-400 tracking-wider">
              ⭐ DESTACADO
            </span>
          )}
          {product.isFree && (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-rajdhani font-bold uppercase text-emerald-400 tracking-wider">
              RECURSO GRATIS
            </span>
          )}
        </div>

        {/* Title + stats */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <h1 className="font-rajdhani font-bold italic uppercase text-3xl md:text-5xl text-white leading-tight">
            {product.title}
          </h1>
          <div className="flex gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-dark-lighter/70 border border-white/5 rounded-xl">
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-inter text-gray-400">
                <span className="font-bold text-white">{product.views.toLocaleString()}</span> vistas
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-dark-lighter/70 border border-white/5 rounded-xl">
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-inter text-gray-400">
                <span className="font-bold text-white">{product.downloads.toLocaleString()}</span> descargas
              </span>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: image + tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Preview image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-lighter">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Tabs */}
            <TabPanel
              tabs={[
                { id: "description", label: "Descripción", content: featuresTab },
                { id: "files", label: "Archivos", content: filesTab },
                { id: "reviews", label: `Reseñas (${product.reviews})`, content: reviewsTab },
              ]}
            />
          </div>

          {/* Right: purchase card (4 cols) */}
          <div className="lg:col-span-4">
            <PurchaseCard
              productId={product.id}
              price={product.price}
              isFree={product.isFree}
              releaseDate={product.releaseDate}
              lastUpdate={product.lastUpdate}
              author={product.author}
              authorAvatar={product.authorAvatar}
            />
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-7 bg-primary rounded-full" />
              <h2 className="font-rajdhani font-bold italic uppercase text-2xl text-white">
                RECURSOS <span className="text-primary">RELACIONADOS</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p as Product} showRating />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
