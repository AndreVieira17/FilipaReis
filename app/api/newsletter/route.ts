import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  // 23505 = unique_violation — já está subscrito, tratar como sucesso
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Não foi possível subscrever." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
