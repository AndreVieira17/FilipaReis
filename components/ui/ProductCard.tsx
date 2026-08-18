import Link from "next/link";
import type { ProductWithRelations } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductMedia } from "./ProductMedia";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <Link href={`/loja/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <ProductMedia images={product.images} alt={product.name_pt} />
        </div>
        <WishlistButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name_pt,
            price: product.price,
            image: primaryImage?.url ?? null,
            category: product.category?.name_pt ?? null,
          }}
          className="absolute right-2 top-2"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm text-charcoal transition-colors group-hover:text-clay-dark">
            {product.name_pt}
          </h3>
          {product.category && (
            <p className="mt-0.5 text-xs text-stone">{product.category.name_pt}</p>
          )}
        </div>
        <p className="whitespace-nowrap text-sm text-charcoal">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
