import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/Button";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { getNewestProducts } from "@/lib/products";
import { primaryImageUrl } from "@/lib/utils";

export async function Hero() {
  const t = await getTranslations("home");
  const [produtoDestaque] = await getNewestProducts(1);
  const imagemDestaque = produtoDestaque ? primaryImageUrl(produtoDestaque.images) : null;

  return (
    <section className="container-app grid gap-8 py-12 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-clay">
          {t("heroEyebrow")}
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-charcoal sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-md text-balance text-stone">
          {t("heroText")}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/loja" variant="primary">
            {t("heroCtaShop")}
          </LinkButton>
          <LinkButton href="/sobre" variant="secondary">
            {t("heroCtaAbout")}
          </LinkButton>
        </div>
      </div>
      {produtoDestaque ? (
        <Link
          href={`/loja/${produtoDestaque.slug}`}
          className="aspect-[4/5] w-full overflow-hidden rounded-lg"
        >
          <ProductMedia
            src={imagemDestaque}
            alt={produtoDestaque.name_pt}
            imageClassName="p-0"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </Link>
      ) : (
        <div className="aspect-[4/5] w-full overflow-hidden rounded-lg">
          <ProductMedia src={null} alt="" placeholderLabel={t("heroImageLabel")} />
        </div>
      )}
    </section>
  );
}
