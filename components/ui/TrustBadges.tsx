import { Sparkles, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function TrustBadges({ className }: { className?: string }) {
  const t = await getTranslations("trust");

  const badges = [
    { icon: Sparkles, label: t("handmade") },
    { icon: Truck, label: t("shipping") },
    { icon: RotateCcw, label: t("returns") },
    { icon: ShieldCheck, label: t("payment") },
  ];

  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-3", className)}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-xs text-stone">
          <Icon className="h-4 w-4 text-clay" strokeWidth={1.5} />
          {label}
        </li>
      ))}
    </ul>
  );
}
