import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "As peças que guardaste para mais tarde.",
};

export default function FavoritosPage() {
  return (
    <>
      <div className="container-app pt-6">
        <Breadcrumbs items={[{ label: "Favoritos" }]} />
      </div>
      <WishlistClient />
    </>
  );
}
