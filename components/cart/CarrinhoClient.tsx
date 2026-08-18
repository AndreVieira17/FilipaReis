"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import {
  useCartStore,
  useCartSubtotal,
  useCartHasHydrated,
} from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Button, LinkButton } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export function CarrinhoClient() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const hasHydrated = useCartHasHydrated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Não foi possível iniciar o pagamento.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setLoading(false);
    }
  }

  if (!hasHydrated) {
    return <div className="container-app py-24" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-12">
        <Breadcrumbs items={[{ label: "Carrinho" }]} />
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <ShoppingBag className="h-10 w-10 text-stone" strokeWidth={1.5} />
          <h1 className="font-display text-2xl text-charcoal">O teu carrinho está vazio</h1>
          <LinkButton href="/loja" variant="primary">Ver a loja</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: "Carrinho" }]} />
      <h1 className="mt-6 font-display text-3xl text-charcoal">Carrinho</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-16">
        <ul className="divide-y divide-line lg:col-span-2">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-6 first:pt-0">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage className="h-full w-full" />
                )}
              </div>
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
                    aria-label={`Remover ${item.name}`}
                    className="text-stone hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      className="p-2.5 text-charcoal disabled:opacity-30"
                      disabled={item.quantity <= 1}
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      className="p-2.5 text-charcoal"
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone">Subtotal</span>
            <span className="text-charcoal">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-stone">Envio calculado no checkout.</p>
          {error && <p className="mt-3 text-xs text-clay-dark">{error}</p>}
          <Button
            type="button"
            variant="primary"
            className="mt-6 w-full"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "A abrir pagamento..." : "Finalizar compra"}
          </Button>
        </div>
      </div>
    </div>
  );
}
