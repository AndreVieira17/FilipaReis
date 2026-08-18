"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartButton } from "./CartButton";
import { WishlistIcon } from "./WishlistIcon";
import { HeaderSearch } from "./HeaderSearch";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-wide text-charcoal">
          Filipa Reis
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-charcoal/80 transition-colors hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <HeaderSearch />
          <WishlistIcon />
          <CartButton />
          <button
            type="button"
            aria-label="Abrir menu"
            className="p-2 text-charcoal md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "overflow-hidden border-t border-line bg-cream transition-[max-height] duration-300 md:hidden",
          menuOpen ? "max-h-60" : "max-h-0 border-t-0"
        )}
      >
        <div className="container-app flex flex-col py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-charcoal/80"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
