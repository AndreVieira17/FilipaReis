import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ui/ProductCard";
import type { ProductWithRelations } from "@/lib/types";

export async function ProductSection({
  title,
  products,
}: {
  title: string;
  products: ProductWithRelations[];
}) {
  if (products.length === 0) return null;

  const t = await getTranslations("common");

  return (
    <section className="container-app py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-2xl text-charcoal">{title}</h2>
        <Link href="/loja" className="text-sm text-stone hover:text-charcoal">
          {t("viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
