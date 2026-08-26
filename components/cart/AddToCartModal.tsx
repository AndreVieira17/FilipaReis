"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart-store";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DURACAO_TRANSICAO_MS = 200;

export function AddToCartModal() {
  const lastAdded = useCartStore((s) => s.lastAdded);
  const clearLastAdded = useCartStore((s) => s.clearLastAdded);
  const t = useTranslations("cart");
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (lastAdded) {
      // setTimeout (em vez de requestAnimationFrame) para garantir que o
      // browser já pintou o estado inicial (fechado) antes de mudarmos
      // para o estado aberto — é essa mudança, num frame seguinte, que
      // a transição de CSS anima.
      const id = setTimeout(() => setVisivel(true), 10);
      return () => clearTimeout(id);
    }
    setVisivel(false);
  }, [lastAdded]);

  useEffect(() => {
    if (!lastAdded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAdded]);

  function fechar() {
    setVisivel(false);
    setTimeout(clearLastAdded, DURACAO_TRANSICAO_MS);
  }

  if (!lastAdded) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className={cn(
          "absolute inset-0 bg-charcoal/40 transition-opacity duration-200",
          visivel ? "opacity-100" : "opacity-0"
        )}
        onClick={fechar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("addedTitle")}
        className={cn(
          "relative w-full max-w-sm rounded-lg bg-cream p-6 shadow-xl transition-all duration-200",
          visivel ? "translate-y-0 opacity-100 scale-100" : "translate-y-2 opacity-0 scale-95"
        )}
      >
        <button
          type="button"
          onClick={fechar}
          aria-label={t("closeModal")}
          className="absolute right-3 top-3 rounded-full p-1.5 text-stone transition-colors hover:bg-sand hover:text-charcoal"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-4">
          <ProductMedia src={lastAdded.image} alt={lastAdded.name} className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-sm text-charcoal">{t("addedTitle")}</p>
            <p className="mt-0.5 text-sm text-stone">{lastAdded.name}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/loja" variant="secondary" className="flex-1" onClick={fechar}>
            {t("continueShopping")}
          </LinkButton>
          <LinkButton href="/carrinho" variant="primary" className="flex-1" onClick={fechar}>
            {t("viewCart")}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
