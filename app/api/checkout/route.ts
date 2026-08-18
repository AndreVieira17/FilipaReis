import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items: CheckoutItem[] = Array.isArray(body?.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
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

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    const { data: product } = await supabase
      .from("products")
      .select("id, name_pt, price, is_active, images:product_images(url,is_primary,order_index)")
      .eq("id", item.productId)
      .maybeSingle();

    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: "Um dos produtos no carrinho já não está disponível." },
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
          { error: "Uma das opções escolhidas já não está disponível." },
          { status: 400 }
        );
      }
      unitPrice += Number(variant.price_modifier ?? 0);
      label = [variant.size, variant.color, variant.material].filter(Boolean).join(" / ");
    }

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    shipping_address_collection: { allowed_countries: ["PT"] },
    phone_number_collection: { enabled: true },
    success_url: `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancelado`,
  });

  return NextResponse.json({ url: session.url });
}
