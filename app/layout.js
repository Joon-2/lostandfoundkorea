import { Inter, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FloatingWhatsApp } from "@/components/WhatsApp";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

// Explicit metadata for icons, OpenGraph, and Twitter cards. We do NOT
// rely on Next.js's file-based icon convention (app/favicon.ico,
// app/icon.*, app/apple-icon.*) because the auto-detected files would
// silently override the ones in /public. The ?v=2 query is a cache-bust
// for browsers that cached an earlier (incorrect) favicon.

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Lost & Found Korea — We'll find it.",
    template: "%s | Lost & Found Korea",
  },
  description:
    "English-speaking lost item recovery service in Korea. Free to start. Pay only when found.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon-96x96.png?v=2", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        url: "/web-app-manifest-192x192.png?v=2",
        sizes: "192x192",
      },
      {
        rel: "icon",
        url: "/web-app-manifest-512x512.png?v=2",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Lost & Found Korea — We'll find it.",
    description:
      "English-speaking lost item recovery service in Korea. Free to start. Pay only when found.",
    url: siteConfig.url,
    siteName: "Lost & Found Korea",
    images: [
      {
        url: "/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "Lost & Found Korea — We'll find it.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lost & Found Korea — We'll find it.",
    description: "English-speaking lost item recovery service in Korea.",
    images: ["/og-image.png?v=2"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <FloatingWhatsApp />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
