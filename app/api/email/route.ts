import type { NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { logToCaseByCaseNumber } from "@/lib/activity-log";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isSupportedLocale, type Locale } from "@/config/locales";
import type { EmailPayload } from "@/types/email";

export const runtime = "nodejs";

// Unified email endpoint. Dispatches on EmailPayload.type to the right
// template+sender pair via lib/email → sendEmail(). Two categories:
//   - PUBLIC_TYPES: transactional, called from user-facing flows (report
//     submission → confirmation; successful payment → receipt). No admin
//     password required; just a valid EmailPayload.
//   - admin types (payment_link, not_found, info_request, shipping_quote,
//     tracking) require the x-admin-password header.
//
// Optional `logAction` field: when present (admin-only), the route appends
// the string to the case's activity_log after a successful send. This is
// what the now-removed per-action admin routes used to do internally.

const PUBLIC_TYPES: EmailPayload["type"][] = ["confirmation", "receipt"];

type EmailRequestBody = Partial<EmailPayload> & { logAction?: string };

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as EmailRequestBody;
  const type = body?.type;
  const to = body?.to;
  const caseNumber = body?.caseNumber;
  const logAction = body?.logAction;

  if (!type || !to || !caseNumber) {
    return Response.json(
      { ok: false, error: "Missing type, to, or caseNumber" },
      { status: 400 }
    );
  }

  const isAdminType = !PUBLIC_TYPES.includes(type);
  if (isAdminType) {
    const denied = checkAdminAuth(request);
    if (denied) return denied;
  }

  // Locale resolution order:
  //   1. Explicit body.locale (admin actions know it from the loaded case)
  //   2. Look up reports.locale by caseNumber (single source of truth)
  //   3. Fall back to 'en' if nothing else works
  let locale: Locale | undefined = isSupportedLocale(body?.locale)
    ? (body.locale as Locale)
    : undefined;
  if (!locale && supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from("reports")
        .select("locale")
        .eq("case_number", caseNumber)
        .maybeSingle();
      if (data && isSupportedLocale(data.locale)) locale = data.locale;
    } catch (err) {
      console.error("[email] locale lookup failed:", err);
    }
  }

  try {
    await sendEmail({
      to,
      subject: body.subject || "",
      type,
      caseNumber,
      data: body.data || {},
      locale,
    });
    // Log only for admin-authed calls. Public callers aren't allowed to
    // write to a case's activity_log.
    if (isAdminType && logAction && logAction.trim()) {
      await logToCaseByCaseNumber(caseNumber, { action: logAction.trim() });
    }
    return Response.json({ ok: true });
  } catch (err: any) {
    console.error("[email] send failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "Email send failed" },
      { status: 500 }
    );
  }
}
