"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionTitle } from "@/components/ui/SectionTitle";

const PACKAGES = [
  { id: "100", credits: 100, price: 5, bonus: null, popular: false },
  { id: "300", credits: 300, price: 15, bonus: null, popular: true },
  { id: "500", credits: 500, price: 25, bonus: "+50 BONUS", popular: false },
  { id: "1000", credits: 1000, price: 65, bonus: "+100 BONUS", popular: false },
];

const MOCK_TRANSACTIONS = [
  { type: "VENTA", description: "Advanced Police MDT System", date: "28 Jun 2026", amount: 24.99 },
  { type: "PAYPAL", description: "Comprado 300 créditos", date: "20 Jun 2026", amount: 300 },
  { type: "COMPRA", description: "Comprado: Heist Pack", date: "18 Jun 2026", amount: -49.99 },
  { type: "PAYPAL", description: "Comprado 100 créditos", date: "10 Jun 2026", amount: 100 },
  { type: "COMPRA", description: "Comprado: QBCore Vehicle Dealer", date: "05 Jun 2026", amount: 0 },
  { type: "VENTA", description: "Realistic Fuel System", date: "30 May 2026", amount: 12.5 },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [paypalStatus, setPaypalStatus] = useState<"success" | "error" | null>(null);
  const balance = 1250;

  // Detectar retorno desde PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPaypalStatus("success");
      window.history.replaceState({}, "", "/credits");
    } else if (params.get("error")) {
      setPaypalStatus("error");
      window.history.replaceState({}, "", "/credits");
    }
  }, []);

  async function handleBuy(pkgId: string) {
    setLoading(pkgId);
    try {
      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: parseInt(pkgId) }),
      });

      if (res.status === 401) {
        window.location.href = "/?callbackUrl=/credits";
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("PayPal create error:", body);
        setPaypalStatus("error");
        setLoading(null);
        return;
      }

      const { approveUrl } = await res.json();
      window.location.href = approveUrl;
      // No reseteamos loading — la página va a redirigir
    } catch {
      setPaypalStatus("error");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-rajdhani font-bold italic uppercase text-5xl md:text-7xl leading-none">
            <span className="text-white">COMPRAR </span>
            <span className="text-primary">CRÉDITOS</span>
          </h1>
          <p className="text-gray-400 font-inter mt-3">
            Los créditos son la moneda usada para comprar scripts y recursos en el marketplace.
          </p>
        </div>

        {/* Banners de estado PayPal */}
        {paypalStatus === "success" && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-emerald-300 font-inter text-sm">
              ¡Pago completado! Los créditos han sido añadidos a tu cuenta.
            </p>
            <button onClick={() => setPaypalStatus(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-400 text-lg leading-none">×</button>
          </div>
        )}
        {paypalStatus === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 font-inter text-sm">
              El pago fue cancelado o hubo un error. Inténtalo de nuevo.
            </p>
            <button onClick={() => setPaypalStatus(null)} className="ml-auto text-red-400/60 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        )}

        {/* Current balance */}
        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-rajdhani font-bold mb-4">
            TU SALDO ACTUAL
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-5xl">🪙</span>
            <span className="font-rajdhani font-bold italic text-7xl text-white">
              {balance.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-inter">Créditos disponibles</p>
        </div>

        {/* Packages */}
        <SectionTitle white="PAQUETES" cyan="DISPONIBLES" className="mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-dark-lighter/70 backdrop-blur-md border rounded-3xl p-6 flex flex-col gap-4 transition-all hover:border-primary/40 hover:-translate-y-1 ${
                pkg.popular
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : "border-white/5"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-dark text-xs font-rajdhani font-black uppercase tracking-wider rounded-full">
                  POPULAR
                </div>
              )}

              {/* PayPal badge */}
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase rounded tracking-wider">
                  PAYPAL
                </span>
                {pkg.bonus && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase rounded tracking-wider">
                    {pkg.bonus}
                  </span>
                )}
              </div>

              {/* Credits */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl">🪙</span>
                  <span className="font-rajdhani font-bold italic text-4xl text-white">
                    {pkg.credits.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-inter">créditos</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 font-inter">
                  Precio:{" "}
                  <span className="text-white font-bold">€{pkg.price}.00</span>
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5">
                {["✓ Entrega inmediata", "✓ Validez permanente"].map((f) => (
                  <li key={f} className="text-xs text-gray-500 font-inter">{f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={loading !== null}
                className="w-full py-3 bg-primary text-dark font-rajdhani font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:scale-100 text-sm flex items-center justify-center gap-2"
              >
                {loading === pkg.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    REDIRIGIENDO...
                  </>
                ) : (
                  "💳 PAGAR CON PAYPAL"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <SectionTitle white="HISTORIAL DE" cyan="TRANSACCIONES" className="mb-6" />
        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani">TIPO</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani hidden sm:table-cell">DESCRIPCIÓN</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani hidden md:table-cell">FECHA</th>
                <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani">MONTO</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-xs font-rajdhani font-bold uppercase rounded tracking-wider ${
                        tx.type === "VENTA"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : tx.type === "PAYPAL"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-inter hidden sm:table-cell">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-inter hidden md:table-cell">
                    {tx.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-rajdhani font-bold text-sm ${
                        tx.amount >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
