import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Envios & Devoluções",
};

export default async function PoliticaEnvioDevolucaoPage() {
  const t = await getTranslations("footer");
  const tLegal = await getTranslations("legal");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("shippingReturns") }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-charcoal">{t("shippingReturns")}</h1>
        <div className="mt-8 space-y-6 text-sm text-stone">
          <section>
            <h2 className="font-display text-lg text-charcoal">{tLegal("shippingSectionTitle")}</h2>
            <p className="mt-2">{tLegal("shippingText")}</p>
          </section>
          <section>
            <h2 className="font-display text-lg text-charcoal">{tLegal("returnsSectionTitle")}</h2>
            <p className="mt-2">{tLegal("returnsText")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
