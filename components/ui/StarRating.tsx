"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  className?: string;
  showCount?: boolean;
}

export function StarRating({ rating, reviews, className, showCount = true }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;
    return { filled, half };
  });

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <span className="flex items-center gap-0.5">
        {stars.map((star, i) => (
          <span
            key={i}
            className={cn(
              "text-sm",
              star.filled ? "text-yellow-400" : star.half ? "text-yellow-300" : "text-gray-600"
            )}
          >
            {star.filled || star.half ? "★" : "☆"}
          </span>
        ))}
      </span>
      {showCount && reviews !== undefined && (
        <span className="text-xs text-gray-500 font-inter">({reviews} reseñas)</span>
      )}
    </span>
  );
}
