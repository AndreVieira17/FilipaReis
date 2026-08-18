import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { ProductCard } from "@/components/ui/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ShippingInfo } from "@/components/product/ShippingInfo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name_pt,
    description: product.description_pt ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id);
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <div className="container-app py-12">
      <Breadcrumbs
        items={[
          { label: "Loja", href: "/loja" },
          ...(product.category
            ? [{ label: product.category.name_pt, href: `/loja?categoria=${product.category.slug}` }]
            : []),
          { label: product.name_pt },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <ProductMedia images={product.images} alt={product.name_pt} priority />
          <WishlistButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name_pt,
              price: product.price,
              image: primaryImage?.url ?? null,
              category: product.category?.name_pt ?? null,
            }}
            className="absolute right-3 top-3"
          />
        </div>

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-[0.15em] text-clay">
              {product.category.name_pt}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl text-charcoal">{product.name_pt}</h1>
          {product.description_pt && (
            <p className="mt-4 text-stone">{product.description_pt}</p>
          )}

          <AddToCartForm product={product} />
          <ShippingInfo />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-2xl text-charcoal">
            Também pode gostar
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
