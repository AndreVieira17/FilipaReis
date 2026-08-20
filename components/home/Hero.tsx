import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export async function Hero() {
  const t = await getTranslations("home");

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
      <div className="aspect-[4/5] w-full overflow-hidden rounded-lg">
        <PlaceholderImage className="h-full w-full" label={t("heroImageLabel")} />
      </div>
    </section>
  );
}
