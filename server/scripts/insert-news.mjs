import Database from "better-sqlite3";
const db = new Database("data/dfd.sqlite");

const rows = [
  {
    title_fr: "Meet & Greet DFD Douala",
    title_en: "DFD Douala Meet & Greet",
    desc_fr: "Rencontre ouverte pour découvrir la mission, les objectifs et les membres de DFD : présentation de l'association, échanges et engagement. Carrefour entrée Baden Baden, Douala Kotto.",
    desc_en: "Open meet-up to discover DFD's mission, goals and members: association overview, discussion and engagement. Baden Baden entrance crossroads, Douala Kotto.",
    author: "DFD Douala", date: "2025-10-01", theme: "event", image_url: "/images/meet-greet-douala.jpg",
  },
  {
    title_fr: "Formation DFD : gestion du temps et productivité",
    title_en: "DFD training: time management and productivity",
    desc_fr: "Première session gratuite animée par le Dr Fabrice Tiba (formateur, conférencier, coach) : la vraie valeur du temps, sa perception, les voleurs silencieux du temps et la maîtrise des priorités. En ligne via Google Meet, département lecture et développement personnel.",
    desc_en: "First free session led by Dr Fabrice Tiba (trainer, speaker, coach): the real value of time, how we perceive it, the silent time-thieves and mastering priorities. Online via Google Meet, reading & personal development department.",
    author: "Département lecture & développement personnel", date: "2026-06-27", theme: "education", image_url: "/images/formation-gestion-temps.jpg",
  },
];

const insert = db.prepare(`INSERT INTO news (title_fr,title_en,desc_fr,desc_en,author,date,theme,image_url)
  VALUES (@title_fr,@title_en,@desc_fr,@desc_en,@author,@date,@theme,@image_url)`);

for (const r of rows) {
  const exists = db.prepare("SELECT id FROM news WHERE title_fr=?").get(r.title_fr);
  if (!exists) { insert.run(r); console.log("inséré :", r.title_fr); }
  else console.log("déjà présent :", r.title_fr);
}

console.log(db.prepare("SELECT id,title_fr,date,image_url FROM news ORDER BY date DESC").all());
