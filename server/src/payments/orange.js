// ============================================================
//  Orange Money — Web Payment API
//  Doc: https://developer.orange.com/apis/om-webpay
//  Nécessite un compte marchand Orange Money (par pays).
//  Sans clés -> mode démo (transaction simulée).
// ============================================================

async function getToken() {
  const id = process.env.ORANGE_CLIENT_ID;
  const secret = process.env.ORANGE_CLIENT_SECRET;
  const res = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Orange: échec authentification");
  const data = await res.json();
  return data.access_token;
}

// Crée une demande de paiement et renvoie l'URL de paiement Orange
export async function createOrangePayment({ reference, amountEur }) {
  if ((process.env.PAYMENTS_MODE || "demo") !== "live" || !process.env.ORANGE_MERCHANT_KEY) {
    return {
      provider: "orange",
      mode: "demo",
      reference,
      payment_url: `#demo-orange-${reference}`,
      message: "Mode démo — renseignez ORANGE_* dans .env pour activer Orange Money.",
    };
  }
  const token = await getToken();
  const res = await fetch("https://api.orange.com/orange-money-webpay/dev/v1/webpayment", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_key: process.env.ORANGE_MERCHANT_KEY,
      currency: "EUR",
      order_id: reference,
      amount: amountEur,
      return_url: process.env.ORANGE_RETURN_URL,
      cancel_url: process.env.ORANGE_CANCEL_URL,
      notif_url: (process.env.PUBLIC_API_URL || "") + "/api/payments/webhook/orange",
    }),
  });
  const data = await res.json();
  return { provider: "orange", mode: "live", reference, payment_url: data.payment_url, pay_token: data.pay_token };
}
