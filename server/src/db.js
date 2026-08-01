// ============================================================
//  DFD — Base de données (SQLite via better-sqlite3)
//  Crée le schéma au premier lancement et insère des données
//  de démonstration. Pour passer à PostgreSQL en production,
//  voir DEPLOYMENT.md (le schéma est standard SQL).
// ============================================================
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, "dfd.sqlite"));
db.pragma("journal_mode = WAL");

// ---------- Schéma ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',   -- admin | editor
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,                 -- sante | educ | envt | huma
  title_fr TEXT, title_en TEXT,
  desc_fr TEXT, desc_en TEXT,
  place_fr TEXT, place_en TEXT,
  year INTEGER,
  status TEXT DEFAULT 'progress',         -- progress | done
  theme TEXT DEFAULT 'community',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_fr TEXT, title_en TEXT,
  desc_fr TEXT, desc_en TEXT,
  author TEXT, date TEXT, theme TEXT DEFAULT 'community',
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_fr TEXT, title_en TEXT,
  year INTEGER, size TEXT, lang TEXT, url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE,
  amount_eur INTEGER NOT NULL,
  frequency TEXT DEFAULT 'once',          -- once | monthly
  country TEXT, method TEXT,              -- orange | mtn | card | sepa
  donor_name TEXT, donor_email TEXT, phone TEXT,
  anonymous INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',          -- pending | completed | failed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE,
  amount_eur INTEGER NOT NULL,
  country TEXT, method TEXT,
  name TEXT, email TEXT, phone TEXT,
  accepted_bylaws INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, phone TEXT,
  interests TEXT, availability TEXT, message TEXT,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, subject TEXT, body TEXT,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// ---------- Migrations légères (colonnes ajoutées après le lancement initial) ----------
const newsCols = db.prepare("PRAGMA table_info(news)").all().map((c) => c.name);
if (!newsCols.includes("image_url")) db.exec("ALTER TABLE news ADD COLUMN image_url TEXT");

