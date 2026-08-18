import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { getCategories, getProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Loja",
  description: "Todas as peças de artesanato feitas à mão por Filipa Reis.",
};

export const revalidate = 60;

export default async function LojaPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const categorySlug = searchParams.categoria;
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug }),
    getCategories(),
  ]);

  return (
    <div className="container-app py-12">
      <h1 className="font-display text-3xl text-charcoal">Loja</h1>
      <p className="mt-2 text-sm text-stone">
        {products.length} {products.length === 1 ? "peça" : "peças"} disponíveis
      </p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/loja"
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-colors",
              !categorySlug
                ? "border-charcoal bg-charcoal text-cream"
                : "border-line text-stone hover:border-charcoal hover:text-charcoal"
            )}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/loja?categoria=${cat.slug}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs transition-colors",
                categorySlug === cat.slug
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-line text-stone hover:border-charcoal hover:text-charcoal"
              )}
            >
              {cat.name_pt}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-stone">Ainda não há produtos disponíveis.</p>
          <p className="text-sm text-stone/70">Volta em breve para novas peças.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
