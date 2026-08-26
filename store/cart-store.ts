import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";
import { centimosParaEuro, euroParaCentimos } from "@/lib/pricing";

type LastAddedItem = { name: string; image: string | null };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  lastAdded: LastAddedItem | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setHasHydrated: (value: boolean) => void;
  clearLastAdded: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      lastAdded: null,
      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.key === item.key);
        if (existing) {
          set({
            items: items.map((i) =>
              i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
        // O popup de confirmação (AddToCartModal) é quem reage a isto —
        // já não abrimos automaticamente o painel lateral do carrinho.
        set({ lastAdded: { name: item.name, image: item.image } });
      },
      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearLastAdded: () => set({ lastAdded: null }),
    }),
    {
      name: "filipa-reis-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useCartHasHydrated() {
  return useCartStore((s) => s.hasHydrated);
}

export function useCartCount() {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartSubtotal() {
  return useCartStore((s) =>
    centimosParaEuro(
      s.items.reduce((somaCentimos, i) => somaCentimos + euroParaCentimos(i.unitPrice) * i.quantity, 0)
    )
  );
}
