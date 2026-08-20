import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default async function RegistarPage() {
  const t = await getTranslations("auth");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("myAccount"), href: "/conta" }, { label: t("signupTitle") }]} />
      <div className="mx-auto mt-10 max-w-sm">
        <h1 className="text-center font-display text-2xl text-charcoal">{t("signupTitle")}</h1>
        <div className="mt-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
