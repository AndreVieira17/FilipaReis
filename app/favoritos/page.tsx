import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "As peças que guardaste para mais tarde.",
};

export default async function FavoritosPage() {
  const t = await getTranslations("wishlist");

  return (
    <>
      <div className="container-app pt-6">
        <Breadcrumbs items={[{ label: t("title") }]} />
      </div>
      <WishlistClient />
    </>
  );
}
