import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="es" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="antialiased bg-dark text-white font-inter">
        {children}
      </body>
    </html>
  );
}
