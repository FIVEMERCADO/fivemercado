"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-2xl",
        hoverable && "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {children}
    </div>
  );
}
