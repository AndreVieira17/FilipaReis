import { getTranslations } from "next-intl/server";
import { ProductSection } from "./ProductSection";
import { getFeaturedProducts, getNewestProducts, getBestSellingProducts } from "@/lib/products";

export async function ProductRails() {
  const [featured, newest, bestSelling, t] = await Promise.all([
    getFeaturedProducts(4),
    getNewestProducts(4),
    getBestSellingProducts(4),
    getTranslations("home"),
  ]);

  const hasAny = featured.length > 0 || newest.length > 0 || bestSelling.length > 0;

  if (!hasAny) {
    return (
      <section className="container-app py-16">
        <p className="text-sm text-stone">{t("noProducts")}</p>
      </section>
    );
  }

  return (
    <>
      <ProductSection title={t("featured")} products={featured} />
      <ProductSection title={t("newest")} products={newest} />
      <ProductSection title={t("bestSelling")} products={bestSelling} />
    </>
  );
}
