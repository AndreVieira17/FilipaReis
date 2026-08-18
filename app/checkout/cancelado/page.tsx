import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Compra cancelada",
};

export default function CheckoutCanceladoPage() {
  return (
    <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
      <XCircle className="h-10 w-10 text-stone" strokeWidth={1.5} />
      <h1 className="font-display text-3xl text-charcoal">Compra cancelada</h1>
      <p className="max-w-md text-stone">
        Não te preocupes — nada foi cobrado. O teu carrinho continua guardado.
      </p>
      <LinkButton href="/carrinho" variant="primary">Voltar ao carrinho</LinkButton>
    </div>
  );
}
