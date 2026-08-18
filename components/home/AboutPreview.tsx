import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function AboutPreview() {
  return (
    <section className="bg-sand">
      <div className="container-app grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="aspect-square w-full overflow-hidden rounded-lg lg:order-2">
          <PlaceholderImage className="h-full w-full" label="Fotografia da artesã em breve" />
        </div>
        <div className="lg:order-1">
          <h2 className="font-display text-2xl text-charcoal">A mão por trás das peças</h2>
          <p className="mt-4 max-w-md text-stone">
            {/* PLACEHOLDER — substituir por texto real sobre a Filipa */}
            Filipa Reis dedica-se ao artesanato há vários anos, trabalhando
            materiais naturais com técnicas tradicionais. Cada peça é
            pensada e feita à mão, uma de cada vez.
          </p>
          <Link
            href="/sobre"
            className="mt-6 inline-block text-sm text-charcoal underline underline-offset-4"
          >
            Conhecer a história completa
          </Link>
        </div>
      </div>
    </section>
  );
}
