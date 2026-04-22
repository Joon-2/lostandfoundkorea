import { checkAdminAuth } from "@/lib/admin-auth";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const caseNumber = body?.caseNumber;
    if (!caseNumber) {
      return Response.json(
        { ok: false, error: "Missing caseNumber" },
        { status: 400 }
      );
    }
    await logToCaseByCaseNumber(caseNumber, { action: "Package shipped" });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("mark-shipped error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}
