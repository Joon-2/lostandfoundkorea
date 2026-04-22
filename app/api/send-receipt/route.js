import { sendReceiptEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      name,
      email,
      caseNumber,
      amount,
      transactionId,
      paidAt,
      planLabel,
    } = body || {};
    if (!email || !caseNumber || !transactionId || amount == null) {
      return Response.json(
        {
          ok: false,
          error: "Missing email, caseNumber, transactionId, or amount",
        },
        { status: 400 }
      );
    }
    await sendReceiptEmail({
      name,
      email,
      caseNumber,
      amount,
      transactionId,
      paidAt,
      planLabel,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-receipt error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to send receipt" },
      { status: 500 }
    );
  }
}
