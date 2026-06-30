"use client";

import { useState } from "react";
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
  { type: "SCRIPT SALE", description: "Advanced Police MDT System", date: "Jun 28, 2026", amount: 24.99 },
  { type: "PAYPAL", description: "Purchased 300 credits", date: "Jun 20, 2026", amount: 300 },
  { type: "PURCHASE", description: "Bought: Heist Pack", date: "Jun 18, 2026", amount: -49.99 },
  { type: "PAYPAL", description: "Purchased 100 credits", date: "Jun 10, 2026", amount: 100 },
  { type: "PURCHASE", description: "Bought: QBCore Vehicle Dealer", date: "Jun 05, 2026", amount: 0 },
  { type: "SCRIPT SALE", description: "Realistic Fuel System", date: "May 30, 2026", amount: 12.5 },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const balance = 1250;

  async function handleBuy(pkgId: string) {
    setLoading(pkgId);
    // In production: redirect to PayPal
    setTimeout(() => {
      alert(`Redirecting to PayPal for package ${pkgId}...`);
      setLoading(null);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-rajdhani font-bold italic uppercase text-5xl md:text-7xl leading-none">
            <span className="text-white">BUY </span>
            <span className="text-primary">CREDITS</span>
          </h1>
          <p className="text-gray-400 font-inter mt-3">
            Credits are the currency used to purchase scripts and resources on the marketplace.
          </p>
        </div>

        {/* Current balance */}
        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-rajdhani font-bold mb-4">
            YOUR CURRENT BALANCE
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-5xl">🪙</span>
            <span className="font-rajdhani font-bold italic text-7xl text-white">
              {balance.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-inter">Available credits</p>
        </div>

        {/* Packages */}
        <SectionTitle white="AVAILABLE" cyan="PACKAGES" className="mb-6" />
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
                <p className="text-xs text-gray-500 font-inter">credits</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 font-inter">Price: <span className="text-white font-bold">€{pkg.price}.00</span></p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5">
                {["✓ Instant delivery", "✓ Lifetime validity"].map((f) => (
                  <li key={f} className="text-xs text-gray-500 font-inter">{f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={loading === pkg.id}
                className="w-full py-3 bg-primary text-dark font-rajdhani font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:scale-100 text-sm flex items-center justify-center gap-2"
              >
                {loading === pkg.id ? "Loading..." : "💳 BUY WITH PAYPAL"}
              </button>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <SectionTitle white="TRANSACTION" cyan="HISTORY" className="mb-6" />
        <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani">TYPE</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani hidden sm:table-cell">DESCRIPTION</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani hidden md:table-cell">DATE</th>
                <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-rajdhani">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-xs font-rajdhani font-bold uppercase rounded tracking-wider ${
                        tx.type === "SCRIPT SALE"
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
