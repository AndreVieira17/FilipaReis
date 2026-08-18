import type { Metadata } from "next";
import { CarrinhoClient } from "@/components/cart/CarrinhoClient";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revê os artigos no teu carrinho antes de finalizar a compra.",
};

export default function CarrinhoPage() {
  return <CarrinhoClient />;
}
