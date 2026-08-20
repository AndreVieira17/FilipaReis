"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const t = useTranslations("contact");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-line bg-sand p-6 text-sm text-charcoal">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs text-stone">{t("nameLabel")}</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-stone">{t("emailLabel")}</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs text-stone">{t("messageLabel")}</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-line bg-cream px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-clay"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-clay-dark">{t("error")}</p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
