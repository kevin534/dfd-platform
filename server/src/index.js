// ============================================================
//  DFD — Serveur API (Express)
// ============================================================
import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { seed } from "./db.js";
import contentRoutes from "./routes/content.js";
import formRoutes from "./routes/forms.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// Initialise le schéma + les données de démonstration
seed();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "1mb" }));

// Documents publics téléchargeables (rapports, statuts...)
app.use("/files/documents", express.static(path.join(__dirname, "..", "public", "documents")));

// Limite anti-abus sur les écritures publiques
app.use("/api/donations", rateLimit({ windowMs: 60_000, max: 20 }));
app.use("/api/contact", rateLimit({ windowMs: 60_000, max: 10 }));
app.use("/api/volunteers", rateLimit({ windowMs: 60_000, max: 10 }));
app.use("/api/memberships", rateLimit({ windowMs: 60_000, max: 10 }));
app.use("/api/auth/login", rateLimit({ windowMs: 60_000, max: 5 }));

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "dfd-api", paymentsMode: process.env.PAYMENTS_MODE || "demo" })
);

app.use("/api", contentRoutes);
app.use("/api", formRoutes);
app.use("/api/auth", adminRoutes);

// En production, sert le frontend compilé (web/dist) si présent
const clientDist = path.join(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/files")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`\n🌍  DFD API en écoute sur http://localhost:${PORT}`);
  console.log(`    Paiements : ${process.env.PAYMENTS_MODE || "demo"}`);
  console.log(`    Santé     : http://localhost:${PORT}/api/health\n`);
});
