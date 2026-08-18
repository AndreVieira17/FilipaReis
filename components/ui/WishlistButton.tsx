"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/store/wishlist-store";

export function WishlistButton({
  product,
  className,
}: {
  product: WishlistItem;
  className?: string;
}) {
  const saved = useWishlistStore((s) => s.isSaved(product.productId));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-label={saved ? `Remover ${product.name} dos favoritos` : `Guardar ${product.name} nos favoritos`}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-cream/90 p-2 text-charcoal shadow-sm backdrop-blur transition-colors hover:bg-cream",
        className
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-colors", saved && "fill-clay text-clay")}
        strokeWidth={1.5}
      />
    </button>
  );
}
