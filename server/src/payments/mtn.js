// ============================================================
//  MTN Mobile Money — Collection API (Request to Pay)
//  Doc: https://momodeveloper.mtn.com
//  Nécessite une souscription "Collections" (compte marchand).
//  Sans clés -> mode démo (transaction simulée).
// ============================================================
import crypto from "crypto";
import { isLive } from "./mode.js";

const BASE = "https://sandbox.momodeveloper.mtn.com"; // prod: https://proxy.momoapi.mtn.com

async function getToken() {
  const user = process.env.MTN_API_USER;
  const key = process.env.MTN_API_KEY;
  const res = await fetch(`${BASE}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${user}:${key}`).toString("base64"),
      "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY,
    },
  });
  if (!res.ok) throw new Error("MTN: échec authentification");
  const data = await res.json();
  return data.access_token;
}

// Demande de paiement au numéro mobile du donateur (Request to Pay)
export async function createMtnPayment({ reference, amountEur, phone }) {
  if (!isLive("MTN_SUBSCRIPTION_KEY")) {
    return {
      provider: "mtn",
      mode: "demo",
      reference,
      status: "PENDING",
      message: "Mode démo — renseignez MTN_* dans .env pour activer MTN MoMo.",
    };
  }
  const token = await getToken();
  const refId = crypto.randomUUID();
  const res = await fetch(`${BASE}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": refId,
      "X-Target-Environment": process.env.MTN_TARGET_ENV || "sandbox",
      "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(amountEur),
      currency: "EUR",
      externalId: reference,
      payer: { partyIdType: "MSISDN", partyId: (phone || "").replace(/\D/g, "") },
      payerMessage: "Don DFD",
      payeeNote: reference,
    }),
  });
  if (res.status !== 202) throw new Error("MTN: demande de paiement refusée");
  return { provider: "mtn", mode: "live", reference, transaction_id: refId, status: "PENDING" };
}
