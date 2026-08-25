"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations("breadcrumbs");
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t("backAria")}
        className="-ml-1.5 flex shrink-0 items-center gap-1 rounded-full p-1.5 text-stone transition-colors hover:bg-sand hover:text-charcoal"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <nav aria-label={t("navAria")} className="text-xs text-stone">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-charcoal">
              {t("home")}
            </Link>
          </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-charcoal">
                {item.label}
              </Link>
            ) : (
              <span className="text-charcoal" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
