"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCartStore,
  useCartSubtotal,
  useCartHasHydrated,
} from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { centimosParaEuro, euroParaCentimos } from "@/lib/pricing";
import {
  totalWeightGrams,
  resolveShippingCost,
  FREE_SHIPPING_THRESHOLD,
  type ShippingRegion,
} from "@/lib/shipping";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { Button, LinkButton } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";

const REGIONS: ShippingRegion[] = ["continental", "acores", "madeira", "ue"];

export function CarrinhoClient() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const hasHydrated = useCartHasHydrated();
  const [region, setRegion] = useState<ShippingRegion>("continental");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("cart");
  const tShip = useTranslations("shipping");
  const tBanner = useTranslations("shippingBanner");
  const tCheckout = useTranslations("checkout");
  const { user, loading: authLoading } = useSupabaseUser();

  const CHECKOUT_ERROR_KEYS: Record<string, string> = {
    EMPTY_CART: "errorEmptyCart",
    PRODUCT_UNAVAILABLE: "errorProductUnavailable",
    VARIANT_UNAVAILABLE: "errorVariantUnavailable",
    SHIPPING_UNAVAILABLE: "errorShippingUnavailable",
  };

  const weightGrams = useMemo(
    () =>
      totalWeightGrams(
        items.map((i) => ({ weightGrams: i.weightGrams, quantity: i.quantity }))
      ),
    [items]
  );
  const shippingCost = resolveShippingCost(region, weightGrams, subtotal);
  // Total calculado em cêntimos (nunca em euros com vírgula flutuante) —
  // exatamente o mesmo critério usado na rota de checkout, para que o
  // valor mostrado aqui nunca possa divergir do valor cobrado na Stripe.
  const totalCents = euroParaCentimos(subtotal) + euroParaCentimos(shippingCost ?? 0);
  const total = centimosParaEuro(totalCents);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          shippingRegion: region,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        const key = CHECKOUT_ERROR_KEYS[data.error as string];
        throw new Error(key ? t(key) : t("checkoutError"));
      }
      // Última verificação de segurança: o total que a Stripe vai realmente
      // cobrar (calculado no servidor, a partir dos preços na base de
      // dados) tem de ser exatamente igual ao total mostrado aqui. Se não
      // for — por exemplo, um preço mudou entre adicionares ao carrinho e
      // agora — recusamos avançar em vez de deixar pagar um valor diferente
      // do que foi mostrado.
      if (typeof data.totalCents === "number" && data.totalCents !== totalCents) {
        throw new Error(t("errorPriceChanged"));
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkoutError"));
      setLoading(false);
    }
  }

  if (!hasHydrated) {
    return <div className="container-app py-24" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-12">
        <Breadcrumbs items={[{ label: t("title") }]} />
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <ShoppingBag className="h-10 w-10 text-stone" strokeWidth={1.5} />
          <h1 className="font-display text-2xl text-charcoal">{t("empty")}</h1>
          <LinkButton href="/loja" variant="primary">{t("emptyLink")}</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("title") }]} />
      <h1 className="mt-6 font-display text-3xl text-charcoal">{t("title")}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-16">
        <ul className="divide-y divide-line lg:col-span-2">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-6 first:pt-0">
              <ProductMedia
                src={item.image}
                alt={item.name}
                sizes="96px"
                className="h-24 w-24 shrink-0"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/loja/${item.slug}`} className="text-sm text-charcoal hover:text-clay">
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <p className="text-xs text-stone">{item.variantLabel}</p>
                    )}
                    <p className="mt-1 text-xs text-stone">{formatPrice(item.unitPrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={t("remove", { name: item.name })}
                    className="-m-2 p-2 text-stone hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      aria-label={t("decrease")}
                      className="rounded-full p-2.5 text-charcoal transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-30 disabled:hover:bg-transparent"
                      disabled={item.quantity <= 1}
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={t("increase")}
                      className="rounded-full p-2.5 text-charcoal transition-colors hover:bg-sand"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-charcoal">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-lg border border-line bg-sand p-6">
          <div>
            <label htmlFor="shipping-region" className="mb-1.5 block text-xs text-stone">
              {tShip("region")}
            </label>
            <select
              id="shipping-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as ShippingRegion)}
              className="w-full rounded-md border border-line bg-cream px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {tShip(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone">{t("subtotal")}</span>
              <span className="text-charcoal">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone">{tShip("cost")}</span>
              {shippingCost === null ? (
                <span className="text-clay-dark">{tShip("unavailable")}</span>
              ) : shippingCost === 0 ? (
                <span className="text-clay-dark">{tShip("free")}</span>
              ) : (
                <span className="text-charcoal">{formatPrice(shippingCost)}</span>
              )}
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && shippingCost !== null && shippingCost > 0 && (
              <p className="text-xs text-stone">
                {tBanner("belowThreshold", {
                  remaining: formatPrice(FREE_SHIPPING_THRESHOLD - subtotal),
                })}
              </p>
            )}
            <div className="flex items-center justify-between border-t border-line pt-2 text-base">
              <span className="text-charcoal">{tShip("total")}</span>
              <span className="text-charcoal">{formatPrice(total)}</span>
            </div>
          </div>

          {!authLoading && (
            <div className="mt-4 border-t border-line pt-4">
              {user ? (
                <p className="text-xs text-stone">
                  {tCheckout("loggedInAs", { email: user.email ?? "" })}
                </p>
              ) : (
                <div className="text-xs text-stone">
                  <p>{tCheckout("accountOptionNote")}</p>
                  <Link
                    href="/conta/entrar?redirect=/carrinho"
                    className="mt-1 inline-block text-charcoal underline underline-offset-4"
                  >
                    {tCheckout("accountOption")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-xs text-clay-dark">{error}</p>}
          <LinkButton href="/loja" variant="secondary" className="mt-6 w-full">
            {t("continueShopping")}
          </LinkButton>
          <Button
            type="button"
            variant="primary"
            className="mt-3 w-full"
            onClick={handleCheckout}
            disabled={loading || shippingCost === null}
          >
            {loading ? t("checkoutLoading") : t("checkout")}
          </Button>
          <PaymentMethods className="mt-4" />
        </div>
      </div>
    </div>
  );
}
