import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts(4);

  return (
    <section className="container-app py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-2xl text-charcoal">Em destaque</h2>
        <Link href="/loja" className="text-sm text-stone hover:text-charcoal">
          Ver tudo →
        </Link>
      </div>

      {featured.length === 0 ? (
        <p className="text-sm text-stone">Ainda sem produtos em destaque.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
