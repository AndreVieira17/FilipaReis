import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://filipareis.pt";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Filipa Reis | Artesanato Feito à Mão",
    template: "%s | Filipa Reis",
  },
  description:
    "Peças de artesanato feitas à mão por Filipa Reis: colares, pulseiras, brincos e cerâmica com materiais naturais.",
  openGraph: {
    title: "Filipa Reis | Artesanato Feito à Mão",
    description:
      "Peças de artesanato feitas à mão por Filipa Reis: colares, pulseiras, brincos e cerâmica com materiais naturais.",
    url: siteUrl,
    siteName: "Filipa Reis",
    locale: "pt_PT",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${fraunces.variable} ${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
