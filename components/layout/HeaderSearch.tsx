"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations("header");

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/loja?q=${encodeURIComponent(q)}` : "/loja");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeSearch") : t("openSearch")}
        aria-expanded={open}
        className="p-2 text-charcoal"
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Search className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-30 mt-2 w-[min(90vw,320px)] origin-top-right rounded-lg border border-line bg-cream p-2 shadow-lg transition-all duration-150",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-md border border-line bg-cream px-3 py-2 text-sm text-charcoal placeholder:text-stone/60 focus:outline-none focus:ring-1 focus:ring-clay"
          />
        </form>
      </div>
    </div>
  );
}
