"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortOption } from "@/lib/products";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "price_asc", label: "Preço: menor para maior" },
  { value: "price_desc", label: "Preço: maior para menor" },
];

export function SortSelect({ current }: { current: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-stone">
      Ordenar por
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-line bg-cream px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
