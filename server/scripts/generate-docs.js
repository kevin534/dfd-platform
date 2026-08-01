// ============================================================
//  Génère les PDF publics de la page "Documents" à partir du
//  contenu réel des activités DFD (projets, chiffres, statuts).
//  Usage : node scripts/generate-docs.js
// ============================================================
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "documents");
fs.mkdirSync(OUT_DIR, { recursive: true });

const GREEN = "#164A3B";
const GOLD = "#B8860B";
const LATERITE = "#B23A1E";
const INK = "#2A211B";
const MUTED = "#6B6058";

function newDoc(filename) {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  doc.pipe(fs.createWriteStream(path.join(OUT_DIR, filename)));
  return doc;
}

function coverHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 130).fill(GREEN);
  doc.fillColor("#fff").fontSize(11).font("Helvetica-Bold")
    .text("DFD — DREAMS FAMILY OF DEVELOPMENT", 56, 34, { characterSpacing: 1 });
  doc.fontSize(23).text(title, 56, 58, { width: doc.page.width - 112 });
  doc.fontSize(11).font("Helvetica").fillColor("#EADFC8").text(subtitle, 56, 96);
  doc.fillColor(INK).moveDown(4);
  doc.y = 155;
}

function h2(doc, text) {
  doc.moveDown(1);
  doc.fontSize(14).font("Helvetica-Bold").fillColor(GREEN).text(text);
  doc.moveTo(56, doc.y + 2).lineTo(200, doc.y + 2).strokeColor(GOLD).lineWidth(2).stroke();
  doc.moveDown(0.6);
  doc.fontSize(10.5).font("Helvetica").fillColor(INK);
}

function p(doc, text) {
  doc.fontSize(10.5).font("Helvetica").fillColor(INK).text(text, { align: "justify" });
  doc.moveDown(0.5);
}

function bullet(doc, label, value) {
  doc.fontSize(10.5).font("Helvetica-Bold").fillColor(GREEN).text(`• ${label} `, { continued: true });
  doc.font("Helvetica").fillColor(INK).text(value);
}

function footer(doc, note) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(MUTED)
      .text(note, 56, doc.page.height - 46, { width: doc.page.width - 112, align: "center" });
    doc.text(`DFD — Dreams Family of Development · contact@dfd.org · Page ${i + 1}/${range.count}`, 56, doc.page.height - 34, { width: doc.page.width - 112, align: "center" });
  }
}

const DEMO_NOTE = "Document généré à partir des données de démonstration de la plateforme DFD — chiffres illustratifs, non audités.";

/* ============================================================ 1. RAPPORT D'ACTIVITÉ 2024 */
function activityReport() {
  const doc = newDoc("rapport-activite-2024.pdf");
  coverHeader(doc, "Rapport d'activité 2024", "Cameroun & Afrique — Santé, Éducation, Environnement, Humanitaire");

  h2(doc, "Éditorial");
  p(doc, "En 2024, Dreams Family of Development (DFD) a poursuivi son engagement auprès des communautés du Cameroun et d'Afrique, avec quatre projets actifs et un projet d'alphabétisation mené à son terme. Grâce à la mobilisation de plus de 80 bénévoles actifs et au soutien de donateurs d'Europe et d'Afrique, DFD a touché plus de 4 500 bénéficiaires directs dans 6 pays d'intervention.");

  h2(doc, "Pilier Santé");
  p(doc, "Cliniques mobiles au Mayo-Sava (Extrême-Nord, Cameroun) — En cours depuis 2024. Des équipes médicales mobiles apportent des soins de base et des campagnes de vaccination dans les villages reculés de la région, où l'accès à un centre de santé fixe reste très limité.");

  h2(doc, "Pilier Éducation");
  p(doc, "Écoles pour tous à l'Est (Région de l'Est, Cameroun) — En cours depuis 2023. Construction et équipement d'écoles primaires en zones rurales, avec fournitures scolaires et appui aux enseignants locaux.");
  p(doc, "Alphabétisation des femmes (Douala, Cameroun) — Projet terminé en 2022, avec un bilan de 240 femmes formées à la lecture, à l'écriture et aux bases du micro-entrepreneuriat, leur permettant de développer une activité génératrice de revenus.");

  h2(doc, "Pilier Environnement");
  p(doc, "Reforestation communautaire (Ouest Cameroun) — En cours depuis 2024. 15 000 arbres ont été plantés avec les communautés locales pour restaurer des sols dégradés par l'agriculture intensive et l'érosion.");

  h2(doc, "Pilier Humanitaire");
  p(doc, "Accès à l'eau potable (Adamaoua, Cameroun) — En cours depuis 2024. Forage de points d'eau durables pour 12 villages, réduisant les distances de collecte d'eau et les risques sanitaires liés à l'eau non potable.");
  p(doc, "Aide d'urgence aux déplacés (Nord-Ouest / Sud-Ouest, Cameroun) — En cours depuis 2024. Distribution de kits alimentaires, de matériel d'abri et de produits d'hygiène aux familles déplacées par les tensions dans ces régions.");

  h2(doc, "Chiffres clés 2024");
  bullet(doc, "Projets actifs :", "5 (4 en cours, 1 terminé sur l'année)");
  bullet(doc, "Bénéficiaires directs :", "4 500+");
  bullet(doc, "Pays d'intervention :", "6 (Cameroun, Côte d'Ivoire, Sénégal, Ghana, France, Belgique — donateurs et zones d'action)");
  bullet(doc, "Bénévoles actifs :", "80+");

  footer(doc, DEMO_NOTE);
  doc.end();
}

