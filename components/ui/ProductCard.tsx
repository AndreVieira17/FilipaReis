import Link from "next/link";
import type { ProductWithRelations } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductMedia } from "./ProductMedia";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  return (
    <Link href={`/loja/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-md">
        <ProductMedia images={product.images} alt={product.name_pt} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm text-charcoal">{product.name_pt}</h3>
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
