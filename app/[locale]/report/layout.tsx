import type { Metadata } from "next";
import type { Locale } from "@/config/locales";
import { pageMetadata } from "@/lib/seo";

// /report/page.js is a client component (form state, validations) and
// can't export generateMetadata directly. This server layout owns the
// metadata, transparently wrapping the client page.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    namespace: "meta.report",
    path: "/report",
  });
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
