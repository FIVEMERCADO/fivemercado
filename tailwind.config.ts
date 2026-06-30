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
        primary: "#2cade0",
        dark: "#0a0b10",
        "dark-lighter": "#11131a",
        "glass-bg": "rgba(21,23,30,0.7)",
      },
      fontFamily: {
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
