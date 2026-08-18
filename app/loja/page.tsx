import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SortSelect } from "@/components/shop/SortSelect";
import { Pagination } from "@/components/shop/Pagination";
import { getCategories, getProducts, PRODUCTS_PER_PAGE, type SortOption } from "@/lib/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Loja",
  description: "Todas as peças de artesanato feitas à mão por Filipa Reis.",
};

export const revalidate = 60;

const VALID_SORTS: SortOption[] = ["newest", "price_asc", "price_desc"];

export default async function LojaPage({
  searchParams,
}: {
  searchParams: { categoria?: string; q?: string; sort?: string; page?: string };
}) {
  const categorySlug = searchParams.categoria;
  const query = searchParams.q;
  const sort: SortOption = VALID_SORTS.includes(searchParams.sort as SortOption)
    ? (searchParams.sort as SortOption)
    : "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ products, total }, categories] = await Promise.all([
    getProducts({ categorySlug, query, sort, page }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { categoria: categorySlug, q: query, sort: searchParams.sort, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `/loja?${qs}` : "/loja";
  }

  return (
    <div className="container-app py-12">
      <Breadcrumbs
        items={
          activeCategory
            ? [{ label: "Loja", href: "/loja" }, { label: activeCategory.name_pt }]
            : [{ label: "Loja" }]
        }
      />

      <h1 className="mt-4 font-display text-3xl text-charcoal">
        {activeCategory ? activeCategory.name_pt : "Loja"}
      </h1>
      <p className="mt-2 text-sm text-stone">
        {query && <>Resultados para &quot;{query}&quot; — </>}
        {total} {total === 1 ? "peça disponível" : "peças disponíveis"}
      </p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={buildHref({ categoria: undefined })}
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
              href={buildHref({ categoria: cat.slug })}
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

      <div className="mt-6 flex items-center justify-end border-t border-line pt-4">
        <SortSelect current={sort} />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-stone">
            {query ? "Nenhuma peça encontrada para essa pesquisa." : "Ainda não há produtos disponíveis."}
          </p>
          <p className="text-sm text-stone/70">
            {query ? "Tenta outra palavra-chave." : "Volta em breve para novas peças."}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => buildHref({ page: p > 1 ? String(p) : undefined })}
      />
    </div>
  );
}
