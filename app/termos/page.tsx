import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Termos & Condições",
};

export default function TermosPage() {
  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: "Termos & Condições" }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-charcoal">Termos &amp; Condições</h1>
        {/* PLACEHOLDER — substituir por termos e condições reais, idealmente revistos juridicamente */}
        <div className="mt-8 space-y-6 text-sm text-stone">
          <p>
            [PLACEHOLDER] Este texto é provisório. Antes de colocar o site em
            produção, substituir por termos e condições reais que cubram:
            identificação da empresa/vendedora, condições de venda, preços e
            pagamento, propriedade intelectual, e resolução de litígios.
          </p>
        </div>
      </div>
    </div>
  );
}
