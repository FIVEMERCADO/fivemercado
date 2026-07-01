"use client";

import { useState } from "react";
import { Upload, Plus, X, Link as LinkIcon, FileArchive, Image as ImageIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CATEGORIES = ["ESX", "Other", "QBCORE/QBOX", "Server Dumps", "Standalone"];

const GUIDELINES = [
  "Los scripts deben ser trabajo original o debes tener derechos para vender/distribuir",
  "Sin código malicioso ofuscado/encriptado — todos los scripts son revisados antes de su aprobación",
  "Incluye una descripción clara con las características listadas",
  "Proporciona al menos una captura de pantalla o imagen de vista previa",
  "Los scripts deben ser funcionales y probados en un servidor FiveM en vivo",
  "El precio debe estar en créditos y reflejar la complejidad del script",
];

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fileOption, setFileOption] = useState<"direct" | "links">("direct");
  const [externalLinks, setExternalLinks] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addLink() {
    setExternalLinks([...externalLinks, ""]);
  }

  function removeLink(i: number) {
    setExternalLinks(externalLinks.filter((_, idx) => idx !== i));
  }

  function updateLink(i: number, val: string) {
    const updated = [...externalLinks];
    updated[i] = val;
    setExternalLinks(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="font-rajdhani font-bold italic uppercase text-4xl text-white mb-4">
            ¡SCRIPT ENVIADO!
          </h2>
          <p className="text-gray-400 font-inter mb-8">
            Tu script está pendiente de revisión. Nuestro equipo lo verificará en 24–48 horas. Recibirás una notificación una vez aprobado.
          </p>
          <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm font-inter">
            ⏳ Estado: <strong>PENDIENTE DE REVISIÓN</strong>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="font-rajdhani font-bold italic uppercase text-4xl md:text-6xl leading-none">
            <span className="text-white">SUBE TU </span>
            <span className="text-primary">SCRIPT</span>
          </h1>
          <p className="text-gray-400 font-inter mt-3 text-sm">
            Comparte tu recurso FiveM con la comunidad. Los scripts pasan por revisión antes de ser publicados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              INFORMACIÓN BÁSICA
            </h2>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                TÍTULO DEL SCRIPT <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Police MDT System"
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                  CATEGORÍA <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white focus:outline-none focus:border-primary/60 transition-colors"
                >
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                  PRECIO (CRÉDITOS)
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <p className="text-[10px] text-gray-600 font-inter mt-1">
                  Introduce 0 para que el script sea completamente gratuito
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                DESCRIPCIÓN <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe tu script, sus características, requisitos y cómo instalarlo..."
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 font-inter mt-1">{description.length} chars</p>
            </div>
          </div>

          {/* Script Files */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              ARCHIVOS DEL SCRIPT
            </h2>

            <div className="flex gap-2">
              {(["direct", "links"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFileOption(opt)}
                  className={`px-4 py-2 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wider transition-all ${
                    fileOption === opt
                      ? "bg-primary text-dark"
                      : "border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {opt === "direct" ? "📁 Subir Archivos" : "🔗 Links Externos"}
                </button>
              ))}
            </div>

            {fileOption === "direct" ? (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <FileArchive className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-inter text-sm mb-1">
                  Arrastra y suelta tus archivos .zip o .rar aquí
                </p>
                <p className="text-xs text-gray-600 font-inter mb-4">
                  Hasta 5GB por archivo · Se permiten múltiples archivos
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/50 text-primary text-sm font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Explorar Archivos
                  <input type="file" accept=".zip,.rar" multiple className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-inter">
                  Añade links de Google Drive, MediaFire, MEGA, etc.
                  <span className="text-primary/70 ml-1">Los links estarán ocultos para quienes no hayan comprado.</span>
                </p>
                {externalLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateLink(i, e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>
                    {externalLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="p-3 border border-white/10 rounded-xl text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-inter transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  AÑADIR OTRO LINK
                </button>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-4">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              IMÁGENES <span className="text-gray-500 font-normal normal-case font-inter">(opcional)</span>
            </h2>
            <p className="text-xs text-gray-500 font-inter">
              JPG, PNG, GIF, WebP · Máx 5MB cada una · La primera imagen será la miniatura
            </p>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-inter text-sm mb-3">Subir capturas de pantalla del script</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-primary/50 text-primary text-sm font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Elegir Imágenes
                <input type="file" accept="image/*" multiple className="hidden" />
              </label>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
            <h3 className="font-rajdhani font-bold uppercase text-yellow-400 text-sm tracking-wider mb-3">
              GUÍAS DE PUBLICACIÓN
            </h3>
            <ul className="space-y-2">
              {GUIDELINES.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400 font-inter">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-primary text-dark font-rajdhani font-black uppercase tracking-widest text-lg rounded-3xl hover:brightness-110 hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-3"
          >
            <Upload className="w-5 h-5" />
            {submitting ? "SUBIENDO..." : "SUBIR SCRIPT"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
