import Link from "next/link";
import { Truck, RotateCcw } from "lucide-react";

export function ShippingInfo() {
  return (
    <div className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-stone">
      {/* PLACEHOLDER — prazos, custos e zonas de envio reais (ver /politica-envio-devolucao) */}
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-clay" strokeWidth={1.5} />
        <p>
          Envio cuidado, embalado à mão.{" "}
          <Link
            href="/politica-envio-devolucao"
            className="underline underline-offset-2 transition-colors hover:text-charcoal"
          >
            Ver prazos e custos
          </Link>
        </p>
      </div>
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-clay" strokeWidth={1.5} />
        <p>
          Devoluções fáceis.{" "}
          <Link
            href="/politica-envio-devolucao"
            className="underline underline-offset-2 transition-colors hover:text-charcoal"
          >
            Ver política
          </Link>
        </p>
      </div>
    </div>
  );
}
