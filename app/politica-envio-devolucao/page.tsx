import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envios & Devoluções",
};

export default function PoliticaEnvioDevolucaoPage() {
  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-charcoal">Envios &amp; Devoluções</h1>
        {/* PLACEHOLDER — substituir por política real de envio e devolução */}
        <div className="mt-8 space-y-6 text-sm text-stone">
          <section>
            <h2 className="font-display text-lg text-charcoal">Envios</h2>
            <p className="mt-2">
              [PLACEHOLDER] Indicar prazos de envio, transportadora utilizada,
              custos de portes e zonas cobertas (ex: Portugal Continental,
              Ilhas, Internacional).
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg text-charcoal">Devoluções</h2>
            <p className="mt-2">
              [PLACEHOLDER] Indicar prazo legal de devolução (ex: 14 dias),
              condições em que o produto pode ser devolvido, e processo para
              solicitar a devolução ou troca.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
