"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");

  function handleSelect(next: Locale) {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("languageAria")}
        aria-expanded={open}
        className="rounded-full p-2 text-charcoal transition-colors hover:bg-sand"
      >
        <Globe className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-30 mt-2 w-36 origin-top-right rounded-lg border border-line bg-cream p-1 shadow-lg transition-all duration-150",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => handleSelect(l)}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-sand",
              l === locale ? "font-medium text-charcoal" : "text-stone"
            )}
          >
            {localeNames[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
