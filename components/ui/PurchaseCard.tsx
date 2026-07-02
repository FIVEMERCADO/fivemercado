"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, CheckCheck, Calendar, Clock, Download } from "lucide-react";
import { DownloadModal } from "@/components/ui/DownloadModal";

interface PurchaseCardProps {
  productId: string;
  productTitle?: string;
  price: number;
  isFree: boolean;
  releaseDate: string;
  lastUpdate: string;
  author: string;
  authorAvatar: string;
  linkvertiseUrl?: string;
  initialOwned?: boolean;
}

export function PurchaseCard({
  productId,
  productTitle,
  price,
  isFree,
  releaseDate,
  lastUpdate,
  author,
  authorAvatar,
  linkvertiseUrl,
  initialOwned = false,
}: PurchaseCardProps) {
  const [owned, setOwned] = useState(initialOwned);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_id: productId }),
      });
    } catch {
      // network error — demo mode
    } finally {
      setOwned(true);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-dark-lighter/70 backdrop-blur-md border border-primary/20 rounded-[3rem] p-8 sticky top-24 space-y-6">
        {/* Price section */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-rajdhani font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
            Precio
          </span>
          {isFree ? (
            <div className="text-6xl font-rajdhani font-bold italic tracking-tighter text-white mb-2">
              GRATIS
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">🪙</span>
              <span className="text-5xl font-rajdhani font-bold italic text-white">
                {price.toFixed(0)}
              </span>
            </div>
          )}
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
            <Check className="w-3.5 h-3.5 text-primary" />
            Acceso de por vida
          </p>
        </div>

        {/* Action zone */}
        <div className="space-y-4">
          {owned ? (
            /* Owned state */
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-[2rem] text-center space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCheck className="w-6 h-6" />
              </div>
              <h4 className="font-rajdhani font-black uppercase italic tracking-tighter text-lg">
                YA ERES PROPIETARIO
              </h4>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white text-dark font-rajdhani font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-xl text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                DESCARGAR RECURSO
              </button>
            </div>
          ) : (
            /* Not owned state */
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-primary text-dark font-rajdhani font-black py-5 rounded-[2rem] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 text-lg disabled:opacity-60 disabled:scale-100"
            >
              <ShoppingCart className="w-5 h-5" />
              {loading ? "Procesando..." : isFree ? "Descargar Gratis" : "Comprar Ahora"}
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">LANZAMIENTO</p>
              <p className="text-sm font-inter text-gray-300">{releaseDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">ÚLTIMA ACTUALIZACIÓN</p>
              <p className="text-sm font-inter text-gray-300">{lastUpdate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex-shrink-0">
              <Image src={authorAvatar} alt={author} fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">DESARROLLADO POR</p>
              <p className="text-sm font-inter text-gray-300">{author}</p>
            </div>
          </div>
        </div>
      </div>

      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scriptId={productId}
        scriptTitle={productTitle}
        linkvertiseUrl={linkvertiseUrl}
      />
    </>
  );
}
