// ============================================================
//  Formulaires publics : dons, bénévolat, contact, newsletter
// ============================================================
import express from "express";
import crypto from "crypto";
import { db } from "../db.js";
import { initiatePayment } from "../payments/index.js";
import { verifyRecaptcha } from "../recaptcha.js";
import { notifyContactMessage } from "../mailer.js";

const router = express.Router();

function newReference() {
  return "DFD-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
}

/* ---------- DON + initiation du paiement ---------- */
router.post("/donations", async (req, res) => {
  try {
    if (!(await verifyRecaptcha(req.body.recaptchaToken)))
      return res.status(400).json({ error: "Vérification anti-robot échouée" });

    const { amountEur, frequency, country, method, name, email, phone, anonymous } = req.body;
    const amt = parseInt(amountEur, 10);
    if (!amt || amt < 1) return res.status(400).json({ error: "Montant invalide" });
    if (!method) return res.status(400).json({ error: "Méthode de paiement requise" });

    const reference = newReference();

    db.prepare(`INSERT INTO donations
      (reference,amount_eur,frequency,country,method,donor_name,donor_email,phone,anonymous,status)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(reference, amt, frequency || "once", country || null, method,
        anonymous ? null : (name || null), email || null, phone || null, anonymous ? 1 : 0, "pending");

    // Initie le paiement auprès du bon opérateur (Orange / MTN / Stripe)
    const payment = await initiatePayment({ method, reference, amountEur: amt, phone, email });

    // En mode démo, on marque le don comme complété tout de suite.
    if (payment.mode === "demo") {
      db.prepare("UPDATE donations SET status='completed' WHERE reference=?").run(reference);
    }

    res.status(201).json({ reference, amountEur: amt, method, payment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- BÉNÉVOLAT ---------- */
router.post("/volunteers", async (req, res) => {
  if (!(await verifyRecaptcha(req.body.recaptchaToken)))
    return res.status(400).json({ error: "Vérification anti-robot échouée" });
  const { name, email, phone, interests, availability, message } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Nom et e-mail requis" });
  db.prepare(`INSERT INTO volunteers (name,email,phone,interests,availability,message)
    VALUES (?,?,?,?,?,?)`).run(name, email, phone || null,
    Array.isArray(interests) ? interests.join(", ") : (interests || null), availability || null, message || null);
  res.status(201).json({ ok: true, message: "Candidature enregistrée" });
});

/* ---------- CONTACT ---------- */
router.post("/contact", async (req, res) => {
  if (!(await verifyRecaptcha(req.body.recaptchaToken)))
    return res.status(400).json({ error: "Vérification anti-robot échouée" });
  const { name, email, subject, body } = req.body;
  if (!name || !email || !body) return res.status(400).json({ error: "Champs requis manquants" });
  db.prepare("INSERT INTO messages (name,email,subject,body) VALUES (?,?,?,?)")
    .run(name, email, subject || "—", body);
  notifyContactMessage({ name, email, subject, body }).catch((e) => console.error("Notification e-mail échouée :", e.message));
  res.status(201).json({ ok: true, message: "Message envoyé" });
});

/* ---------- ADHÉSION + initiation du paiement ---------- */
router.post("/memberships", async (req, res) => {
  try {
    if (!(await verifyRecaptcha(req.body.recaptchaToken)))
      return res.status(400).json({ error: "Vérification anti-robot échouée" });

    const { amountEur, country, method, name, email, phone, acceptedBylaws } = req.body;
    const amt = parseInt(amountEur, 10);
    if (!amt || amt < 1) return res.status(400).json({ error: "Montant invalide" });
    if (!method) return res.status(400).json({ error: "Méthode de paiement requise" });
    if (!name || !email) return res.status(400).json({ error: "Nom et e-mail requis" });
    if (!acceptedBylaws) return res.status(400).json({ error: "Vous devez accepter les statuts" });

    const reference = newReference();

    db.prepare(`INSERT INTO members
      (reference,amount_eur,country,method,name,email,phone,accepted_bylaws,status)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(reference, amt, country || null, method, name, email, phone || null, 1, "pending");

    const payment = await initiatePayment({ method, reference, amountEur: amt, phone, email });

    if (payment.mode === "demo") {
      db.prepare("UPDATE members SET status='completed' WHERE reference=?").run(reference);
    }

    res.status(201).json({ reference, amountEur: amt, method, payment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- NEWSLETTER ---------- */
router.post("/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: "E-mail invalide" });
  try {
    db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
    res.status(201).json({ ok: true });
  } catch { res.status(500).json({ error: "Erreur" }); }
});

export default router;