// ---------- Seed ----------
export function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dfd.org";
  const adminPass = process.env.ADMIN_PASSWORD || "DfdAdmin2025!";
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(adminEmail);
  if (!exists) {
    db.prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)")
      .run("Administrateur DFD", adminEmail, bcrypt.hashSync(adminPass, 10), "admin");
    console.log(`✔ Compte admin créé : ${adminEmail}`);
  }

  if (db.prepare("SELECT COUNT(*) c FROM projects").get().c === 0) {
    const p = db.prepare(`INSERT INTO projects
      (category,title_fr,title_en,desc_fr,desc_en,place_fr,place_en,year,status,theme)
      VALUES (@category,@title_fr,@title_en,@desc_fr,@desc_en,@place_fr,@place_en,@year,@status,@theme)`);
    [
      { category: "sante", title_fr: "Cliniques mobiles au Mayo-Sava", title_en: "Mobile clinics in Mayo-Sava", desc_fr: "Accès aux soins de base et vaccinations dans les villages reculés du Cameroun.", desc_en: "Access to basic care and vaccinations in remote villages of Cameroon.", place_fr: "Extrême-Nord, Cameroun", place_en: "Far North, Cameroon", year: 2024, status: "progress", theme: "health" },
      { category: "educ", title_fr: "Écoles pour tous à l'Est", title_en: "Schools for all in the East", desc_fr: "Construction et équipement d'écoles primaires en zones rurales.", desc_en: "Building and equipping primary schools in rural areas.", place_fr: "Région de l'Est, Cameroun", place_en: "East Region, Cameroon", year: 2023, status: "progress", theme: "education" },
      { category: "envt", title_fr: "Reforestation communautaire", title_en: "Community reforestation", desc_fr: "15 000 arbres plantés avec les communautés pour restaurer les sols.", desc_en: "15,000 trees planted with communities to restore the soil.", place_fr: "Ouest Cameroun", place_en: "West Cameroon", year: 2024, status: "progress", theme: "forest" },
      { category: "huma", title_fr: "Accès à l'eau potable", title_en: "Access to clean water", desc_fr: "Forages et points d'eau durables pour 12 villages de l'Adamaoua.", desc_en: "Wells and sustainable water points for 12 villages in Adamawa.", place_fr: "Adamaoua, Cameroun", place_en: "Adamawa, Cameroon", year: 2024, status: "progress", theme: "water" },
      { category: "educ", title_fr: "Alphabétisation des femmes", title_en: "Women's literacy", desc_fr: "Alphabétisation et micro-entrepreneuriat pour 240 femmes.", desc_en: "Literacy and micro-entrepreneurship for 240 women.", place_fr: "Douala, Cameroun", place_en: "Douala, Cameroon", year: 2022, status: "done", theme: "education" },
      { category: "huma", title_fr: "Aide d'urgence aux déplacés", title_en: "Emergency aid for the displaced", desc_fr: "Kits alimentaires, abris et hygiène pour les familles déplacées.", desc_en: "Food kits, shelter and hygiene for displaced families.", place_fr: "Nord-Ouest / Sud-Ouest", place_en: "North-West / South-West", year: 2024, status: "progress", theme: "water" },
    ].forEach((r) => p.run(r));
    console.log("✔ Projets de démonstration insérés");
  }

  if (db.prepare("SELECT COUNT(*) c FROM news").get().c === 0) {
    const n = db.prepare(`INSERT INTO news (title_fr,title_en,desc_fr,desc_en,author,date,theme,image_url)
      VALUES (@title_fr,@title_en,@desc_fr,@desc_en,@author,@date,@theme,@image_url)`);
    [
      { title_fr: "Meet & Greet DFD Douala", title_en: "DFD Douala Meet & Greet", desc_fr: "Rencontre ouverte pour découvrir la mission, les objectifs et les membres de DFD : présentation de l'association, échanges et engagement. Carrefour entrée Baden Baden, Douala Kotto.", desc_en: "Open meet-up to discover DFD's mission, goals and members: association overview, discussion and engagement. Baden Baden entrance crossroads, Douala Kotto.", author: "DFD Douala", date: "2025-10-01", theme: "event", image_url: "/images/meet-greet-douala.jpg" },
      { title_fr: "Formation DFD : gestion du temps et productivité", title_en: "DFD training: time management and productivity", desc_fr: "Première session gratuite animée par le Dr Fabrice Tiba (formateur, conférencier, coach) : la vraie valeur du temps, sa perception, les voleurs silencieux du temps et la maîtrise des priorités. En ligne via Google Meet, département lecture et développement personnel.", desc_en: "First free session led by Dr Fabrice Tiba (trainer, speaker, coach): the real value of time, how we perceive it, the silent time-thieves and mastering priorities. Online via Google Meet, reading & personal development department.", author: "Département lecture & développement personnel", date: "2026-06-27", theme: "education", image_url: "/images/formation-gestion-temps.jpg" },
      { title_fr: "Comment votre don change des vies", title_en: "How your gift changes lives", desc_fr: "Transparence : où va vraiment votre soutien financier, poste par poste.", desc_en: "Transparency: where your financial support really goes, line by line.", author: "Direction DFD", date: "2024-06-07", theme: "community", image_url: null },
      { title_fr: "Retour sur notre mission dans l'Extrême-Nord", title_en: "Back from our mission in the Far North", desc_fr: "Une semaine au cœur des villages du Mayo-Sava avec les cliniques mobiles.", desc_en: "A week in the villages of Mayo-Sava with the mobile clinics.", author: "Équipe terrain", date: "2024-05-01", theme: "health", image_url: null },
      { title_fr: "Reforestation : 15 000 arbres plus tard", title_en: "Reforestation: 15,000 trees later", desc_fr: "Bilan de notre programme de restauration des sols dans l'Ouest.", desc_en: "Results from our soil restoration programme in the West.", author: "Pôle projets", date: "2024-03-18", theme: "forest", image_url: null },
      { title_fr: "Rentrée scolaire : 3 nouvelles écoles", title_en: "New school year: 3 new schools", desc_fr: "Trois écoles inaugurées à l'Est du Cameroun pour 480 enfants.", desc_en: "Three schools opened in East Cameroon for 480 children.", author: "Direction DFD", date: "2024-02-02", theme: "education", image_url: null },
    ].forEach((r) => n.run(r));
    console.log("✔ Actualités de démonstration insérées");
  }

  if (db.prepare("SELECT COUNT(*) c FROM documents").get().c === 0) {
    const d = db.prepare(`INSERT INTO documents (title_fr,title_en,year,size,lang,url)
      VALUES (@title_fr,@title_en,@year,@size,@lang,@url)`);
    [
      { title_fr: "Rapport d'activité 2024", title_en: "2024 activity report", year: 2024, size: "5 Ko", lang: "FR", url: "/files/documents/rapport-activite-2024.pdf" },
      { title_fr: "Bilan financier 2024", title_en: "2024 financial statement", year: 2024, size: "5 Ko", lang: "FR", url: "/files/documents/bilan-financier-2024.pdf" },
      { title_fr: "Statuts de l'association", title_en: "Association bylaws", year: 2023, size: "5 Ko", lang: "FR", url: "/files/documents/statuts-association.pdf" },
      { title_fr: "Rapport d'impact — Cameroun", title_en: "Impact report — Cameroon", year: 2023, size: "4 Ko", lang: "FR", url: "/files/documents/rapport-impact-cameroun.pdf" },
    ].forEach((r) => d.run(r));
    console.log("✔ Documents de démonstration insérés");
  }

  // Quelques dons de démonstration pour alimenter le tableau de bord
  if (db.prepare("SELECT COUNT(*) c FROM donations").get().c === 0) {
    const dn = db.prepare(`INSERT INTO donations
      (reference,amount_eur,frequency,country,method,donor_name,donor_email,anonymous,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const methods = ["orange", "mtn", "card", "sepa"];
    const countries = ["CM", "CI", "FR", "BE", "SN", "GH"];
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      const amt = [10, 20, 30, 50, 100, 250][Math.floor(Math.random() * 6)];
      const daysAgo = Math.floor(Math.random() * 165);
      const date = new Date(now - daysAgo * 864e5).toISOString();
      dn.run(`DEMO-${1000 + i}`, amt, Math.random() > 0.7 ? "monthly" : "once",
        countries[Math.floor(Math.random() * countries.length)],
        methods[Math.floor(Math.random() * methods.length)],
        "Donateur démo", "demo@dfd.org", 0, "completed", date);
    }
    console.log("✔ Dons de démonstration insérés");
  }
}

// Exécution directe : `node src/db.js --seed`
if (process.argv.includes("--seed")) {
  const dotenv = await import("dotenv");
  dotenv.config();
  seed();
  console.log("Seed terminé.");
}
