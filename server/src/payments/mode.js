// ============================================================
//  Décide si un moyen de paiement tourne en mode live ou démo.
//  Chaque moyen passe en live INDÉPENDAMMENT dès que sa propre
//  clé est renseignée dans les variables d'environnement.
//  PAYMENTS_MODE=demo reste un coupe-circuit global : force le
//  mode démo partout, quelles que soient les clés présentes.
// ============================================================
export function isLive(envKey) {
  if (process.env.PAYMENTS_MODE === "demo") return false;
  return !!process.env[envKey];
}

export function paymentStatus() {
  return {
    orange: isLive("ORANGE_MERCHANT_KEY") ? "live" : "demo",
    mtn: isLive("MTN_SUBSCRIPTION_KEY") ? "live" : "demo",
    card: isLive("STRIPE_SECRET_KEY") ? "live" : "demo",
    paypal: isLive("PAYPAL_CLIENT_ID") ? "live" : "demo",
  };
}
