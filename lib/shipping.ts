/**
 * Cálculo de portes de envio — baseado no Tarifário CTT 2026
 * (https://www.ctt.pt/application/themes/pdfs/tarifario_2026_MSV4_16_01.pdf)
 *
 * IMPORTANTE — valores a confirmar:
 * - Portugal Continental usa "Encomenda Postal Nacional, Via Superfície,
 *   Zona T2" (o valor mais alto dos dois escalões T1/T2, para não subcotar
 *   o envio). A Zona real (T1 ou T2) depende do código postal de origem E
 *   destino — ver tabela de zonas do tarifário se quiseres afinar isto.
 * - Açores/Madeira usam "Encomenda Postal Nacional, Via Aérea"
 *   (Continente→Açores = C/A/C, Continente→Madeira = C/M/C).
 * - União Europeia é uma aproximação usando "Correio Normal Internacional,
 *   Pacote Postal, Zona Europa" (serviço mais leve, sem seguro/tracking
 *   dedicado) — para encomendas seguradas/rastreadas o preço real é mais
 *   alto. Ajustar quando confirmares o serviço que vais usar.
 *
 * Todos os valores em euros. Edita livremente — os escalões usam o peso
 * total do carrinho em gramas.
 */

export type ShippingRegion = "continental" | "acores" | "madeira" | "ue";

type WeightBracket = { maxGrams: number; price: number };

/** Portes grátis a partir deste valor de compra (euros). */
export const FREE_SHIPPING_THRESHOLD = 49;

/** Peso assumido (gramas) quando um produto não tem peso definido. */
export const DEFAULT_ITEM_WEIGHT_GRAMS = 50;

const RATES: Record<ShippingRegion, WeightBracket[]> = {
  continental: [
    { maxGrams: 2000, price: 9.6 },
    { maxGrams: 5000, price: 12.1 },
    { maxGrams: 10000, price: 17.6 },
  ],
  acores: [
    { maxGrams: 2000, price: 12.85 },
    { maxGrams: 3000, price: 16.7 },
    { maxGrams: 4000, price: 16.9 },
    { maxGrams: 5000, price: 18.0 },
    { maxGrams: 6000, price: 23.7 },
    { maxGrams: 7000, price: 27.0 },
    { maxGrams: 8000, price: 29.1 },
    { maxGrams: 9000, price: 29.95 },
    { maxGrams: 10000, price: 30.35 },
  ],
  madeira: [
    { maxGrams: 2000, price: 11.8 },
    { maxGrams: 3000, price: 16.15 },
    { maxGrams: 4000, price: 17.15 },
    { maxGrams: 5000, price: 17.85 },
    { maxGrams: 6000, price: 23.5 },
    { maxGrams: 7000, price: 26.4 },
    { maxGrams: 8000, price: 28.4 },
    { maxGrams: 9000, price: 29.25 },
    { maxGrams: 10000, price: 29.9 },
  ],
  ue: [
    { maxGrams: 100, price: 2.65 },
    { maxGrams: 250, price: 4.25 },
    { maxGrams: 500, price: 7.05 },
    { maxGrams: 1000, price: 10.85 },
    { maxGrams: 2000, price: 18.47 },
  ],
};

/** Códigos de país (ISO 3166-1 alpha-2) aceites pelo Stripe Checkout por região. */
export const SHIPPING_COUNTRIES: Record<ShippingRegion, string[]> = {
  continental: ["PT"],
  acores: ["PT"],
  madeira: ["PT"],
  ue: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "SE",
  ],
};

export const REGION_LABELS: Record<ShippingRegion, string> = {
  continental: "Portugal Continental",
  acores: "Açores",
  madeira: "Madeira",
  ue: "União Europeia",
};

/** Soma o peso (gramas) de uma lista de itens do carrinho. */
export function totalWeightGrams(
  items: { weightGrams?: number | null; quantity: number }[]
): number {
  return items.reduce(
    (sum, item) =>
      sum + (item.weightGrams ?? DEFAULT_ITEM_WEIGHT_GRAMS) * item.quantity,
    0
  );
}

/**
 * Calcula o custo de envio para uma região e peso total.
 * Devolve null se o peso exceder o escalão máximo tabelado (nesse caso o
 * envio deve ser tratado manualmente/à parte).
 */
export function calculateShippingCost(
  region: ShippingRegion,
  weightGrams: number
): number | null {
  const brackets = RATES[region];
  const bracket = brackets.find((b) => weightGrams <= b.maxGrams);
  return bracket ? bracket.price : null;
}

/**
 * Custo de envio final, já a aplicar a regra de portes grátis acima do
 * threshold configurado.
 */
export function resolveShippingCost(
  region: ShippingRegion,
  weightGrams: number,
  subtotal: number
): number | null {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return calculateShippingCost(region, weightGrams);
}
