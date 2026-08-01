// ============================================================
//  Routeur de paiement — choisit l'opérateur selon la méthode
//  et le pays du donateur.
// ============================================================
import { createOrangePayment } from "./orange.js";
import { createMtnPayment } from "./mtn.js";
import { createPaypalPayment } from "./paypal.js";

// Stripe (carte / SEPA) — appel direct à l'API REST, sans SDK.
async function createStripePayment({ reference, amountEur, method, email }) {
  if ((process.env.PAYMENTS_MODE || "demo") !== "live" || !process.env.STRIPE_SECRET_KEY) {
    return {
      provider: method,
      mode: "demo",
      reference,
      client_secret: `demo_${reference}`,
      message: "Mode démo — renseignez STRIPE_SECRET_KEY dans .env pour activer la carte/SEPA.",
    };
  }
  const params = new URLSearchParams();
  params.append("amount", String(amountEur * 100)); // centimes
  params.append("currency", "eur");
  params.append("payment_method_types[]", method === "sepa" ? "sepa_debit" : "card");
  params.append("metadata[reference]", reference);
  if (email) params.append("receipt_email", email);
  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data = await res.json();
  if (data.error) throw new Error("Stripe: " + data.error.message);
  return { provider: method, mode: "live", reference, client_secret: data.client_secret };
}

// Point d'entrée unique
export async function initiatePayment({ method, reference, amountEur, phone, email, kind = "donation" }) {
  switch (method) {
    case "orange": return createOrangePayment({ reference, amountEur });
    case "mtn": return createMtnPayment({ reference, amountEur, phone });
    case "card":
    case "sepa": return createStripePayment({ reference, amountEur, method, email });
    case "paypal": return createPaypalPayment({ reference, amountEur, kind });
    default: throw new Error("Méthode de paiement inconnue: " + method);
  }
}
