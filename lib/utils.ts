import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductImage } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function primaryImageUrl(images: ProductImage[]): string | null {
  return (images.find((i) => i.is_primary) ?? images[0])?.url ?? null;
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function variantLabel(v: { size?: string | null; color?: string | null; material?: string | null }) {
  return [v.size, v.color, v.material].filter(Boolean).join(" / ");
}
