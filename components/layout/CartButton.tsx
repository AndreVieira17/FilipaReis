"use client";

import { ShoppingBag } from "lucide-react";
import { useCartCount, useCartStore, useCartHasHydrated } from "@/store/cart-store";

export function CartButton() {
  const count = useCartCount();
  const hasHydrated = useCartHasHydrated();
  const toggle = useCartStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Abrir carrinho"
      className="relative p-2 text-charcoal"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {hasHydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] leading-none text-cream">
          {count}
        </span>
      )}
    </button>
  );
}
