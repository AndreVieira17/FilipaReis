"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";

export function AccountIcon() {
  const t = useTranslations("auth");

  return (
    <Link
      href="/conta"
      aria-label={t("accountAria")}
      className="rounded-full p-2 text-charcoal transition-colors hover:bg-sand"
    >
      <User className="h-5 w-5" strokeWidth={1.5} />
    </Link>
  );
}
