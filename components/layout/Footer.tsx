import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { TrustBadges } from "@/components/ui/TrustBadges";

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="container-app border-b border-line py-6">
        <TrustBadges />
      </div>
      <div className="container-app grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-lg text-charcoal">Filipa Reis</h2>
          <p className="mt-3 max-w-xs text-sm text-stone">
            Peças de artesanato feitas à mão, uma a uma, com materiais
            naturais.
          </p>
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
          <h3 className="text-sm text-charcoal">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone">
            <li><Link href="/loja" className="hover:text-charcoal">Loja</Link></li>
            <li><Link href="/sobre" className="hover:text-charcoal">Sobre</Link></li>
            <li><Link href="/contacto" className="hover:text-charcoal">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm text-charcoal">Informação</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone">
            <li><Link href="/politica-envio-devolucao" className="hover:text-charcoal">Envios &amp; Devoluções</Link></li>
            <li><Link href="/termos" className="hover:text-charcoal">Termos &amp; Condições</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <p className="container-app text-center text-xs text-stone">
          © {new Date().getFullYear()} Filipa Reis. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
