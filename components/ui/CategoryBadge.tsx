"use client";

import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  STANDALONE: "bg-slate-700/80 text-slate-200 border-slate-500/40",
  "QBCORE/QBOX": "bg-violet-900/80 text-violet-200 border-violet-500/40",
  ESX: "bg-orange-900/80 text-orange-200 border-orange-500/40",
  "Server Dumps": "bg-teal-900/80 text-teal-200 border-teal-500/40",
  Other: "bg-zinc-800/80 text-zinc-300 border-zinc-500/40",
};

interface CategoryBadgeProps {
  type: string;
  className?: string;
}

export function CategoryBadge({ type, className }: CategoryBadgeProps) {
  const colorClass = typeColors[type] || typeColors["Other"];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-rajdhani font-bold uppercase tracking-wider border",
        colorClass,
        className
      )}
    >
      {type}
    </span>
  );
}
