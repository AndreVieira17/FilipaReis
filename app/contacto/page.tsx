import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Fala connosco por email, WhatsApp ou Instagram.",
};

export default function ContactoPage() {
  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: "Contacto" }]} />
      <div className="mx-auto mt-6 grid max-w-3xl gap-12 sm:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Contacto</p>
          <h1 className="mt-2 font-display text-3xl text-charcoal">Fala connosco</h1>
          <p className="mt-4 text-sm text-stone">
            Dúvidas sobre uma peça, encomendas personalizadas ou apenas para
            dizer olá — respondemos assim que possível.
          </p>

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
