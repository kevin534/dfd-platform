// ============================================================
//  Contenu : projets, actualités, documents
//  Lecture publique — écriture réservée admin/éditeur (CMS)
// ============================================================
import express from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();
const admin = requireAuth(["admin", "editor"]);

/* ---------- PROJETS ---------- */
router.get("/projects", (req, res) => {
  const { category } = req.query;
  const rows = category && category !== "all"
    ? db.prepare("SELECT * FROM projects WHERE category=? ORDER BY year DESC, id DESC").all(category)
    : db.prepare("SELECT * FROM projects ORDER BY year DESC, id DESC").all();
  res.json(rows);
});

router.post("/projects", admin, (req, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO projects
    (category,title_fr,title_en,desc_fr,desc_en,place_fr,place_en,year,status,theme)
    VALUES (@category,@title_fr,@title_en,@desc_fr,@desc_en,@place_fr,@place_en,@year,@status,@theme)`)
    .run({ status: "progress", theme: "community", year: new Date().getFullYear(), ...b });
  res.status(201).json(db.prepare("SELECT * FROM projects WHERE id=?").get(info.lastInsertRowid));
});

router.put("/projects/:id", admin, (req, res) => {
  const cur = db.prepare("SELECT * FROM projects WHERE id=?").get(req.params.id);
  if (!cur) return res.status(404).json({ error: "Introuvable" });
  const m = { ...cur, ...req.body };
  db.prepare(`UPDATE projects SET category=@category,title_fr=@title_fr,title_en=@title_en,
    desc_fr=@desc_fr,desc_en=@desc_en,place_fr=@place_fr,place_en=@place_en,
    year=@year,status=@status,theme=@theme WHERE id=@id`).run(m);
  res.json(db.prepare("SELECT * FROM projects WHERE id=?").get(req.params.id));
});

router.delete("/projects/:id", admin, (req, res) => {
  db.prepare("DELETE FROM projects WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

/* ---------- ACTUALITÉS ---------- */
router.get("/news", (req, res) => {
  res.json(db.prepare("SELECT * FROM news ORDER BY date DESC, id DESC").all());
});

router.post("/news", admin, (req, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO news (title_fr,title_en,desc_fr,desc_en,author,date,theme,image_url)
    VALUES (@title_fr,@title_en,@desc_fr,@desc_en,@author,@date,@theme,@image_url)`)
    .run({ author: "DFD", date: new Date().toISOString().slice(0, 10), theme: "community", image_url: null, ...b });
  res.status(201).json(db.prepare("SELECT * FROM news WHERE id=?").get(info.lastInsertRowid));
});

router.delete("/news/:id", admin, (req, res) => {
  db.prepare("DELETE FROM news WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

/* ---------- DOCUMENTS ---------- */
router.get("/documents", (req, res) => {
  res.json(db.prepare("SELECT * FROM documents ORDER BY year DESC, id DESC").all());
});

router.post("/documents", admin, (req, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO documents (title_fr,title_en,year,size,lang,url)
    VALUES (@title_fr,@title_en,@year,@size,@lang,@url)`)
    .run({ year: new Date().getFullYear(), size: "—", lang: "FR", url: "#", ...b });
  res.status(201).json(db.prepare("SELECT * FROM documents WHERE id=?").get(info.lastInsertRowid));
});

router.delete("/documents/:id", admin, (req, res) => {
  db.prepare("DELETE FROM documents WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
