import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Termos & Condições",
};

export default async function TermosPage() {
  const t = await getTranslations("footer");
  const tLegal = await getTranslations("legal");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("terms") }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-charcoal">{t("terms")}</h1>
        <div className="mt-8 space-y-6 text-sm text-stone">
          <p>{tLegal("termsText")}</p>
        </div>
      </div>
    </div>
  );
}
