import type { Metadata } from "next";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A história, técnica e materiais de Filipa Reis.",
};

export default function SobrePage() {
  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: "Sobre" }]} />
      <div className="mx-auto max-w-3xl">
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-clay">Sobre</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
          A história por trás de cada peça
        </h1>

        <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-lg">
          <PlaceholderImage className="h-full w-full" label="Fotografia da Filipa em breve" />
        </div>

        {/*
          PLACEHOLDER — todo o texto abaixo é provisório.
          Substituir pela história real, técnica e materiais da Filipa Reis
          assim que o conteúdo definitivo for fornecido.
        */}
        <div className="prose-content mt-10 space-y-6 text-stone">
          <p>
            <strong className="text-charcoal">[PLACEHOLDER]</strong> Filipa
            Reis começou a trabalhar em artesanato há vários anos, motivada
            pelo gosto de criar peças únicas com as próprias mãos. Substituir
            este parágrafo pela história real: como começou, o que a
            inspirou, e o percurso até hoje.
          </p>
          <h2 className="font-display text-xl text-charcoal">Técnica</h2>
          <p>
            [PLACEHOLDER] Descrever aqui as técnicas artesanais utilizadas —
            por exemplo, tecelagem, modelagem em argila, trabalho em latão,
            entre outras — e o que as torna especiais.
          </p>
          <h2 className="font-display text-xl text-charcoal">Materiais</h2>
          <p>
            [PLACEHOLDER] Descrever os materiais naturais utilizados nas
            peças (ex: latão, pedras naturais, argila, fio encerado) e a
            origem/sustentabilidade dos mesmos.
          </p>
          <h2 className="font-display text-xl text-charcoal">Filosofia</h2>
          <p>
            [PLACEHOLDER] Um parágrafo sobre a filosofia do trabalho: o
            porquê de cada peça ser feita à mão, devagar, e o que isso
            representa para a marca Filipa Reis.
          </p>
        </div>
      </div>
    </div>
  );
}