/* ============================================================ 2. BILAN FINANCIER 2024 */
function financialReport() {
  const doc = newDoc("bilan-financier-2024.pdf");
  coverHeader(doc, "Bilan financier 2024", "États financiers simplifiés — exercice clos au 31 décembre 2024");

  h2(doc, "Note préliminaire");
  p(doc, "Ce document présente une synthèse simplifiée des ressources collectées et de leur affectation, à partir des données de démonstration de la plateforme. Il ne constitue pas un bilan comptable certifié. Le bilan financier audité de l'association est disponible sur demande auprès du bureau (contact@dfd.org).");

  h2(doc, "Répartition des dons par moyen de paiement");
  const methods = [
    ["Orange Money", "34 %", "Afrique de l'Ouest et Centrale"],
    ["MTN Mobile Money", "27 %", "Afrique de l'Ouest et Centrale"],
    ["Carte bancaire", "24 %", "International"],
    ["Virement SEPA", "15 %", "Europe"],
  ];
  const tableTop = doc.y + 4;
  doc.fontSize(10).font("Helvetica-Bold").fillColor(GREEN);
  doc.text("Moyen de paiement", 56, tableTop);
  doc.text("Part des dons", 300, tableTop);
  doc.text("Zone principale", 420, tableTop);
  doc.moveTo(56, tableTop + 16).lineTo(539, tableTop + 16).strokeColor(GOLD).lineWidth(1).stroke();
  let y = tableTop + 22;
  doc.font("Helvetica").fillColor(INK);
  methods.forEach(([m, pct, zone]) => {
    doc.text(m, 56, y); doc.text(pct, 300, y); doc.text(zone, 420, y);
    y += 20;
  });
  doc.y = y + 10;

  h2(doc, "Affectation des fonds par pilier d'action");
  bullet(doc, "Santé :", "28 % — cliniques mobiles, vaccination, équipement médical");
  bullet(doc, "Éducation :", "26 % — écoles, fournitures, alphabétisation");
  bullet(doc, "Environnement :", "18 % — reforestation, gestion durable des sols");
  bullet(doc, "Humanitaire :", "23 % — eau potable, aide d'urgence, abris");
  bullet(doc, "Frais de fonctionnement :", "5 % — administration, communication, plateforme");

  h2(doc, "Engagement de transparence");
  p(doc, "DFD s'engage à consacrer au moins 90 % des dons collectés à ses programmes de terrain, conformément à sa charte de transparence. Chaque donateur peut demander un état détaillé de l'usage de sa contribution.");

  footer(doc, DEMO_NOTE);
  doc.end();
}

