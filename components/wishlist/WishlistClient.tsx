"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWishlistStore, useWishlistHasHydrated } from "@/store/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { LinkButton } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function WishlistClient() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const hasHydrated = useWishlistHasHydrated();
  const addToCart = useCartStore((s) => s.addItem);
  const t = useTranslations("wishlist");
  const tCommon = useTranslations("common");

  if (!hasHydrated) {
    return <div className="container-app py-24" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Heart className="h-10 w-10 text-stone" strokeWidth={1.5} />
        <h1 className="font-display text-2xl text-charcoal">{t("empty")}</h1>
        <p className="max-w-sm text-sm text-stone">{t("emptyText")}</p>
        <LinkButton href="/loja" variant="primary">{tCommon("browseShop")}</LinkButton>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <h1 className="font-display text-3xl text-charcoal">{t("title")}</h1>
      <p className="mt-2 text-sm text-stone">
        {t("itemsCount", { count: items.length })}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="group relative">
            <button
              type="button"
              onClick={() => remove(item.productId)}
              aria-label={t("remove", { name: item.name })}
              className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-cream/90 p-2 text-charcoal shadow-sm backdrop-blur transition-colors hover:bg-cream"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <Link href={`/loja/${item.slug}`} className="block">
              <ProductMedia
                src={item.image}
                alt={item.name}
                imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm text-charcoal">{item.name}</h3>
                  {item.category && <p className="mt-0.5 text-xs text-stone">{item.category}</p>}
                </div>
                <p className="whitespace-nowrap text-sm text-charcoal">{formatPrice(item.price)}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() =>
                addToCart({
                  key: `${item.productId}:default`,
                  productId: item.productId,
                  variantId: null,
                  slug: item.slug,
                  name: item.name,
                  variantLabel: null,
                  unitPrice: item.price,
                  image: item.image,
                  weightGrams: item.weightGrams,
                })
              }
              className="mt-3 w-full rounded-full border border-line py-2 text-xs text-charcoal transition-colors hover:border-charcoal"
            >
              {tCommon("addToCart")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
