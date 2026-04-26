# CLAUDE.md — Project Rules & Structure

## Directory Structure

```
/app                              — Pages only (thin wrappers)
  /app/page.tsx                   — Landing page
  /app/report/page.tsx            — Report form
  /app/pay/[caseNumber]/page.tsx  — Payment & recovery page
  /app/pay/delivery-only/page.tsx — Delivery only form
  /app/admin/page.tsx             — Admin dashboard
  /app/api/
    /api/admin/reports/           — Admin report CRUD (GET all; PATCH /[id] to update)
    /api/reports/[caseNumber]/    — Customer-facing case lookup (no admin auth)
    /api/upload/                  — Image upload to Supabase Storage
    /api/email/                   — All email types (single handler)
    /api/payment/                 — PayPal capture
    /api/health/                  — System health check

/components/
  /components/ui/                 — Button, Input, Select, Badge, Card, Spinner, FileUpload, Modal
  /components/layout/             — Header, Footer, MobileMenu
  /components/landing/            — Hero, HowItWorks, Pricing, Testimonials, FAQ, AboutUs, CTA
  /components/report/             — ReportForm, StepOne, StepTwo, PlanSelector, PhotoUpload
  /components/pay/                — PaymentPage, FoundView, PaidView, PayPalButton, AuthorizationForm, PickupUpgrade, Receipt
  /components/admin/              — CaseList, CaseDetail, ProcessTracker, StageReceived, StageSearching, StageFound, StagePaid, PhotoManager, ActivityLog, EmailActions, SearchPlan

/lib/
  /lib/supabase.ts                — Supabase client
  /lib/email.ts                   — Email helper (sendEmail function)
  /lib/utils.ts                   — Shared utilities

/types/
  /types/report.ts                — Report, ActivityLogEntry interfaces
  /types/email.ts                 — EmailPayload interface
  /types/payment.ts               — Payment types

/config/
  /config/site.ts                 — Site name, URLs, email, WhatsApp
  /config/plans.ts                — Pricing plans and features
  /config/search-contacts.ts      — Lost item search contacts per location

/styles/
  /styles/tokens.ts               — Design tokens (→ see DESIGN.md)
  /styles/globals.css              — Tailwind imports

/assets/
  /assets/icons/                  — SVG React components
  /assets/images/                 — Static images

/locales/
  /locales/en.json                — English strings
  /locales/ja.json                — Japanese (structure only)
  /locales/zh.json                — Chinese (structure only)
```

## Coding Rules

- One component per file
- Components accept props, no direct Supabase calls from UI
- Import types from /types
- Import constants from /config and /lib/constants.ts
- Import design values from /styles/tokens.ts or use Tailwind token classes
- User-facing strings: use t('key') from /locales, no hardcoded text
- Admin dashboard: English only, no i18n

## Security Rules

- Supabase anon key: INSERT only on reports table
- All reads: server-side API routes with SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_ prefix only: SUPABASE_URL, SUPABASE_ANON_KEY, PAYPAL_CLIENT_ID
- Server-only: SERVICE_ROLE_KEY, PAYPAL_SECRET, GMAIL_APP_PASSWORD, ADMIN_PASSWORD
- Admin pages: verify ADMIN_PASSWORD server-side
- Sanitize all form inputs before DB insert

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYPAL_CLIENT_ID
PAYPAL_SECRET
GMAIL_USER=admin@kustody.co
GMAIL_APP_PASSWORD
ADMIN_PASSWORD
```

## Email Rules

- From: "Lost and Found Korea" <support@lostandfoundkorea.com>
- SMTP auth: admin@kustody.co (never shown to user)
- All subjects include case number: [LFK-XXXXXX]
- Types: confirmation, payment_link, not_found, info_request, receipt, shipping_quote, tracking

## Image Upload Rules

- Accept all image formats
- Convert to JPEG, compress to max 1200px / 0.7 quality / target <500KB
- HEIC: use heic2any library
- Upload via server-side API with SERVICE_ROLE_KEY
- Buckets: "report-images" (user), "found-images" (admin)
- Save immediately, no Save button
