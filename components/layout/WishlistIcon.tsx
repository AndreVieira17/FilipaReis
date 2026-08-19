"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWishlistCount, useWishlistHasHydrated } from "@/store/wishlist-store";

export function WishlistIcon() {
  const count = useWishlistCount();
  const hasHydrated = useWishlistHasHydrated();
  const t = useTranslations("header");

  return (
    <Link href="/favoritos" aria-label={t("wishlistAria")} className="relative p-2 text-charcoal">
      <Heart className="h-5 w-5" strokeWidth={1.5} />
      {hasHydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] leading-none text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
