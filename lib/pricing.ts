/**
 * Toda a matemática de dinheiro (somar preços, calcular totais) deve passar
 * por estas duas funções, tanto no site como na rota de checkout — nunca
 * somar valores em euros diretamente (`0.1 + 0.2` em JavaScript não dá
 * exatamente `0.3`). Trabalhando sempre em cêntimos (números inteiros)
 * garantimos que o total mostrado ao cliente é sempre exatamente igual ao
 * valor cobrado na Stripe, até ao cêntimo.
 */

/** Converte um valor em euros (ex: 24.9) para cêntimos inteiros (2490). */
export function euroParaCentimos(euros: number): number {
  return Math.round(euros * 100);
}

/** Converte cêntimos inteiros (2490) de volta para euros (24.9). */
export function centimosParaEuro(centimos: number): number {
  return centimos / 100;
}
