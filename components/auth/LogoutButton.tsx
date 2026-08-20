"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleLogout} disabled={loading}>
      {t("logout")}
    </Button>
  );
}
