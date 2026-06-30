"use client";

import { cn } from "@/lib/utils";

interface SectionTitleProps {
  white: string;
  cyan: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionTitle({ white, cyan, className, align = "left" }: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "center" && "justify-center",
        className
      )}
    >
      <span className="w-1 h-7 bg-primary rounded-full flex-shrink-0" />
      <h2 className="font-rajdhani font-bold italic uppercase text-2xl md:text-3xl tracking-wide">
        <span className="text-white">{white} </span>
        <span className="text-primary">{cyan}</span>
      </h2>
    </div>
  );
}
