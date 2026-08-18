import { ProductSection } from "./ProductSection";
import { getFeaturedProducts, getNewestProducts, getBestSellingProducts } from "@/lib/products";

export async function ProductRails() {
  const [featured, newest, bestSelling] = await Promise.all([
    getFeaturedProducts(4),
    getNewestProducts(4),
    getBestSellingProducts(4),
  ]);

  const hasAny = featured.length > 0 || newest.length > 0 || bestSelling.length > 0;

  if (!hasAny) {
    return (
      <section className="container-app py-16">
        <p className="text-sm text-stone">Ainda sem produtos disponíveis.</p>
      </section>
    );
  }

  return (
    <>
      <ProductSection title="Em destaque" products={featured} />
      <ProductSection title="Novidades" products={newest} />
      <ProductSection title="Mais vendidos" products={bestSelling} />
    </>
  );
}
