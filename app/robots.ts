import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// /api/ is server-only, /admin/ is the password-protected dashboard —
// neither belongs in search results. Other routes are public and
// crawlable.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
