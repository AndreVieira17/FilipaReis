import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export async function AboutPreview() {
  const t = await getTranslations("home");

  return (
    <section className="bg-sand">
      <div className="container-app grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="aspect-square w-full overflow-hidden rounded-lg lg:order-2">
          <PlaceholderImage className="h-full w-full" label={t("aboutImageLabel")} />
        </div>
        <div className="lg:order-1">
          <h2 className="font-display text-2xl text-charcoal">{t("aboutTitle")}</h2>
          <p className="mt-4 max-w-md text-stone">{t("aboutText")}</p>
          <Link
            href="/sobre"
            className="mt-6 inline-block text-sm text-charcoal underline underline-offset-4"
          >
            {t("aboutLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
