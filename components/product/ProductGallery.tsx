"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductImage } from "@/lib/types";
import { ProductMedia } from "@/components/ui/ProductMedia";
import { cn } from "@/lib/utils";

const LIMIAR_SWIPE_PX = 40;

export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [selecionada, setSelecionada] = useState(0);
  const t = useTranslations("product");
  const inicioToqueX = useRef<number | null>(null);

  const imagemAtual = images[selecionada]?.url ?? null;
  const temVariasImagens = images.length > 1;

  function irPara(index: number) {
    setSelecionada((index + images.length) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    inicioToqueX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (inicioToqueX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - inicioToqueX.current;
    inicioToqueX.current = null;
    if (Math.abs(deltaX) < LIMIAR_SWIPE_PX) return;
    irPara(selecionada + (deltaX < 0 ? 1 : -1));
  }

  return (
    <div>
      <div
        className="relative"
        onTouchStart={temVariasImagens ? handleTouchStart : undefined}
        onTouchEnd={temVariasImagens ? handleTouchEnd : undefined}
      >
        <ProductMedia src={imagemAtual} alt={alt} priority />

        {temVariasImagens && (
          <>
            <button
              type="button"
              onClick={() => irPara(selecionada - 1)}
              aria-label={t("prevPhotoAria")}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-sm backdrop-blur transition-colors hover:bg-cream"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => irPara(selecionada + 1)}
              aria-label={t("nextPhotoAria")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-2 text-charcoal shadow-sm backdrop-blur transition-colors hover:bg-cream"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {temVariasImagens && (
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
