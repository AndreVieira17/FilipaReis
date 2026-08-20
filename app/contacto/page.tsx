import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Fala connosco por email, WhatsApp ou Instagram.",
};

export default async function ContactoPage() {
  const t = await getTranslations("contact");

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("eyebrow") }]} />
      <div className="mx-auto mt-6 grid max-w-3xl gap-12 sm:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl text-charcoal">{t("title")}</h1>
          <p className="mt-4 text-sm text-stone">{t("intro")}</p>

          {/* PLACEHOLDER — confirmar/atualizar contactos reais */}
          <ul className="mt-8 space-y-4 text-sm">
            <li>
              <a href="mailto:ola@filipareis.pt" className="flex items-center gap-3 text-charcoal hover:text-clay">
                <Mail className="h-4 w-4" strokeWidth={1.5} /> ola@filipareis.pt
              </a>
            </li>
            <li>
              <a href="https://wa.me/351900000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-charcoal hover:text-clay">
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-charcoal hover:text-clay">
                <InstagramIcon className="h-4 w-4" /> @filipareis
              </a>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
