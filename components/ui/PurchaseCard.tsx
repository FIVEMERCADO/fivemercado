"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, CheckCheck, Info, Calendar, Clock } from "lucide-react";

interface PurchaseCardProps {
  productId: string;
  price: number;
  isFree: boolean;
  releaseDate: string;
  lastUpdate: string;
  author: string;
  authorAvatar: string;
  // Simulated state — in production comes from session/DB
  initialOwned?: boolean;
}

export function PurchaseCard({
  productId,
  price,
  isFree,
  releaseDate,
  lastUpdate,
  author,
  authorAvatar,
  initialOwned = false,
}: PurchaseCardProps) {
  const [owned, setOwned] = useState(initialOwned);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_id: productId }),
      });
      if (res.ok) setOwned(true);
    } catch {
      // In demo mode, just mark as owned
      setOwned(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetCode() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_id: productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      } else {
        // Demo fallback
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let c = "";
        for (let i = 0; i < 10; i++) c += chars[Math.floor(Math.random() * chars.length)];
        setCode(c);
      }
    } catch {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let c = "";
      for (let i = 0; i < 10; i++) c += chars[Math.floor(Math.random() * chars.length)];
      setCode(c);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-dark-lighter/70 backdrop-blur-md border border-primary/20 rounded-[3rem] p-8 sticky top-24 space-y-6">
      {/* Price section */}
      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] font-rajdhani font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
          Starting At
        </span>
        {isFree ? (
          <div className="text-6xl font-rajdhani font-bold italic tracking-tighter text-white mb-2">
            FREE
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
          Lifetime Access
        </p>
      </div>

      {/* Dynamic action zone */}
      <div className="space-y-4">
        {/* State 3: Owned + code generated → code box above green card */}
        {owned && code && (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl text-xs font-bold flex items-start gap-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Your one-time code is:{" "}
              <strong className="font-black tracking-wider">{code}</strong>.{" "}
              Use it on our Discord bot!
            </div>
          </div>
        )}

        {/* State 2 & 3: Owned → green card */}
        {owned ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-[2rem] text-center space-y-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h4 className="font-rajdhani font-black uppercase italic tracking-tighter text-lg">
              You own this resource
            </h4>
            <button
              onClick={handleGetCode}
              disabled={loading}
              className="w-full bg-white text-dark font-rajdhani font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-60 disabled:scale-100 text-sm"
            >
              {loading ? "Generating..." : code ? "GET NEW CODE" : "GET DOWNLOAD CODE"}
            </button>
          </div>
        ) : (
          /* State 1: Not owned → PURCHASE NOW */
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-primary text-dark font-rajdhani font-black py-5 rounded-[2rem] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 text-lg disabled:opacity-60 disabled:scale-100"
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? "Processing..." : isFree ? "Download Free" : "Purchase Now"}
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">RELEASED</p>
            <p className="text-sm font-inter text-gray-300">{releaseDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">LAST UPDATE</p>
            <p className="text-sm font-inter text-gray-300">{lastUpdate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex-shrink-0">
            <Image src={authorAvatar} alt={author} fill className="object-cover" />
          </div>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">DEVELOPED BY</p>
            <p className="text-sm font-inter text-gray-300">{author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
