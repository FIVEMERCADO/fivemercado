"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Upload, CheckCircle, Calendar, Shield, Coins, Link2Off, Code, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StarRating } from "@/components/ui/StarRating";

const MOCK_PURCHASED = [
  { id: "1", title: "Advanced Police MDT System", author: "CodeCraft Studios", rating: 4.8, price: 24.99, purchasedDate: "Jun 15, 2026" },
  { id: "4", title: "Advanced Housing System v3", author: "PropMaster", rating: 4.9, price: 39.99, purchasedDate: "Jun 20, 2026" },
  { id: "11", title: "Heist Pack - 4 Unique Heists", author: "HeistCraft", rating: 4.9, price: 49.99, purchasedDate: "Jun 22, 2026" },
  { id: "8", title: "Realistic Fuel System", author: "UNDISCLOSED", rating: 4.7, price: 0, purchasedDate: "Jun 25, 2026" },
];

export default function ProfilePage() {
  const [username, setUsername] = useState("ServerDev_Pro");
  const [bio, setBio] = useState("FiveM server developer with 3+ years of experience. Running a 200-slot RP server.");
  const [activeTab, setActiveTab] = useState<"scripts" | "purchased">("purchased");
  const [codeSent, setCodeSent] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  async function handleGetCode(scriptId: string) {
    setLoadingCode(scriptId);
    setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let c = "";
      for (let i = 0; i < 10; i++) c += chars[Math.floor(Math.random() * chars.length)];
      setCodeSent(c);
      setLoadingCode(null);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile header */}
        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/20 border-2 border-primary/30">
                <Image
                  src="https://api.dicebear.com/7.x/identicon/svg?seed=serverdev"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-all">
                <Camera className="w-3.5 h-3.5 text-dark" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-rajdhani font-bold italic uppercase text-3xl text-white">
                  {username}
                </h1>
                <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-xs font-rajdhani font-bold uppercase rounded tracking-wider">
                  MEMBER
                </span>
              </div>
              <p className="text-gray-500 text-sm font-inter mb-4">{bio}</p>

              {/* Reputation */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-rajdhani font-bold text-white">4.7</p>
                  <StarRating rating={4.7} showCount={false} />
                  <p className="text-xs text-gray-500 font-inter">4.7/5 · 12 reseñas</p>
                </div>
              </div>
            </div>

            <button className="self-start flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors font-inter">
              <Upload className="w-4 h-4" />
              ACTUALIZAR AVATAR
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Profile info */}
            <div className="bg-dark-lighter/70 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-rajdhani font-bold uppercase text-sm tracking-wider text-white">
                INFORMACIÓN DEL PERFIL
              </h3>
              <div className="space-y-3">
                {[
                  { icon: <Shield className="w-4 h-4 text-emerald-400" />, label: "Estado", value: "Activo" },
                  { icon: <Calendar className="w-4 h-4 text-gray-500" />, label: "Miembro desde", value: "Ene 15, 2024" },
                  { icon: <Coins className="w-4 h-4 text-yellow-400" />, label: "Créditos", value: "1,250 🪙" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-inter">{item.label}</p>
                      <p className="text-sm text-gray-300 font-inter">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discord */}
            <div className="bg-dark-lighter/70 border border-white/5 rounded-2xl p-6">
              <h3 className="font-rajdhani font-bold uppercase text-sm tracking-wider text-white mb-4">
                CUENTA DE DISCORD
              </h3>
              <div className="flex items-center gap-3 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-xl mb-3">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 font-inter">Vinculado a:</p>
                  <p className="text-sm text-indigo-300 font-bold font-inter">ServerDev_Pro#0001</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 font-inter mb-3">
                Necesario para recibir códigos de descarga vía el bot de Discord.
              </p>
              <button className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-inter">
                <Link2Off className="w-3.5 h-3.5" />
                Desvincular cuenta de Discord
              </button>
            </div>

            {/* Edit profile */}
            <div className="bg-dark-lighter/70 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-rajdhani font-bold uppercase text-sm tracking-wider text-white">
                EDITAR PERFIL
              </h3>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-inter">Usuario</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  className="mt-1 w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-sm font-inter text-white focus:outline-none focus:border-primary/60 transition-colors"
                />
                <p className="text-xs text-gray-600 font-inter mt-1">{username.length}/30 caracteres</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-inter">Biografía</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full bg-dark border border-white/10 rounded-xl px-3 py-2 text-sm font-inter text-white focus:outline-none focus:border-primary/60 transition-colors resize-none"
                />
                <p className="text-xs text-gray-600 font-inter mt-1">{bio.length}/500 caracteres</p>
              </div>
              <button className="w-full py-2.5 bg-primary text-dark font-rajdhani font-black uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-sm">
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated code display */}
            {codeSent && (
              <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl text-sm font-bold flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  Tu código único de descarga es:{" "}
                  <strong className="font-black tracking-wider text-base">{codeSent}</strong>
                  <br />
                  <span className="text-xs text-primary/70 font-inter font-normal">
                    Ve a nuestro servidor de Discord y usa{" "}
                    <code className="bg-primary/10 px-1 rounded">/redeem {codeSent}</code> para obtener tu enlace de descarga.
                  </span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10">
              {(["purchased", "scripts"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 font-rajdhani font-bold uppercase tracking-wider text-sm transition-all ${
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary -mb-px"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab === "purchased" ? `SCRIPTS COMPRADOS (${MOCK_PURCHASED.length})` : "MIS SCRIPTS (0)"}
                </button>
              ))}
            </div>

            {activeTab === "purchased" ? (
              <div className="space-y-3">
                {MOCK_PURCHASED.map((s) => (
                  <div key={s.id} className="bg-dark-lighter/50 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${s.id}`} className="font-rajdhani font-bold italic uppercase text-white hover:text-primary transition-colors flex items-center gap-1 text-sm">
                        {s.title} <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 font-inter">{s.author}</span>
                        <StarRating rating={s.rating} showCount={false} />
                        <span className="text-xs text-gray-600 font-inter">{s.purchasedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-rajdhani font-bold italic text-white">
                        {s.price === 0 ? "GRATIS" : `🪙 ${s.price}`}
                      </span>
                      <button
                        onClick={() => handleGetCode(s.id)}
                        disabled={loadingCode === s.id}
                        className="px-4 py-2 bg-primary/10 border border-primary/40 text-primary text-xs font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-60"
                      >
                        {loadingCode === s.id ? "..." : "OBTENER CÓDIGO"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-rajdhani font-bold italic uppercase text-white text-xl mb-2">
                  SIN SCRIPTS AÚN
                </h3>
                <p className="text-gray-500 font-inter text-sm mb-6">
                  Sube tu primer script de FiveM y empieza a ganar créditos.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark font-rajdhani font-black uppercase tracking-wider rounded-2xl hover:brightness-110 transition-all text-sm"
                >
                  <Upload className="w-4 h-4" />
                  SUBIR SCRIPT
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
