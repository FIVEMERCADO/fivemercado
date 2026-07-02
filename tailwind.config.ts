import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GTA color palette
        primary:       "#ff6600",   // GTA orange
        "primary-dim": "#cc4f00",
        secondary:     "#00e5ff",   // neon cyan
        pink:          "#e040fb",   // neon purple-pink
        neon:          "#00ff9f",   // neon green
        dark:          "#070710",   // ultra dark (GTA night)
        "dark-mid":    "#0d0d1f",
        "dark-lighter":"#12122a",
        "dark-card":   "#0f0f22",
        "glass-bg":    "rgba(13,13,31,0.75)",
        "border-glow": "rgba(255,102,0,0.4)",
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        mono:     ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "neon-orange": "0 0 10px #ff6600, 0 0 30px rgba(255,102,0,0.4)",
        "neon-cyan":   "0 0 10px #00e5ff, 0 0 30px rgba(0,229,255,0.4)",
        "neon-pink":   "0 0 10px #e040fb, 0 0 30px rgba(224,64,251,0.4)",
        "neon-green":  "0 0 10px #00ff9f, 0 0 30px rgba(0,255,159,0.4)",
        "card-glow":   "0 8px 40px rgba(255,102,0,0.15), 0 0 0 1px rgba(255,102,0,0.1)",
      },
      animation: {
        "glitch":         "glitch 3s infinite",
        "glitch-2":       "glitch-2 3s infinite",
        "neon-flicker":   "neon-flicker 4s infinite",
        "scanline":       "scanline 8s linear infinite",
        "glow-pulse":     "glow-pulse 2s ease-in-out infinite",
        "slide-up":       "slide-up 0.6s ease-out forwards",
        "slide-in-left":  "slide-in-left 0.5s ease-out forwards",
        "fade-in":        "fade-in 0.4s ease-out forwards",
        "wanted-flash":   "wanted-flash 0.4s ease-in-out",
        "power-on":       "power-on 1s ease-out forwards",
        "border-run":     "border-run 2s linear infinite",
        "float":          "float 3s ease-in-out infinite",
      },
      keyframes: {
        glitch: {
          "0%, 90%, 100%": { transform: "translate(0)", clipPath: "none" },
          "91%": { transform: "translate(-3px, 1px)", filter: "hue-rotate(90deg)" },
          "92%": { transform: "translate(3px, -1px)", filter: "hue-rotate(-90deg)" },
          "93%": { transform: "translate(0)", filter: "none" },
          "95%": { transform: "translate(2px, 2px)", opacity: "0.8" },
          "96%": { transform: "translate(-2px, -2px)", opacity: "1" },
        },
        "glitch-2": {
          "0%, 85%, 100%": { transform: "translate(0)", opacity: "1" },
          "86%": { transform: "translate(4px, 0)", opacity: "0.7", filter: "hue-rotate(180deg)" },
          "88%": { transform: "translate(-4px, 0)", opacity: "0.9" },
          "90%": { transform: "translate(0)", opacity: "1", filter: "none" },
        },
        "neon-flicker": {
          "0%, 19%, 21%, 23%, 75%, 77%, 100%": {
            opacity: "1",
            textShadow: "0 0 7px #ff6600, 0 0 21px #ff6600, 0 0 42px rgba(255,102,0,0.6)",
          },
          "20%, 22%, 76%": { opacity: "0.4", textShadow: "none" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255,102,0,0.3), 0 0 15px rgba(255,102,0,0.1)" },
          "50%":      { boxShadow: "0 0 20px rgba(255,102,0,0.7), 0 0 40px rgba(255,102,0,0.3)" },
        },
        scanline: {
          "0%":   { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100vh" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "wanted-flash": {
          "0%, 100%": { backgroundColor: "rgba(255,102,0,0.2)" },
          "50%":      { backgroundColor: "rgba(255,102,0,0.6)" },
        },
        "power-on": {
          "0%":   { opacity: "0", filter: "brightness(3) blur(4px)" },
          "30%":  { opacity: "1", filter: "brightness(1.5) blur(1px)" },
          "100%": { opacity: "1", filter: "brightness(1) blur(0)" },
        },
        "border-run": {
          "0%":   { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
