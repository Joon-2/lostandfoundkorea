import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl handles all the locale work:
//   - Visitor with NEXT_LOCALE cookie → cookie wins
//   - Otherwise: Accept-Language → resolve to a supported locale
//   - Default locale (en) is served at the root with no prefix
//   - Non-default locales (ja) require their /ja prefix; visitors at
//     a non-prefixed URL whose preferred locale is non-default get a
//     307 redirect to the matching /ja path
//   - The cookie is set on first resolved request and on manual switch
export default createMiddleware(routing);

export const config = {
  // Run for everything except /api, /admin, /_next, /_vercel, the
  // auto-generated /robots.txt and /sitemap.xml, and any path that
  // looks like a static file (contains a dot).
  matcher: [
    "/((?!api|admin|_next|_vercel|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
