"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { ProductMedia } from "@/components/ui/ProductMedia";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const t = useTranslations("cart");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-charcoal/30 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-cream shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label={t("title")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm tracking-wide text-charcoal">
            {t("title")} ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="p-1 text-charcoal"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <ShoppingBag className="h-8 w-8 text-stone" strokeWidth={1.5} />
            <p className="text-sm text-stone">{t("empty")}.</p>
            <Link
              href="/loja"
              onClick={close}
              className="text-sm text-charcoal underline underline-offset-4"
            >
              {t("emptyLink")}
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <ProductMedia
                    src={item.image}
                    alt={item.name}
                    sizes="80px"
                    className="h-20 w-20 shrink-0"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-charcoal">{item.name}</p>
                        {item.variantLabel && (
                          <p className="text-xs text-stone">{item.variantLabel}</p>
                        )}
                        <p className="mt-0.5 text-xs text-stone">
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={t("remove", { name: item.name })}
                        className="text-stone hover:text-charcoal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="inline-flex w-fit items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label={t("decrease")}
                        className="rounded-full p-2 text-charcoal transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={item.quantity <= 1}
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={t("increase")}
                        className="rounded-full p-2 text-charcoal transition-colors hover:bg-sand"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-stone">{t("subtotal")}</span>
              <span className="text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/carrinho"
              onClick={close}
              className="flex w-full items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-clay-dark"
            >
              {t("viewCart")}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
