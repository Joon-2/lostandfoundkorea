import { checkAdminAuth } from "@/lib/admin-auth";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const caseNumber = body?.caseNumber;
    const rawNote = typeof body?.note === "string" ? body.note.trim() : "";
    if (!caseNumber || !rawNote) {
      return Response.json(
        { ok: false, error: "Missing caseNumber or note" },
        { status: 400 }
      );
    }
    const note = rawNote.slice(0, 500);
    await logToCaseByCaseNumber(caseNumber, { action: `Note: ${note}` });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("add-note error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to add note" },
      { status: 500 }
    );
  }
}
