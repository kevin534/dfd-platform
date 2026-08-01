// ============================================================
//  Retours de paiement (redirections navigateur après approbation
//  externe). Pour l'instant : PayPal uniquement.
// ============================================================
import express from "express";
import { db } from "../db.js";
import { capturePaypalPayment } from "../payments/paypal.js";

const router = express.Router();

// Backend et frontend sont servis sur la même origine en production
// (voir index.js) : une redirection relative suffit et évite tout souci
// avec CLIENT_ORIGIN="*" (CORS uniquement, pas une URL utilisable).
function frontendUrl(path) {
  return path;
}

function markCompleted(reference) {
  db.prepare("UPDATE donations SET status='completed' WHERE reference=?").run(reference);
  db.prepare("UPDATE members SET status='completed' WHERE reference=?").run(reference);
}

function pageFor(kind) {
  return kind === "membership" ? "/membership" : "/donate";
}

router.get("/paypal/return", async (req, res) => {
  const { ref, token: orderId, kind } = req.query;
  const page = pageFor(kind);
  try {
    const result = await capturePaypalPayment(orderId);
    if (result.ok) markCompleted(ref);
    res.redirect(frontendUrl(`${page}?paypal=${result.ok ? "success" : "failed"}&ref=${encodeURIComponent(ref || "")}`));
  } catch (e) {
    res.redirect(frontendUrl(`${page}?paypal=failed&ref=${encodeURIComponent(ref || "")}`));
  }
});

router.get("/paypal/cancel", (req, res) => {
  res.redirect(frontendUrl(`${pageFor(req.query.kind)}?paypal=cancelled&ref=${encodeURIComponent(req.query.ref || "")}`));
});

export default router;
