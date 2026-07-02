"use client";

import { useState, useEffect } from "react";

const REACTIONS = ["👍", "❤️", "🔥", "😢", "😡"] as const;
type Reaction = (typeof REACTIONS)[number];

interface ReactionsBarProps {
  scriptId: string;
}

interface ReactionsState {
  counts: Record<string, number>;
  userReaction: string | null;
}

export function ReactionsBar({ scriptId }: ReactionsBarProps) {
  const [state, setState] = useState<ReactionsState>({ counts: {}, userReaction: null });
  const [loading, setLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/scripts/${scriptId}/react`)
      .then((r) => r.json())
      .then((data) => {
        if (data.counts) setState(data);
      })
      .catch(() => {});
  }, [scriptId]);

  async function handleReact(reaction: Reaction) {
    if (loading) return;
    setLoading(reaction);

    // Optimistic update
    const prev = state;
    setState((s) => {
      const newCounts = { ...s.counts };
      if (s.userReaction === reaction) {
        // Toggle off
        newCounts[reaction] = Math.max(0, (newCounts[reaction] ?? 1) - 1);
        return { counts: newCounts, userReaction: null };
      } else {
        // Remove old reaction count
        if (s.userReaction) {
          newCounts[s.userReaction] = Math.max(0, (newCounts[s.userReaction] ?? 1) - 1);
        }
        newCounts[reaction] = (newCounts[reaction] ?? 0) + 1;
        return { counts: newCounts, userReaction: reaction };
      }
    });

    try {
      const res = await fetch(`/api/scripts/${scriptId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      } else if (res.status === 401) {
        // Revertir si no está autenticado
        setState(prev);
      }
    } catch {
      setState(prev);
    } finally {
      setLoading(null);
    }
  }

  if (!mounted) return null;

  const totalReactions = Object.values(state.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {totalReactions > 0 && (
        <span className="text-xs text-gray-600 font-inter mr-1">
          {totalReactions.toLocaleString()} reacciones
        </span>
      )}
      {REACTIONS.map((reaction) => {
        const count = state.counts[reaction] ?? 0;
        const isSelected = state.userReaction === reaction;
        return (
          <button
            key={reaction}
            onClick={() => handleReact(reaction)}
            disabled={loading === reaction}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-inter transition-all ${
              isSelected
                ? "bg-primary/15 border-primary/40 text-white scale-105"
                : "bg-dark-lighter/70 border-white/5 text-gray-400 hover:border-white/20 hover:text-white hover:scale-105"
            } disabled:scale-100`}
            title={`${count} reacción${count !== 1 ? "es" : ""}`}
          >
            <span className="text-base leading-none">{reaction}</span>
            {count > 0 && (
              <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-gray-500"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
