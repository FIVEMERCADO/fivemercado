"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import { CategoryBadge } from "./CategoryBadge";
import { StarRating } from "./StarRating";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductCard({ product, showRating = false, compact = false, className }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div
        className={cn(
          "group bg-dark-lighter/70 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden",
          "transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
          compact && "w-64 flex-shrink-0",
          className
        )}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-video">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.featured && (
              <span className="px-2 py-0.5 bg-emerald-600/90 text-white text-xs font-rajdhani font-bold uppercase rounded tracking-wider">
                FEATURED
              </span>
            )}
            <CategoryBadge type={product.type} />
          </div>
          {product.isFree && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-xs font-rajdhani font-bold uppercase rounded tracking-wider">
                FREE
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Author */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-primary/20 flex-shrink-0">
              <Image
                src={product.authorAvatar}
                alt={product.author}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-gray-400 font-inter uppercase tracking-wide">
              {product.author}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-rajdhani font-bold italic uppercase text-white leading-tight mb-1",
              compact ? "text-sm line-clamp-2" : "text-lg line-clamp-2"
            )}
          >
            {product.title}
          </h3>

          {/* Rating (if enabled) */}
          {showRating && (
            <StarRating rating={product.rating} reviews={product.reviews} className="mb-2" />
          )}

          {/* Description */}
          {!compact && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 font-inter leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-inter mb-0.5">
                PRICE
              </span>
              <PriceDisplay price={product.price} isFree={product.isFree} size="sm" />
            </div>
            <button className="px-3 py-1.5 border border-primary/50 text-primary text-xs font-rajdhani font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-primary/10 hover:border-primary hover:scale-105">
              {compact ? "VIEW" : "DETAILS"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
