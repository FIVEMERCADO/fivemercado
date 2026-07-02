"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Bot, ExternalLink, Copy, Check, Loader2, MessageCircle } from "lucide-react";

const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/rS5akJYFaa";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptId: string;
  scriptTitle?: string;
  linkvertiseUrl?: string;
}

export function DownloadModal({
  isOpen,
  onClose,
  scriptId,
  scriptTitle,
  linkvertiseUrl,
}: DownloadModalProps) {
  const [code, setCode]           = useState<string | null>(null);
  const [codeLoading, setLoading] = useState(false);
  const [codeError, setError]     = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    if (isOpen) { setCode(null); setError(null); setCopied(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleGetCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_id: scriptId }),
      });
      if (res.status === 401) { window.location.href = "/?callbackUrl=/marketplace"; return; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Error generando el código. Inténtalo de nuevo.");
        return;
      }
      const { code: newCode } = await res.json();
      setCode(newCode);
    } catch {
      setError("Error de conexión. Comprueba tu internet.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-dark-lighter border border-white/10 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-rajdhani font-black italic uppercase text-xl text-white">
              DESCARGAR RECURSO
            </h2>
            {scriptTitle && (
              <p className="text-xs text-gray-500 font-inter mt-0.5 line-clamp-1">{scriptTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex-shrink-0 ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">

          {/* Opción principal: Bot Discord */}
          <div className="bg-dark/60 border border-primary/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-rajdhani font-black uppercase text-sm text-white">Bot de Discord</p>
                <p className="text-xs text-gray-500 font-inter">Link seguro · Expira en 5 min · Un solo uso</p>
              </div>
            </div>

            {/* Instrucción */}
            <div className="bg-dark rounded-xl p-3 space-y-2">
              <p className="text-xs text-gray-400 font-inter">
                Escribe este comando en nuestro servidor de Discord:
              </p>
              <div className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                <code className="font-rajdhani font-black text-primary text-sm tracking-wider">
                  /descargar
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("/descargar");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-lg text-xs font-rajdhani font-bold uppercase transition-all"
                >
                  {copied ? <><Check className="w-3 h-3" /> OK</> : <><Copy className="w-3 h-3" /> COPIAR</>}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 font-inter">
                El bot te enviará el link por DM automáticamente.
              </p>
            </div>

            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-primary text-dark font-rajdhani font-black uppercase tracking-widest rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5" /> IR AL SERVIDOR DISCORD
            </a>
          </div>

          {/* Opción 2: Código de canje */}
          <div className="bg-dark/60 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="font-rajdhani font-black uppercase text-sm text-white">Código de canje</p>
                <p className="text-xs text-gray-500 font-inter">Genera un código y úsalo con <code className="text-indigo-400">/redimir</code></p>
              </div>
            </div>

            {codeError && (
              <p className="text-red-400 text-xs font-inter bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                {codeError}
              </p>
            )}

            {code ? (
              <div className="bg-dark border border-indigo-500/20 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 font-inter uppercase tracking-widest mb-1.5">Tu código:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-rajdhani font-black text-indigo-400 text-sm tracking-widest">{code}</code>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-rajdhani font-bold uppercase transition-all"
                  >
                    {copied ? <><Check className="w-3 h-3" /> COPIADO</> : <><Copy className="w-3 h-3" /> COPIAR</>}
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 font-inter mt-2">
                  Usa <code className="text-indigo-400">/redimir {code}</code> en el bot
                </p>
              </div>
            ) : (
              <button
                onClick={handleGetCode}
                disabled={codeLoading}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-rajdhani font-black uppercase tracking-widest rounded-xl text-xs transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {codeLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> GENERANDO...</>
                  : "GENERAR CÓDIGO"
                }
              </button>
            )}
          </div>

          {/* Opción 3: Linkvertise (solo si disponible) */}
          {linkvertiseUrl && (
            <div className="bg-dark/60 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-rajdhani font-black uppercase text-sm text-white">Gratis · Linkvertise</p>
                  <p className="text-xs text-gray-500 font-inter">Con anuncios · Sin cuenta necesaria</p>
                </div>
              </div>
              <a
                href={linkvertiseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-rajdhani font-black uppercase tracking-widest rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" /> IR A LINKVERTISE
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-600 font-inter mt-4">
          Los links de descarga se envían por Discord para proteger el contenido.
        </p>
      </div>
    </div>
  );
}
