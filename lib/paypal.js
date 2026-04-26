const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials not configured");
  }
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayPal token request failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.access_token;
}

export async function createPayPalOrder({ amount, caseNumber }) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: caseNumber,
          description: `Lost & Found Korea recovery (${caseNumber})`,
          amount: { currency_code: "USD", value: amount },
        },
      ],
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `PayPal create order failed: ${res.status} ${json?.message || ""}`
    );
  }
  return json;
}

export async function capturePayPalOrder(orderId) {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `PayPal capture failed: ${res.status} ${json?.message || ""}`
    );
  }
  return json;
}

// Refund a captured PayPal payment in full. Used when server-side
// amount verification fails after capture — we can't unring the
// capture bell, so we issue a full refund and reject the order in
// our DB.
//
// captureId is the inner capture id, not the order id:
//   captured.purchase_units[0].payments.captures[0].id
export async function refundPayPalCapture(captureId, { reason } = {}) {
  const token = await getAccessToken();
  const body = reason ? { note_to_payer: String(reason).slice(0, 255) } : {};
  const res = await fetch(
    `${PAYPAL_BASE}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `PayPal refund failed: ${res.status} ${json?.message || ""}`
    );
  }
  return json;
}
