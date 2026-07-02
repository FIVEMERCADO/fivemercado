"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

const INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/rS5akJYFaa";

export default function JoinPage() {
  const [checking, setChecking] = useState(false);
  const [error, setError]       = useState("");

  async function handleVerify() {
    setChecking(true);
    setError("");
    try {
      const res  = await fetch("/api/verify-membership");
      const data = await res.json();
      if (data.member) {
        // Re-login silencioso para regenerar el JWT con guildMember: true
        // Discord no muestra pantalla de permisos si ya está autenticado
        window.location.href = "/api/auth/signin?callbackUrl=/marketplace";
      } else {
        setError("Todavía no estás en el servidor. Únete y espera unos segundos antes de verificar.");
      }
    } catch {
      setError("Error verificando. Inténtalo de nuevo.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Icono */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-[#5865F2]/20 border-2 border-[#5865F2]/40 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#5865F2]" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.9a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.4 37.4 0 0 0 25.6 1a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.9 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2C72.9 29.3 69 16.6 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="space-y-3">
          <h1 className="font-rajdhani font-bold text-4xl uppercase tracking-wide text-white">
            Únete al servidor
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Para acceder al marketplace y descargar scripts, debes ser miembro del servidor oficial de Discord de{" "}
            <span className="text-primary font-semibold">FiveMercado</span>.
          </p>
        </div>

        {/* Pasos */}
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-6 text-left space-y-4">
          <p className="text-white/50 text-sm uppercase tracking-widest font-semibold">Cómo acceder</p>
          <div className="space-y-3">
            {[
              { num: "1", text: "Haz clic en el botón de abajo para unirte al servidor" },
              { num: "2", text: "Acepta las reglas en el servidor de Discord" },
              { num: "3", text: "Vuelve aquí y haz clic en \"Ya me uní\"" },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.num}
                </span>
                <p className="text-white/70">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#5865F2] hover:bg-[#4752c4] text-white font-rajdhani font-bold uppercase tracking-wider py-4 px-6 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.9a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.4 37.4 0 0 0 25.6 1a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.9 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2C72.9 29.3 69 16.6 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z" />
            </svg>
            Unirse al servidor
          </a>

          <button
            onClick={handleVerify}
            disabled={checking}
            className="flex-1 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-rajdhani font-bold uppercase tracking-wider py-4 px-6 rounded-xl transition-colors text-lg"
          >
            {checking ? "Verificando..." : "Ya me uní ✓"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Salir */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
