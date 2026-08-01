// ============================================================
//  Authentification admin + tableau de bord décisionnel + exports
// ============================================================
import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken, requireAuth } from "../auth.js";

const router = express.Router();

/* ---------- CONNEXION ---------- */
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash))
    return res.status(401).json({ error: "Identifiants incorrects" });
  res.json({ token: signToken(user), user: { name: user.name, email: user.email, role: user.role } });
});

router.get("/me", requireAuth(), (req, res) => res.json(req.user));

/* ---------- TABLEAU DE BORD (KPIs + séries) ---------- */
router.get("/dashboard", requireAuth(["admin", "editor"]), (req, res) => {
  const totalEur = db.prepare("SELECT COALESCE(SUM(amount_eur),0) s FROM donations WHERE status='completed'").get().s;
  const thisMonth = db.prepare(`SELECT COALESCE(SUM(amount_eur),0) s FROM donations
    WHERE status='completed' AND strftime('%Y-%m',created_at)=strftime('%Y-%m','now')`).get().s;
  const volunteers = db.prepare("SELECT COUNT(*) c FROM volunteers").get().c;
  const activeProjects = db.prepare("SELECT COUNT(*) c FROM projects WHERE status='progress'").get().c;
  const donorsCount = db.prepare("SELECT COUNT(*) c FROM donations WHERE status='completed'").get().c;
  const membersCount = db.prepare("SELECT COUNT(*) c FROM members WHERE status='completed'").get().c;
  const membersTotal = db.prepare("SELECT COALESCE(SUM(amount_eur),0) s FROM members WHERE status='completed'").get().s;

  // Dons par mois (6 derniers mois)
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m',created_at) m, COALESCE(SUM(amount_eur),0) total
    FROM donations WHERE status='completed'
      AND created_at >= date('now','-5 months','start of month')
    GROUP BY m ORDER BY m`).all();

  // Répartition par méthode de paiement
  const byMethod = db.prepare(`SELECT method, COUNT(*) c, COALESCE(SUM(amount_eur),0) total
    FROM donations WHERE status='completed' GROUP BY method`).all();

  res.json({
    kpis: { totalEur, thisMonth, volunteers, activeProjects, donorsCount, membersCount, membersTotal },
    byMonth, byMethod,
  });
});

/* ---------- SOUMISSIONS (liste) ---------- */
router.get("/submissions/:type", requireAuth(["admin", "editor"]), (req, res) => {
  const tables = { donations: "donations", volunteers: "volunteers", messages: "messages", subscribers: "subscribers", members: "members" };
  const table = tables[req.params.type];
  if (!table) return res.status(404).json({ error: "Type inconnu" });
  res.json(db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 500`).all());
});

/* ---------- EXPORT CSV ---------- */
router.get("/export/:type", requireAuth(["admin", "editor"]), (req, res) => {
  const tables = { donations: "donations", volunteers: "volunteers", messages: "messages", subscribers: "subscribers", members: "members" };
  const table = tables[req.params.type];
  if (!table) return res.status(404).json({ error: "Type inconnu" });
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
  if (!rows.length) return res.type("text/csv").send("");
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${table}.csv"`);
  res.send("\uFEFF" + csv);
});

/* ---------- GESTION DES UTILISATEURS (admin uniquement) ---------- */
router.get("/users", requireAuth(["admin"]), (req, res) => {
  res.json(db.prepare("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC").all());
});

router.post("/users", requireAuth(["admin"]), (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Nom, e-mail et mot de passe requis" });
  const finalRole = role === "admin" ? "admin" : "editor";
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "Cet e-mail existe déjà" });
  const info = db.prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)")
    .run(name, email, bcrypt.hashSync(password, 10), finalRole);
  res.status(201).json({ id: info.lastInsertRowid, name, email, role: finalRole });
});

router.delete("/users/:id", requireAuth(["admin"]), (req, res) => {
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: "Impossible de supprimer votre propre compte" });
  db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
