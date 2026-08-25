/**
 * Cálculo de portes de envio — baseado no Tarifário CTT 2026
 * (https://www.ctt.pt/application/themes/pdfs/tarifario_2026_MSV4_16_01.pdf,
 * em vigor desde 3 de fevereiro de 2026), lido diretamente do PDF oficial.
 *
 * Serviço usado (o mais económico com rastreio, "Pacote Postal — bens e
 * documentos", preços com IVA):
 * - Portugal Continental / Açores / Madeira: "Correio Registado" nacional.
 *   Este serviço tem preço ÚNICO em todo o território nacional — não há
 *   diferença entre Continente e Ilhas (ao contrário da "Encomenda Postal
 *   Nacional", que tem zonas separadas mas é um serviço bem mais caro).
 *   Escalões "Pacote Postal (bens e documentos)": até 500g = 4,60€;
 *   501g–2000g = 5,40€. Sem escalão acima de 2kg neste serviço.
 * - União Europeia: "Correio Azul Internacional", zona Europa, "Pacote
 *   Postal (bens e documentos)". IMPORTANTE: desde 2026 o "Correio
 *   Registado Internacional" deixou de aceitar mercadorias (só
 *   documentos), por nova regra da União Postal Universal — por isso não
 *   pode ser usado para as peças. O Correio Azul Internacional é a
 *   alternativa mais barata que ainda aceita bens.
 *   Escalões "Pacote Postal (bens e documentos)", zona Europa: até 1000g
 *   = 5,18€; 1001g–2000g = 6,53€; 2001g–5000g = 8,70€ (valor aproximado
 *   para o escalão seguinte, a confirmar para encomendas muito pesadas).
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

// Correio Registado nacional — preço único, igual para Continente e Ilhas.
const CORREIO_REGISTADO_NACIONAL: WeightBracket[] = [
  { maxGrams: 500, price: 4.6 },
  { maxGrams: 2000, price: 5.4 },
];

const RATES: Record<ShippingRegion, WeightBracket[]> = {
  continental: CORREIO_REGISTADO_NACIONAL,
  acores: CORREIO_REGISTADO_NACIONAL,
  madeira: CORREIO_REGISTADO_NACIONAL,
  ue: [
    { maxGrams: 1000, price: 5.18 },
    { maxGrams: 2000, price: 6.53 },
    { maxGrams: 5000, price: 8.7 },
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
