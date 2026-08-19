"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("wishlist");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-label={saved ? t("unsave", { name: product.name }) : t("save", { name: product.name })}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-cream/90 p-2 text-charcoal shadow-sm backdrop-blur transition-all duration-150 hover:bg-cream active:scale-90",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-150",
          saved && "fill-clay text-clay scale-110"
        )}
        strokeWidth={1.5}
      />
    </button>
  );
}
