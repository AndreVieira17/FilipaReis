import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A história, técnica e materiais de Filipa Reis.",
};

export default async function SobrePage() {
  const t = await getTranslations("about");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("eyebrow") }]} />
      <div className="mx-auto max-w-3xl">
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-clay">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
          {t("title")}
        </h1>

        <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-lg">
          <PlaceholderImage className="h-full w-full" label={t("imageLabel")} />
        </div>

        <div className="prose-content mt-10 space-y-6 text-stone">
          <p>{t("introPlaceholder")}</p>
          <h2 className="font-display text-xl text-charcoal">{t("techniqueTitle")}</h2>
          <p>{t("techniquePlaceholder")}</p>
          <h2 className="font-display text-xl text-charcoal">{t("materialsTitle")}</h2>
          <p>{t("materialsPlaceholder")}</p>
          <h2 className="font-display text-xl text-charcoal">{t("philosophyTitle")}</h2>
          <p>{t("philosophyPlaceholder")}</p>
        </div>
      </div>
    </div>
  );
}
