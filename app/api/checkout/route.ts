import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import {
  totalWeightGrams,
  resolveShippingCost,
  SHIPPING_COUNTRIES,
  type ShippingRegion,
} from "@/lib/shipping";

type CheckoutItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

const VALID_REGIONS: ShippingRegion[] = ["continental", "acores", "madeira", "ue"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];
  const shippingRegion: ShippingRegion = VALID_REGIONS.includes(body?.shippingRegion)
    ? body.shippingRegion
    : "continental";

  if (items.length === 0) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const line_items: Array<{
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: {
        name: string;
        images?: string[];
        metadata: Record<string, string>;
      };
    };
  }> = [];

  let subtotal = 0;
  const weightItems: { weightGrams: number | null; quantity: number }[] = [];

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    const { data: product } = await supabase
      .from("products")
      .select("id, name_pt, price, is_active, weight_grams, images:product_images(url,is_primary,order_index)")
      .eq("id", item.productId)
      .maybeSingle();

    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: "PRODUCT_UNAVAILABLE" },
        { status: 400 }
      );
    }

    let unitPrice = Number(product.price);
    let label: string | null = null;

    if (item.variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("*")
        .eq("id", item.variantId)
        .maybeSingle();

      if (!variant || !variant.is_active) {
        return NextResponse.json(
          { error: "VARIANT_UNAVAILABLE" },
          { status: 400 }
        );
      }
      unitPrice += Number(variant.price_modifier ?? 0);
      label = [variant.size, variant.color, variant.material].filter(Boolean).join(" / ");
    }

    subtotal += unitPrice * quantity;
    weightItems.push({ weightGrams: product.weight_grams, quantity });

    const images = (product.images ?? []) as Array<{
      url: string;
      is_primary: boolean;
      order_index: number;
    }>;
    const primaryImage = images.find((i) => i.is_primary) ?? images[0];

    line_items.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: label ? `${product.name_pt} (${label})` : product.name_pt,
          images: primaryImage ? [primaryImage.url] : undefined,
          metadata: {
            product_id: product.id,
            variant_id: item.variantId ?? "",
          },
        },
      },
    });
  }

  const weightGrams = totalWeightGrams(weightItems);
  const shippingCost = resolveShippingCost(shippingRegion, weightGrams, subtotal);

  if (shippingCost === null) {
    return NextResponse.json(
      { error: "SHIPPING_UNAVAILABLE" },
      { status: 400 }
    );
  }

  const tShipping = await getTranslations("shipping");

  line_items.push({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(shippingCost * 100),
      product_data: {
        name: tShipping("lineItemLabel", { region: tShipping(shippingRegion) }),
        metadata: { is_shipping: "true" },
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Utilizador autenticado (opcional) — se existir, a encomenda fica
  // associada à conta; caso contrário segue como checkout de convidado.
  const supabaseAuth = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    client_reference_id: user?.id,
    customer_email: user?.email,
    shipping_address_collection: {
      allowed_countries: SHIPPING_COUNTRIES[
        shippingRegion
      ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    phone_number_collection: { enabled: true },
    success_url: `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancelado`,
  });

  return NextResponse.json({ url: session.url });
}
