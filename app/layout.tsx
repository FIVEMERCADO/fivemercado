import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FiveMercado — Scripts y Assets para FiveM",
  description:
    "El mercado hispanohablante de scripts, assets y recursos para servidores FiveM GTA V. +1,300 recursos verificados.",
  keywords: ["FiveM", "scripts", "assets", "QBCore", "ESX", "GTA V", "roleplay", "español", "mercado"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <body className="antialiased bg-dark text-white font-rajdhani">
        {children}
      </body>
    </html>
  );
}
