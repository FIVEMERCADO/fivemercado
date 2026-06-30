"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  className?: string;
}

export function TabPanel({ tabs, className }: TabPanelProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className={cn("", className)}>
      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-5 py-2.5 font-rajdhani font-bold uppercase tracking-wider text-sm transition-all",
              active === tab.id
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Active tab content */}
      <div>
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
