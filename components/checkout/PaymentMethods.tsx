"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Nota: mostra apenas um selo genérico de "pagamento seguro via Stripe",
 * sem listar métodos específicos (Visa/Mastercard/Apple Pay/...) porque
 * não temos visibilidade sobre quais estão realmente ativados na conta
 * Stripe em uso — evita prometer métodos que podem não estar disponíveis.
 */
export function PaymentMethods({ className }: { className?: string }) {
  const t = useTranslations("checkout");

  return (
    <div className={cn("flex items-center justify-center gap-2 text-xs text-stone", className)}>
      <CreditCard className="h-4 w-4" strokeWidth={1.5} />
      <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
      <span>{t("securePayment")}</span>
    </div>
  );
}
