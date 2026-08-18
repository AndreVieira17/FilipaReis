import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginação"
      className="mt-16 flex items-center justify-center gap-4"
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          aria-label="Página anterior"
          className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-charcoal transition-colors hover:border-charcoal"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Anterior
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-stone/50">
          <ChevronLeft className="h-3.5 w-3.5" /> Anterior
        </span>
      )}

      <span className="text-xs text-stone">
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          aria-label="Página seguinte"
          className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-charcoal transition-colors hover:border-charcoal"
        >
          Seguinte <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-2 text-xs text-stone/50">
          Seguinte <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
