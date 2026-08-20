import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
  weightGrams: number | null;
};

type WishlistState = {
  items: WishlistItem[];
  hasHydrated: boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  setHasHydrated: (value: boolean) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      toggle: (item) => {
        const items = get().items;
        const exists = items.some((i) => i.productId === item.productId);
        set({
          items: exists
            ? items.filter((i) => i.productId !== item.productId)
            : [...items, item],
        });
      },
      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      isSaved: (productId) => get().items.some((i) => i.productId === productId),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "filipa-reis-wishlist",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useWishlistHasHydrated() {
  return useWishlistStore((s) => s.hasHydrated);
}

export function useWishlistCount() {
  return useWishlistStore((s) => s.items.length);
}
