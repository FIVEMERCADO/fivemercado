"use client";

import { useState } from "react";
import { Upload, Plus, X, Link as LinkIcon, FileArchive, Image as ImageIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CATEGORIES = ["ESX", "Other", "QBCORE/QBOX", "Server Dumps", "Standalone"];

const GUIDELINES = [
  "Scripts must be original work or you must have rights to sell/distribute",
  "No obfuscated/encrypted malicious code — all scripts are reviewed before approval",
  "Include a clear description with features listed",
  "Provide at least one screenshot or preview image",
  "Scripts must be functional and tested on a live FiveM server",
  "Pricing must be in credits and reflect the script's complexity",
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
            SCRIPT SUBMITTED!
          </h2>
          <p className="text-gray-400 font-inter mb-8">
            Your script is now pending review. Our team will verify it within 24–48 hours. You&apos;ll be notified once it&apos;s approved.
          </p>
          <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm font-inter">
            ⏳ Status: <strong>PENDING REVIEW</strong>
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
            <span className="text-white">UPLOAD YOUR </span>
            <span className="text-primary">SCRIPT</span>
          </h1>
          <p className="text-gray-400 font-inter mt-3 text-sm">
            Share your FiveM resource with the community. Scripts go through review before being published.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              BASIC INFORMATION
            </h2>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                SCRIPT TITLE <span className="text-red-400">*</span>
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
                  CATEGORY <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white focus:outline-none focus:border-primary/60 transition-colors"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                  PRICE (CREDITS)
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
                  Enter 0 to make this script completely free
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-inter mb-2">
                DESCRIPTION <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe your script, its features, requirements, and how to install it..."
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm font-inter text-white placeholder-gray-600 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 font-inter mt-1">{description.length} chars</p>
            </div>
          </div>

          {/* Script Files */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              SCRIPT FILES
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
                  {opt === "direct" ? "📁 Upload Files" : "🔗 External Links"}
                </button>
              ))}
            </div>

            {fileOption === "direct" ? (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <FileArchive className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-inter text-sm mb-1">
                  Drag & drop your .zip or .rar files here
                </p>
                <p className="text-xs text-gray-600 font-inter mb-4">
                  Up to 5GB per file · Multiple files allowed
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/50 text-primary text-sm font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Browse Files
                  <input type="file" accept=".zip,.rar" multiple className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-inter">
                  Add links from Google Drive, MediaFire, MEGA, etc.
                  <span className="text-primary/70 ml-1">Links will be hidden from non-purchasers.</span>
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
                  ADD ANOTHER LINK
                </button>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-3xl p-8 space-y-4">
            <h2 className="font-rajdhani font-bold uppercase text-white tracking-wider text-sm">
              IMAGES <span className="text-gray-500 font-normal normal-case font-inter">(optional)</span>
            </h2>
            <p className="text-xs text-gray-500 font-inter">
              JPG, PNG, GIF, WebP · Max 5MB each · First image will be the thumbnail
            </p>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-inter text-sm mb-3">Upload preview screenshots</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-primary/50 text-primary text-sm font-rajdhani font-bold uppercase rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Choose Images
                <input type="file" accept="image/*" multiple className="hidden" />
              </label>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
            <h3 className="font-rajdhani font-bold uppercase text-yellow-400 text-sm tracking-wider mb-3">
              UPLOAD GUIDELINES
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
            {submitting ? "UPLOADING..." : "UPLOAD SCRIPT"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
