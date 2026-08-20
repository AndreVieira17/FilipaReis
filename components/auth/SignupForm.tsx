"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const t = useTranslations("auth");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });

    if (signUpError || !data.user) {
      setError(t("signupError"));
      setLoading(false);
      return;
    }

    // O trigger da base de dados cria o registo em `profiles` a partir dos
    // metadados (first_name/last_name) já enviados no signUp acima.
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-lg border border-line bg-sand p-6 text-sm text-charcoal">
        {t("checkEmail")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="signup-first-name" className="mb-1.5 block text-xs text-stone">
            {t("firstName")}
          </label>
          <input
            id="signup-first-name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
          />
        </div>
        <div>
          <label htmlFor="signup-last-name" className="mb-1.5 block text-xs text-stone">
            {t("lastName")}
          </label>
          <input
            id="signup-last-name"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
          />
        </div>
      </div>
      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-xs text-stone">
          {t("email")}
        </label>
        <input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-xs text-stone">
          {t("password")}
        </label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      {error && <p className="text-sm text-clay-dark">{error}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? t("signingUp") : t("signupButton")}
      </Button>
      <p className="text-center text-xs text-stone">
        {t("hasAccount")}{" "}
        <Link href="/conta/entrar" className="text-charcoal underline underline-offset-4">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
