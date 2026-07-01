"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Recursos Gratis", href: "/marketplace?filter=free" },
  { label: "Scripts Premium", href: "/marketplace?filter=paid" },
];

const DISCORD_SVG = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.030zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-rajdhani font-bold italic uppercase text-2xl tracking-wider select-none">
              <span className="text-white">FIVE</span>
              <span className="text-primary">MERCADO</span>
            </span>
          </Link>

          {/* Desktop nav links — visible lg+ */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-inter text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — visible lg+ */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Discord */}
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-inter hover:bg-indigo-600/30 transition-colors"
            >
              {DISCORD_SVG}
              Discord
            </a>

            {/* Credits */}
            <Link
              href="/credits"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors"
            >
              <span className="text-sm">🪙</span>
              <span className="text-xs font-rajdhani font-bold text-yellow-400">0.00</span>
            </Link>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-white/10 hover:border-primary/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  U
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${userOpen ? "rotate-180" : ""}`} />
              </button>

              {userOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-dark-lighter border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-[10px] font-inter text-gray-500 uppercase tracking-wider">Conectado como</p>
                      <p className="text-sm font-rajdhani font-bold text-white mt-0.5">User#1234</p>
                    </div>
                    <div className="py-1">
                      {[
                        { label: "Mi Perfil", href: "/profile" },
                        { label: "Mis Compras", href: "/profile" },
                        { label: "Vender Scripts", href: "/upload" },
                        { label: "Comprar Créditos", href: "/credits" },
                      ].map((item) => (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setUserOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-inter"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={() => setUserOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors font-inter"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hamburger — visible below lg */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu — visible below lg */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-dark/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-inter text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href="/credits"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <span className="text-sm">🪙</span>
                  <span className="text-xs font-rajdhani font-bold text-yellow-400">0.00</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-xl text-sm text-gray-300"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    U
                  </div>
                  Mi Cuenta
                </Link>
              </div>

              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm font-inter"
              >
                {DISCORD_SVG}
                Unirse al Discord
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
