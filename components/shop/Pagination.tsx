import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const t = await getTranslations("shop");

  return (
    <nav
      aria-label={t("paginationAria")}
      className="mt-16 flex items-center justify-center gap-4"
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          aria-label={t("paginationPrev")}
          className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-charcoal transition-colors hover:border-charcoal"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> {t("paginationPrev")}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-stone/50">
          <ChevronLeft className="h-3.5 w-3.5" /> {t("paginationPrev")}
        </span>
      )}

      <span className="text-xs text-stone">
        {t("paginationPage", { page, totalPages })}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          aria-label={t("paginationNext")}
          className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-charcoal transition-colors hover:border-charcoal"
        >
          {t("paginationNext")} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-stone/50">
          {t("paginationNext")} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
