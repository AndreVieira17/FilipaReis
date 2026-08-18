"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { ProductVariant, ProductWithRelations } from "@/lib/types";
import { formatPrice, variantLabel } from "@/lib/utils";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function AddToCartForm({ product }: { product: ProductWithRelations }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant: ProductVariant | null =
    product.variants.find((v) => v.id === variantId) ?? null;

  const unitPrice = product.price + (selectedVariant?.price_modifier ?? 0);
  const stock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const outOfStock = stock <= 0;
  const requiresVariant = product.variants.length > 0 && !selectedVariant;

  const primaryImage = useMemo(
    () => product.images.find((i) => i.is_primary) ?? product.images[0] ?? null,
    [product.images]
  );

  function handleAdd() {
    if (requiresVariant || outOfStock) return;

    addItem(
      {
        key: `${product.id}:${selectedVariant?.id ?? "default"}`,
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        slug: product.slug,
        name: product.name_pt,
        variantLabel: selectedVariant ? variantLabel(selectedVariant) : null,
        unitPrice,
        image: primaryImage?.url ?? null,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mt-6">
      <p className="text-xl text-charcoal">{formatPrice(unitPrice)}</p>

      {product.variants.length > 0 && (
        <div className="mt-6">
          <label htmlFor="variant" className="mb-1.5 block text-xs text-stone">
            Opção
          </label>
          <select
            id="variant"
            value={variantId ?? ""}
            onChange={(e) => setVariantId(e.target.value || null)}
            className="w-full max-w-xs rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                {variantLabel(v)} {v.stock_quantity <= 0 ? "— esgotado" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {outOfStock ? (
        <p className="mt-6 text-sm text-stone">Esgotado de momento.</p>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <QuantitySelector quantity={quantity} onChange={setQuantity} max={stock} />
          <Button onClick={handleAdd} variant="primary" disabled={requiresVariant}>
            {added ? (
              <>
                <Check className="h-4 w-4" /> Adicionado
              </>
            ) : (
              "Adicionar ao carrinho"
            )}
          </Button>
        </div>
      )}

      {product.is_personalizable && product.personalization_note_pt && (
        <p className="mt-4 text-xs text-stone">{product.personalization_note_pt}</p>
      )}
    </div>
  );
}
