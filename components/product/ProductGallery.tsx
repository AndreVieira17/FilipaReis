"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductImage } from "@/lib/types";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [selecionada, setSelecionada] = useState(0);
  const t = useTranslations("product");

  const imagemAtual = images[selecionada]?.url ?? null;

  return (
    <div>
      <ProductMedia src={imagemAtual} alt={alt} priority />

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelecionada(index)}
              aria-label={t("photoAria", { n: index + 1 })}
              aria-current={index === selecionada}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-white transition-colors",
                index === selecionada ? "border-charcoal" : "border-line hover:border-stone"
              )}
            >
              <ProductMedia src={img.url} alt="" className="rounded-none border-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
