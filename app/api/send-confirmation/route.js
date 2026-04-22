import { sendConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, caseNumber } = body || {};

    if (!email || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing email or caseNumber" },
        { status: 400 }
      );
    }

    await sendConfirmationEmail({ name, email, caseNumber });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-confirmation error:", err);
    return Response.json(
      { ok: false, error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
