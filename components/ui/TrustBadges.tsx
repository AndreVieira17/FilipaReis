import { Sparkles, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Sparkles, label: "Feito à mão" },
  { icon: Truck, label: "Envio cuidado" },
  { icon: RotateCcw, label: "Devoluções fáceis" },
  { icon: ShieldCheck, label: "Pagamento seguro" },
];

export function TrustBadges({ className }: { className?: string }) {
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
