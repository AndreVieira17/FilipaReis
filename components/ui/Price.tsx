import { formatPrice, cn } from "@/lib/utils";

/**
 * Componente de preço preparado para mostrar desconto (preço original
 * riscado + preço atual). Não há ainda um campo de "preço original" nos
 * produtos — quando existir, basta passar `compareAtPrice`.
 */
export function Price({
  price,
  compareAtPrice,
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
}) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={hasDiscount ? "text-clay-dark" : undefined}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-xs text-stone line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  );
}
