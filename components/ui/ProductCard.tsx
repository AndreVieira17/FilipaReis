import Link from "next/link";
import type { ProductWithRelations } from "@/lib/types";
import { primaryImageUrl } from "@/lib/utils";
import { ProductMedia } from "./ProductMedia";
import { WishlistButton } from "./WishlistButton";
import { Price } from "./Price";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = primaryImageUrl(product.images);

  return (
    <Link href={`/loja/${product.slug}`} className="group block">
      <div className="relative">
        <ProductMedia
          src={image}
          alt={product.name_pt}
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          className="shadow-sm transition-shadow duration-300 group-hover:shadow-md"
        />
        <WishlistButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name_pt,
            price: product.price,
            image,
            category: product.category?.name_pt ?? null,
            weightGrams: product.weight_grams,
          }}
          className="absolute right-2 top-2"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-sm text-charcoal transition-colors group-hover:text-clay-dark">
          {product.name_pt}
        </h3>
        <Price price={product.price} className="whitespace-nowrap text-sm text-charcoal" />
      </div>
    </Link>
  );
}
