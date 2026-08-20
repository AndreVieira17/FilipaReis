import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "A minha conta",
};

const STATUS_LABELS_PT: Record<string, string> = {
  pending: "Pendente",
  paid: "Paga",
  shipped: "Enviada",
  delivered: "Entregue",
  cancelled: "Cancelada",
};

export default async function ContaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/conta/entrar?redirect=/conta");
  }

  const t = await getTranslations("auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container-app py-12">
      <Breadcrumbs items={[{ label: t("myAccount") }]} />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{t("myAccount")}</h1>
          <p className="mt-1 text-sm text-stone">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ""}` : profile?.email ?? user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl text-charcoal">{t("myOrders")}</h2>

        {!orders || orders.length === 0 ? (
          <p className="mt-4 text-sm text-stone">{t("noOrders")}</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <div>
                  <p className="text-charcoal">
                    {t("orderNumber")} {order.order_number}
                  </p>
                  <p className="mt-0.5 text-xs text-stone">
                    {new Date(order.created_at).toLocaleDateString("pt-PT")} —{" "}
                    {STATUS_LABELS_PT[order.status] ?? order.status}
                  </p>
                </div>
                <p className="text-charcoal">{formatPrice(Number(order.total))}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
