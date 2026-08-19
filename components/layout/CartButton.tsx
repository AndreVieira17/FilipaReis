"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartCount, useCartStore, useCartHasHydrated } from "@/store/cart-store";

export function CartButton() {
  const count = useCartCount();
  const hasHydrated = useCartHasHydrated();
  const toggle = useCartStore((s) => s.toggle);
  const t = useTranslations("header");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("cartAria")}
      className="relative rounded-full p-2 text-charcoal transition-colors hover:bg-sand"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {hasHydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] leading-none text-cream transition-transform">
          {count}
        </span>
      )}
    </button>
  );
}
