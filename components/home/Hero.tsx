import { LinkButton } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function Hero() {
  return (
    <section className="container-app grid gap-8 py-12 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-clay">
          Feito à mão, com tempo
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-charcoal sm:text-5xl">
          Peças únicas, moldadas à mão por Filipa Reis
        </h1>
        <p className="mt-5 max-w-md text-balance text-stone">
          {/* PLACEHOLDER — substituir por frase de efeito definitiva */}
          Cada peça nasce devagar, com materiais naturais e um processo
          inteiramente artesanal — para durar e para contar uma história única.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/loja" variant="primary">
            Ver a loja
          </LinkButton>
          <LinkButton href="/sobre" variant="secondary">
            Conhecer a história
          </LinkButton>
        </div>
      </div>
      <div className="aspect-[4/5] w-full overflow-hidden rounded-lg">
        <PlaceholderImage className="h-full w-full" label="Fotografia principal em breve" />
      </div>
    </section>
  );
}
