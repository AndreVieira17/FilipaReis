import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Assinatura de webhook inválida:", err);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionSummary = event.data.object as Stripe.Checkout.Session;

    const session = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
      expand: ["line_items.data.price.product"],
    });

    const supabase = createAdminClient();

    const shippingDetails = session.collected_information?.shipping_details;
    const address = shippingDetails?.address ?? session.customer_details?.address;
    const fullName = shippingDetails?.name ?? session.customer_details?.name ?? "";
    const [firstName, ...rest] = fullName.split(" ");

    const allLineItems = session.line_items?.data ?? [];
    const isShippingLine = (li: Stripe.LineItem) =>
      (li.price?.product as Stripe.Product | undefined)?.metadata?.is_shipping === "true";

    const shippingLine = allLineItems.find(isShippingLine);
    const productLineItems = allLineItems.filter((li) => !isShippingLine(li));
    const shippingCost = (shippingLine?.price?.unit_amount ?? 0) / 100;
    const subtotal = (session.amount_subtotal ?? 0) / 100 - shippingCost;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: `FR-${Date.now()}`,
        user_id: session.client_reference_id || null,
        guest_email: session.customer_details?.email,
        status: "paid",
        shipping_first_name: firstName ?? "",
        shipping_last_name: rest.join(" "),
        shipping_street: address?.line1 ?? "",
        shipping_number: "",
        shipping_postal_code: address?.postal_code ?? "",
        shipping_city: address?.city ?? "",
        shipping_country: address?.country ?? "",
        shipping_phone: session.customer_details?.phone ?? "",
        subtotal,
        shipping_cost: shippingCost,
        total: (session.amount_total ?? 0) / 100,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripe_session_id: session.id,
        payment_method: "card",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Erro ao criar encomenda:", orderError);
      return NextResponse.json({ received: true, warning: "order_insert_failed" });
    }

    for (const li of productLineItems) {
      const product = li.price?.product as Stripe.Product | undefined;
      const productId = product?.metadata?.product_id || null;
      const variantId = product?.metadata?.variant_id || null;

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        variant_id: variantId || null,
        product_name_pt: product?.name ?? "",
        unit_price: (li.price?.unit_amount ?? 0) / 100,
        quantity: li.quantity ?? 1,
        total_price: ((li.price?.unit_amount ?? 0) * (li.quantity ?? 1)) / 100,
        product_image_url: product?.images?.[0] ?? null,
      });

      if (productId) {
        const { data: currentProduct } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .maybeSingle();
        if (currentProduct) {
          await supabase
            .from("products")
            .update({
              stock_quantity: Math.max(0, currentProduct.stock_quantity - (li.quantity ?? 1)),
            })
            .eq("id", productId);
        }
      }

      if (variantId) {
        const { data: currentVariant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", variantId)
          .maybeSingle();
        if (currentVariant) {
          await supabase
            .from("product_variants")
            .update({
              stock_quantity: Math.max(0, currentVariant.stock_quantity - (li.quantity ?? 1)),
            })
            .eq("id", variantId);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
