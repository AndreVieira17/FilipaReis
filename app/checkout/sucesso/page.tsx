import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Encomenda confirmada",
};

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  let email: string | null = null;
  let total: number | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      email = session.customer_details?.email ?? null;
      total = session.amount_total != null ? session.amount_total / 100 : null;
    } catch {
      // sessão inválida ou expirada — mostra confirmação genérica
    }
  }

  return (
    <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle className="h-10 w-10 text-clay" strokeWidth={1.5} />
      <h1 className="font-display text-3xl text-charcoal">Obrigada pela tua compra!</h1>
      <p className="max-w-md text-stone">
        A tua encomenda foi confirmada
        {total != null && <> — total de {formatPrice(total)}</>}.
        {email && <> Enviámos os detalhes para {email}.</>} Cada peça é preparada
        com cuidado antes de seguir para envio.
      </p>
      <LinkButton href="/loja" variant="primary">Continuar a explorar</LinkButton>
    </div>
  );
}
