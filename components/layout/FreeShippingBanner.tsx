import { getTranslations } from "next-intl/server";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export async function FreeShippingBanner() {
  const t = await getTranslations("shippingBanner");

  return (
    <div className="bg-charcoal py-2 text-center text-xs tracking-wide text-cream">
      {t("freeAbove", { threshold: formatPrice(FREE_SHIPPING_THRESHOLD) })}
    </div>
  );
}
