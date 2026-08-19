"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function QuantitySelector({
  quantity,
  onChange,
  max,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
}) {
  const t = useTranslations("cart");

  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        aria-label={t("decrease")}
        className="p-3 text-charcoal disabled:opacity-30"
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
      <button
        type="button"
        aria-label={t("increase")}
        className="p-3 text-charcoal disabled:opacity-30"
        disabled={max !== undefined && quantity >= max}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
