import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sessão",
};

export default async function EntrarPage() {
  const t = await getTranslations("auth");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("myAccount"), href: "/conta" }, { label: t("loginTitle") }]} />
      <div className="mx-auto mt-10 max-w-sm">
        <h1 className="text-center font-display text-2xl text-charcoal">{t("loginTitle")}</h1>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
