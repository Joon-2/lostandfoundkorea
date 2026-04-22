import { supabase } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
  "PAYPAL_SECRET",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "ADMIN_PASSWORD",
];

export async function GET(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  const env = {};
  for (const key of ENV_VARS) {
    env[key] = Boolean(process.env[key]);
  }

  let supabaseCheck;
  if (!supabase) {
    supabaseCheck = { ok: false, error: "Client not initialized" };
  } else {
    try {
      const { error, count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });
      if (error) {
        supabaseCheck = { ok: false, error: error.message };
      } else {
        supabaseCheck = { ok: true, count: count ?? 0 };
      }
    } catch (err) {
      supabaseCheck = { ok: false, error: err?.message || "Unknown error" };
    }
  }

  return Response.json({
    ok: true,
    supabase: supabaseCheck,
    env,
  });
}
