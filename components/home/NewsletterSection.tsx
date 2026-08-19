"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const t = useTranslations("home");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="container-app py-16">
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-display text-2xl text-charcoal">{t("newsletterTitle")}</h2>
        <p className="mt-3 text-sm text-stone">{t("newsletterText")}</p>
        {status === "sent" ? (
          <p className="mt-6 text-sm text-charcoal">{t("subscribed")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              className="w-full rounded-full border border-line bg-cream px-5 py-3 text-sm text-charcoal placeholder:text-stone/60 focus:outline-none focus:ring-1 focus:ring-clay"
            />
            <Button type="submit" variant="primary" className="shrink-0" disabled={status === "sending"}>
              {status === "sending" ? t("subscribing") : t("subscribe")}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 text-xs text-clay-dark">{t("subscribeError")}</p>
        )}
      </div>
    </section>
  );
}
