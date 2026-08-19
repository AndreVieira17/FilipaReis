import Link from "next/link";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { TrustBadges } from "@/components/ui/TrustBadges";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="border-t border-line bg-sand">
      <div className="container-app border-b border-line py-6">
        <TrustBadges />
      </div>
      <div className="container-app grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-lg text-charcoal">Filipa Reis</h2>
          <p className="mt-3 max-w-xs text-sm text-stone">{t("tagline")}</p>
          <div className="mt-4 flex items-center gap-4">
            {/* PLACEHOLDER — atualizar com os links reais das redes sociais */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-charcoal/70 hover:text-charcoal"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-charcoal/70 hover:text-charcoal"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="mailto:ola@filipareis.pt"
              aria-label="Email"
              className="text-charcoal/70 hover:text-charcoal"
            >
              <Mail className="h-4.5 w-4.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-charcoal">{t("navigation")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone">
            <li><Link href="/loja" className="hover:text-charcoal">{tNav("shop")}</Link></li>
            <li><Link href="/sobre" className="hover:text-charcoal">{tNav("about")}</Link></li>
            <li><Link href="/contacto" className="hover:text-charcoal">{tNav("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm text-charcoal">{t("information")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone">
            <li><Link href="/politica-envio-devolucao" className="hover:text-charcoal">{t("shippingReturns")}</Link></li>
            <li><Link href="/termos" className="hover:text-charcoal">{t("terms")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <p className="container-app text-center text-xs text-stone">
          © {new Date().getFullYear()} Filipa Reis. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
