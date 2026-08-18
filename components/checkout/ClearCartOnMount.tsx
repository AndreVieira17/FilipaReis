"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";

export function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  return null;
}
