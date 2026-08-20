"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(t("loginError"));
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirect") || "/conta";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-xs text-stone">
          {t("email")}
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-xs text-stone">
          {t("password")}
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      {error && <p className="text-sm text-clay-dark">{error}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? t("loggingIn") : t("loginButton")}
      </Button>
      <p className="text-center text-xs text-stone">
        {t("noAccount")}{" "}
        <Link href="/conta/registar" className="text-charcoal underline underline-offset-4">
          {t("createAccountLink")}
        </Link>
      </p>
    </form>
  );
}
