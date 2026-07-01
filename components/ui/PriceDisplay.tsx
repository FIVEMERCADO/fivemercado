"use client";

import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  isFree: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PriceDisplay({ price, isFree, size = "md", className }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-xl gap-2",
    xl: "text-4xl gap-3",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-2xl",
  };

  if (isFree) {
    return (
      <span
        className={cn(
          "font-rajdhani font-bold italic uppercase text-emerald-400",
          sizeClasses[size],
          "flex items-center",
          className
        )}
      >
        GRATIS
      </span>
    );
  }

  return (
    <span
      className={cn(
        "font-rajdhani font-bold italic flex items-center",
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("select-none", iconSizes[size])}>🪙</span>
      <span className="text-white">{price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}</span>
    </span>
  );
}
