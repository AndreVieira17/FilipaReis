import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-charcoal text-cream hover:bg-clay-dark",
  secondary: "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal hover:text-cream",
  ghost: "bg-transparent text-charcoal hover:bg-sand",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={cn(base, variantClasses[variant], className)} {...props} />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  onClick,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], className)} onClick={onClick}>
      {children}
    </Link>
  );
}
