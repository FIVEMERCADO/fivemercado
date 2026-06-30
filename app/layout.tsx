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
  title: "FiveM Scripts & Assets Marketplace",
  description:
    "Premium FiveM scripts, assets and resources for your GTA V roleplay server. 1,300+ verified resources.",
  keywords: ["FiveM", "scripts", "assets", "QBCore", "ESX", "GTA V", "roleplay"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="antialiased bg-dark text-white font-inter">
        {children}
      </body>
    </html>
  );
}
