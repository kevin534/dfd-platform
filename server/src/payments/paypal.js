// ============================================================
//  PayPal — Orders API v2 (Checkout)
//  Doc: https://developer.paypal.com/docs/api/orders/v2/
//  Nécessite un compte PayPal Business (client ID + secret).
//  Sans clés -> mode démo (transaction simulée).
// ============================================================
import { isLive } from "./mode.js";

const BASE = () =>
  (process.env.PAYPAL_MODE || "live") === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const res = await fetch(`${BASE()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal: échec authentification");
  const data = await res.json();
  return data.access_token;
}

// Crée une commande PayPal et renvoie le lien d'approbation vers lequel rediriger le donateur
export async function createPaypalPayment({ reference, amountEur, kind = "donation" }) {
  if (!isLive("PAYPAL_CLIENT_ID")) {
    return {
      provider: "paypal",
      mode: "demo",
      reference,
      payment_url: `#demo-paypal-${reference}`,
      message: "Mode démo — renseignez PAYPAL_* dans .env pour activer PayPal.",
    };
  }
  const appUrl = process.env.PUBLIC_API_URL || "";
  const token = await getToken();
  const res = await fetch(`${BASE()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ reference_id: reference, amount: { currency_code: "EUR", value: amountEur.toFixed(2) } }],
      application_context: {
        brand_name: "DFD — Dreams Family of Development",
        user_action: "PAY_NOW",
        return_url: `${appUrl}/api/payments/paypal/return?ref=${reference}&kind=${kind}`,
        cancel_url: `${appUrl}/api/payments/paypal/cancel?ref=${reference}&kind=${kind}`,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("PayPal: création de commande refusée");
  const approve = data.links?.find((l) => l.rel === "approve")?.href;
  return { provider: "paypal", mode: "live", reference, order_id: data.id, payment_url: approve };
}

// Capture le paiement après approbation du donateur sur PayPal
export async function capturePaypalPayment(orderId) {
  const token = await getToken();
  const res = await fetch(`${BASE()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  return { ok: res.ok && data.status === "COMPLETED", data };
}
