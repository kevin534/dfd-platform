// ============================================================
//  reCaptcha v2 — vérification côté serveur.
//  Sans RECAPTCHA_SECRET_KEY -> mode démo (toujours accepté),
//  comme les intégrations de paiement (voir payments/*.js).
// ============================================================

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // mode démo

  if (!token) return false;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return !!data.success;
}