/* ============================================================ 3. STATUTS DE L'ASSOCIATION */
function bylaws() {
  const doc = newDoc("statuts-association.pdf");
  coverHeader(doc, "Statuts de l'association", "Dreams Family of Development (DFD)");

  h2(doc, "Article 1 — Constitution et dénomination");
  p(doc, "Il est fondé, en 2018, entre les personnes adhérant aux présents statuts, une association de solidarité internationale dénommée « Dreams Family of Development » (DFD).");

  h2(doc, "Article 2 — Siège");
  p(doc, "Le siège de l'association est fixé à Turin, Italie (Via Giacomo Puccini 2). Il pourra être transféré par simple décision du conseil d'administration. L'association dispose d'un bureau terrain à Douala, Cameroun.");

  h2(doc, "Article 3 — Objet");
  p(doc, "L'association a pour objet d'accompagner les communautés du Cameroun et d'Afrique vers plus d'éducation, de santé, de dignité et de développement durable, notamment à travers des projets dans les domaines de la santé, de l'éducation, de l'environnement et de l'action humanitaire.");

  h2(doc, "Article 4 — Valeurs");
  bullet(doc, "Solidarité :", "chaque action commence par l'écoute et le respect des communautés.");
  bullet(doc, "Éducation :", "le savoir est la clé d'une émancipation durable.");
  bullet(doc, "Dignité :", "la dignité humaine est au cœur de toutes les interventions.");
  bullet(doc, "Transparence :", "les comptes et l'impact de l'association sont publics et vérifiables.");

  h2(doc, "Article 5 — Membres");
  p(doc, "L'association se compose de membres adhérents à jour de cotisation. Toute personne physique ou morale partageant les valeurs de l'association peut en faire la demande via le formulaire d'adhésion du site.");

  h2(doc, "Article 6 — Gouvernance");
  p(doc, "L'association est administrée par un conseil d'administration élu par l'assemblée générale des membres. Le conseil désigne un·e président·e, un·e responsable des projets et un·e responsable de la communication. Une équipe technique bénévole assure le développement et la maintenance des outils numériques de l'association.");

  h2(doc, "Article 7 — Ressources");
  p(doc, "Les ressources de l'association comprennent les cotisations de ses membres, les dons ponctuels ou récurrents des donateurs, ainsi que les subventions publiques ou privées qu'elle pourrait recevoir.");

  footer(doc, "Document type — à faire valider par un conseil juridique avant dépôt officiel.");
  doc.end();
}

/* ============================================================ 4. RAPPORT D'IMPACT — CAMEROUN */
function impactReport() {
  const doc = newDoc("rapport-impact-cameroun.pdf");
  coverHeader(doc, "Rapport d'impact — Cameroun", "Résultats et témoignages de terrain, édition 2024");

  h2(doc, "Vue d'ensemble");
  p(doc, "Depuis 2020, année de son premier projet éducatif au Cameroun, DFD a étendu son action à quatre régions du pays : l'Extrême-Nord, l'Est, l'Ouest, l'Adamaoua, ainsi que le Nord-Ouest et le Sud-Ouest, en plus de sa base de Douala.");

  h2(doc, "Santé — Mayo-Sava (Extrême-Nord)");
  bullet(doc, "Villages couverts :", "cliniques mobiles itinérantes");
  bullet(doc, "Services :", "consultations de base, vaccinations infantiles, sensibilisation sanitaire");

  h2(doc, "Éducation — Est & Douala");
  bullet(doc, "Écoles construites/équipées :", "programme en cours dans la Région de l'Est");
  bullet(doc, "Alphabétisation :", "240 femmes formées à Douala, avec accompagnement au micro-entrepreneuriat");

  h2(doc, "Environnement — Ouest");
  bullet(doc, "Arbres plantés :", "15 000, avec implication directe des communautés locales");
  bullet(doc, "Objectif :", "restauration des sols et lutte contre l'érosion");

  h2(doc, "Humanitaire — Adamaoua, Nord-Ouest, Sud-Ouest");
  bullet(doc, "Points d'eau :", "12 villages équipés en Adamaoua");
  bullet(doc, "Aide d'urgence :", "kits alimentaires, abris et hygiène pour les familles déplacées");

  h2(doc, "Témoignage");
  doc.fontSize(11).font("Helvetica-Oblique").fillColor(GREEN)
    .text("« Grâce à DFD, notre village dispose enfin d'une école. Mes enfants apprennent, et avec eux, c'est tout notre avenir qui grandit. »", { align: "left" });
  doc.fontSize(9.5).font("Helvetica").fillColor(MUTED).text("— Fatoumata D., communauté partenaire, Extrême-Nord, Cameroun");

  footer(doc, DEMO_NOTE);
  doc.end();
}

activityReport();
financialReport();
bylaws();
impactReport();

console.log("✔ Documents PDF générés dans", OUT_DIR);
