import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Menu, X, ArrowRight, ArrowUpRight, Mail, Phone, MapPin,
  Quote, Leaf, BookOpen, Shield, HandHeart, Stethoscope, GraduationCap,
  Users, Globe, Award, Check, Download, FileText, TrendingUp, Calendar, Sun,
  Smartphone, CreditCard, Landmark, Lock, Facebook, Instagram, Linkedin, Send, LogOut, Wallet,
} from "lucide-react";
import { api } from "./api.js";
import "./styles.css";

/* ===== signature ribbon ===== */
const Ribbon = () => (
  <div className="ribbon" aria-hidden="true" style={{
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='16'%3E%3Crect width='80' height='16' fill='%23164A3B'/%3E%3Cpath d='M0 8 L10 0 L20 8 L10 16 Z' fill='%23E7A417'/%3E%3Cpath d='M20 8 L30 0 L40 8 L30 16 Z' fill='%23B23A1E'/%3E%3Cpath d='M40 8 L50 0 L60 8 L50 16 Z' fill='%23E7A417'/%3E%3Cpath d='M60 8 L70 0 L80 8 L70 16 Z' fill='%23B23A1E'/%3E%3C/svg%3E\")",
  }} />
);

/* ===== patterned photo tile ===== */
const THEMES = {
  savanna: ["#E7A417", "#D4562E", "#B23A1E"], community: ["#2C6B57", "#164A3B", "#0E3227"],
  health: ["#D4562E", "#B23A1E", "#7E2A15"], education: ["#E7A417", "#C4860B", "#164A3B"],
  water: ["#2C6B57", "#1B7A8C", "#0E3227"], forest: ["#2C6B57", "#164A3B", "#0E3227"],
  event: ["#B23A1E", "#E7A417", "#164A3B"],
};
let UID = 0;
function Tile({ theme = "community", label, icon: Ico, className = "", img, imgFit = "contain", imgPosition = "center" }) {
  const [a, b, c] = THEMES[theme] || THEMES.community;
  const pid = useRef(`pat${++UID}`).current;
  return (
    <div className={`tile ${className}`}>
      {img ? (
        <img src={img} alt={label || ""} className="tile-img" style={{ objectFit: imgFit, objectPosition: imgPosition }} />
      ) : (
        <div className="tile-pat" style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${c} 100%)` }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.16 }} aria-hidden="true">
            <defs><pattern id={pid} width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M0 17 L17 0 L34 17 L17 34 Z" fill="none" stroke="#fff" strokeWidth="1.4" />
              <circle cx="17" cy="17" r="2.4" fill="#fff" />
            </pattern></defs>
            <rect width="100%" height="100%" fill={`url(#${pid})`} />
          </svg>
          {Ico && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,.85)" }}><Ico size={40} strokeWidth={1.5} /></div>}
        </div>
      )}
      {label && <div className="tile-cap">{label}</div>}
    </div>
  );
}

/* ===== reCaptcha (n'affiche rien en mode démo, sans clé de site) ===== */
function Recaptcha({ onToken }) {
  const ref = useRef(null);
  const siteKey = api.recaptchaSiteKey;

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (ref.current && window.grecaptcha?.render && !ref.current.dataset.rendered) {
        window.grecaptcha.render(ref.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
        });
        ref.current.dataset.rendered = "1";
      }
    };
    if (window.grecaptcha?.render) { render(); return; }
    let script = document.getElementById("recaptcha-script");
    if (!script) {
      script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true; script.defer = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", render);
    return () => script.removeEventListener("load", render);
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} style={{ margin: "16px 0" }} />;
}

/* ===== static config ===== */
const NAV = {
  home: { fr: "Accueil", en: "Home" }, about: { fr: "À propos", en: "About" },
  actions: { fr: "Nos actions", en: "Our actions" }, news: { fr: "Actualités", en: "News" },
  gallery: { fr: "Galerie", en: "Gallery" }, docs: { fr: "Documents", en: "Documents" },
  contact: { fr: "Contact", en: "Contact" }, donate: { fr: "Faire un don", en: "Donate" },
};

/* ===== routage (URL <-> page), sans dépendance externe ===== */
const PAGE_PATHS = {
  home: "/", about: "/about", actions: "/actions", news: "/news", gallery: "/gallery",
  docs: "/documents", contact: "/contact", donate: "/donate", volunteer: "/volunteer",
  membership: "/membership", legal: "/legal", privacy: "/privacy", admin: "/admin",
};
const PATH_PAGES = Object.fromEntries(Object.entries(PAGE_PATHS).map(([page, p]) => [p, page]));
const pathToPage = (pathname) => PATH_PAGES[pathname] || "home";
const CATS = [
  { id: "sante", fr: "Santé", en: "Health", color: "#B23A1E", icon: Stethoscope, theme: "health" },
  { id: "educ", fr: "Éducation", en: "Education", color: "#E7A417", icon: GraduationCap, theme: "education" },
  { id: "envt", fr: "Environnement", en: "Environment", color: "#2C6B57", icon: Leaf, theme: "forest" },
  { id: "huma", fr: "Humanitaire", en: "Humanitarian", color: "#164A3B", icon: HandHeart, theme: "water" },
];
const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0];
const mapProject = (r) => ({ id: r.id, cat: r.category, year: r.year, status: r.status, theme: r.theme, title: { fr: r.title_fr, en: r.title_en }, desc: { fr: r.desc_fr, en: r.desc_en }, place: { fr: r.place_fr, en: r.place_en } });
const mapNews = (r) => ({ id: r.id, theme: r.theme, date: r.date, author: r.author, image: r.image_url, title: { fr: r.title_fr, en: r.title_en }, desc: { fr: r.desc_fr, en: r.desc_en } });
const mapDoc = (r) => ({ id: r.id, y: r.year, size: r.size, lang: r.lang, url: r.url, t: { fr: r.title_fr, en: r.title_en } });

const VALUES = [
  { icon: Leaf, t: { fr: "Solidarité", en: "Solidarity" }, d: { fr: "Chaque action commence par l'écoute et le respect des communautés.", en: "Every action starts with listening to and respecting communities." } },
  { icon: BookOpen, t: { fr: "Éducation", en: "Education" }, d: { fr: "Le savoir est la clé d'une émancipation durable.", en: "Knowledge is the key to lasting empowerment." } },
  { icon: Shield, t: { fr: "Dignité", en: "Dignity" }, d: { fr: "La dignité humaine est au cœur de toutes nos interventions.", en: "Human dignity is at the heart of all we do." } },
  { icon: Award, t: { fr: "Transparence", en: "Transparency" }, d: { fr: "Nos comptes et impacts sont publics, vérifiables et documentés.", en: "Our accounts and impact are public, verifiable and documented." } },
];
const TEAM = [
  { n: "Nathanaël Toukea", r: { fr: "Président fondateur", en: "Founder & President" }, theme: "community", img: "/images/nathanael-toukea.jpg", imgFit: "cover", imgPosition: "center 12%" },
  { n: "Brinda Djomaha", r: { fr: "Responsable projets", en: "Head of projects" }, theme: "education" },
  { n: "Féline Minyem", r: { fr: "Communication", en: "Communications" }, theme: "savanna" },
  { n: "Kevin Toukam", r: { fr: "Responsable technique", en: "Technical lead" }, theme: "water", img: "/images/kevin-toukam.jpg", imgFit: "cover" },
];
const GAL_CATS = [{ id: "all", fr: "Tous", en: "All" }, { id: "sante", fr: "Santé", en: "Health" }, { id: "educ", fr: "Éducation", en: "Education" }, { id: "event", fr: "Événements", en: "Events" }];
const GALLERY = [
  { theme: "forest", size: "g1", cat: "envt", cap: { fr: "Reboisement, Ouest", en: "Tree planting, West" } },
  { theme: "health", size: "g2", cat: "sante", cap: { fr: "Clinique mobile", en: "Mobile clinic" } },
  { theme: "education", size: "g3", cat: "educ", cap: { fr: "Salle de classe", en: "Classroom" } },
  { theme: "community", size: "g3", cat: "event", cap: { fr: "Bénévoles DFD", en: "DFD volunteers" } },
  { theme: "water", size: "g2", cat: "huma", cap: { fr: "Point d'eau, Adamaoua", en: "Water point, Adamawa" } },
  { theme: "savanna", size: "g1", cat: "event", cap: { fr: "Village partenaire", en: "Partner village" } },
];
const COUNTRIES = [
  { code: "CM", fr: "Cameroun", en: "Cameroon", flag: "🇨🇲", zone: "africa", ops: ["orange", "mtn", "card", "paypal"] },
  { code: "CI", fr: "Côte d'Ivoire", en: "Côte d'Ivoire", flag: "🇨🇮", zone: "africa", ops: ["orange", "mtn", "card", "paypal"] },
  { code: "SN", fr: "Sénégal", en: "Senegal", flag: "🇸🇳", zone: "africa", ops: ["orange", "card", "paypal"] },
  { code: "BF", fr: "Burkina Faso", en: "Burkina Faso", flag: "🇧🇫", zone: "africa", ops: ["orange", "card", "paypal"] },
  { code: "ML", fr: "Mali", en: "Mali", flag: "🇲🇱", zone: "africa", ops: ["orange", "card", "paypal"] },
  { code: "GH", fr: "Ghana", en: "Ghana", flag: "🇬🇭", zone: "africa", ops: ["mtn", "card", "paypal"] },
  { code: "CD", fr: "RD Congo", en: "DR Congo", flag: "🇨🇩", zone: "africa", ops: ["orange", "mtn", "card", "paypal"] },
  { code: "FR", fr: "France", en: "France", flag: "🇫🇷", zone: "europe", ops: ["card", "sepa", "paypal"] },
  { code: "BE", fr: "Belgique", en: "Belgium", flag: "🇧🇪", zone: "europe", ops: ["card", "sepa", "paypal"] },
  { code: "DE", fr: "Allemagne", en: "Germany", flag: "🇩🇪", zone: "europe", ops: ["card", "sepa", "paypal"] },
  { code: "CH", fr: "Suisse", en: "Switzerland", flag: "🇨🇭", zone: "europe", ops: ["card", "paypal"] },
  { code: "OTHER", fr: "Autre pays", en: "Other country", flag: "🌍", zone: "other", ops: ["card", "paypal"] },
];
const OPS = {
  orange: { name: "Orange Money", bg: "#FF6600", sub: { fr: "Paiement mobile", en: "Mobile payment" }, icon: Smartphone, phone: true, badge: "OM" },
  mtn: { name: "MTN MoMo", bg: "#FFCC00", fg: "#1B1512", sub: { fr: "MTN Mobile Money", en: "MTN Mobile Money" }, icon: Smartphone, phone: true, badge: "MTN" },
  card: { name: { fr: "Carte bancaire", en: "Bank card" }, bg: "#164A3B", sub: { fr: "Visa · Mastercard", en: "Visa · Mastercard" }, icon: CreditCard, phone: false },
  paypal: { name: "PayPal", bg: "#003087", sub: { fr: "Paiement sécurisé PayPal", en: "Secure PayPal payment" }, icon: Wallet, phone: false, badge: "PP" },
  sepa: { name: { fr: "Virement SEPA", en: "SEPA transfer" }, bg: "#2C6B57", sub: { fr: "Prélèvement européen", en: "European direct debit" }, icon: Landmark, phone: false },
};
const FCFA = 655.957;
const opName = (o, lang) => (typeof o.name === "string" ? o.name : o.name[lang]);

/* ===================== HEADER / FOOTER ===================== */
function Header({ lang, setLang, page, go, menuOpen, setMenuOpen }) {
  const links = ["home", "about", "actions", "news", "gallery", "docs", "contact"];
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap hdr-row">
        <button className="brand" onClick={() => go("home")} aria-label="DFD accueil">
          <img src="/images/logo-dfd.jpg" alt="DFD" className="brand-mark" />
          <div style={{ textAlign: "left" }}><div className="brand-name">DFD</div><div className="brand-sub">Dreams Family of Development</div></div>
        </button>
        <nav className="nav" aria-label="Navigation principale">
          {links.map((k) => <a key={k} href="#" className={page === k ? "on" : ""} onClick={(e) => { e.preventDefault(); go(k); }}>{NAV[k][lang]}</a>)}
        </nav>
        <div className="hdr-actions">
          <button className="lang" onClick={() => setLang(lang === "fr" ? "en" : "fr")} aria-label="Langue"><Globe size={14} /> {lang.toUpperCase()}</button>
          <button className="btn btn-green" onClick={() => go("donate")} style={{ padding: "10px 18px" }}><Heart size={15} /> {NAV.donate[lang]}</button>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        {links.map((k) => <a key={k} href="#" className={page === k ? "on" : ""} onClick={(e) => { e.preventDefault(); go(k); }}>{NAV[k][lang]}</a>)}
      </nav>
    </header>
  );
}

function Footer({ lang, go }) {
  const fr = lang === "fr";
  const [email, setEmail] = useState(""); const [ok, setOk] = useState(false);
  const sub = async () => { try { await api.subscribe(email); setOk(true); setEmail(""); } catch {} };
  return (
    <footer className="footer"><div className="wrap">
      <div className="foot-grid">
        <div>
          <div className="brand"><img src="/images/logo-dfd.jpg" alt="DFD" className="brand-mark" /><div className="brand-name" style={{ color: "#fff" }}>DFD</div></div>
          <p className="foot-desc">{fr ? "Dreams Family of Development — association de solidarité internationale au service du Cameroun et de l'Afrique." : "Dreams Family of Development — an international solidarity association serving Cameroon and Africa."}</p>
          <div style={{ height: 3, width: 60, background: "var(--laterite)", borderRadius: 2 }} />
        </div>
        <div><h5>{fr ? "Nos actions" : "Our actions"}</h5><div className="foot-links">
          <a href="#" onClick={(e) => { e.preventDefault(); go("actions"); }}>{fr ? "Nos actions" : "Our actions"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("news"); }}>{fr ? "Actualités" : "News"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("gallery"); }}>{fr ? "Galerie" : "Gallery"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("docs"); }}>{fr ? "Documents" : "Documents"}</a>
        </div></div>
        <div><h5>{fr ? "Soutenir DFD" : "Support DFD"}</h5><div className="foot-links">
          <a href="#" onClick={(e) => { e.preventDefault(); go("donate"); }}>{fr ? "Faire un don" : "Donate"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("volunteer"); }}>{fr ? "Devenir bénévole" : "Volunteer"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("membership"); }}>{fr ? "Adhérer" : "Join us"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>Contact</a>
        </div></div>
        <div>
          <h5>{fr ? "Restez informé" : "Stay informed"}</h5>
          <p className="foot-desc" style={{ marginTop: 0 }}>{fr ? "Recevez nos actualités et rapports d'impact." : "Get our news and impact reports."}</p>
          <div className="news-input">
            <input placeholder="vous@exemple.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="news-btn" onClick={sub} aria-label={fr ? "S'abonner" : "Subscribe"}>{ok ? <Check size={17} /> : <Send size={17} />}</button>
          </div>
          <div className="foot-contact">
            <div><Mail size={15} /> contact@dfd.org</div>
            <div><Phone size={15} /> +39 366 332 9990</div>
            <a href="https://www.google.com/maps/search/?api=1&query=Via+Giacomo+Puccini+2%2C+Torino%2C+Italia" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9 }}><MapPin size={15} /> {fr ? "Turin (Italie)" : "Turin (Italy)"}</a>
          </div>
          <div className="socials"><a href="#" aria-label="Facebook"><Facebook size={17} /></a><a href="#" aria-label="Instagram"><Instagram size={17} /></a><a href="#" aria-label="LinkedIn"><Linkedin size={17} /></a></div>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2018–2025 DFD. {fr ? "Tous droits réservés." : "All rights reserved."}</span>
        <span style={{ display: "flex", gap: 20 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); go("admin"); }}>{fr ? "Espace admin" : "Admin"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("legal"); }}>{fr ? "Mentions légales" : "Legal notice"}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); go("privacy"); }}>{fr ? "Confidentialité" : "Privacy"}</a>
        </span>
      </div>
    </div></footer>
  );
}

/* ===================== PROJECT CARD ===================== */
function ProjectCard({ p, lang, go }) {
  const fr = lang === "fr"; const c = catOf(p.cat);
  return (
    <div className="card">
      <div className="card-img"><Tile theme={c.theme} /><span className="tag">{c[lang]}</span>
        <span className={`tag-status ${p.status === "done" ? "st-done" : "st-progress"}`}>{p.status === "done" ? (fr ? "Terminé" : "Completed") : (fr ? "En cours" : "Ongoing")}</span>
      </div>
      <div className="card-body">
        <div className="card-meta"><MapPin size={13} /> {p.place[lang]} · {p.year}</div>
        <h3>{p.title[lang]}</h3><p>{p.desc[lang]}</p>
        <div className="card-foot"><a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go("donate"); }}>{fr ? "Soutenir ce projet" : "Support this project"} <ArrowUpRight size={15} /></a></div>
      </div>
    </div>
  );
}

/* ===================== HOME ===================== */
const HERO_SLIDES = [
  [
    { theme: "community", icon: GraduationCap, cap: { fr: "Écoliers, Est Cameroun", en: "Pupils, East Cameroon" } },
    { theme: "health", icon: Stethoscope, cap: { fr: "Soins", en: "Care" } },
    { theme: "forest", icon: Leaf, cap: { fr: "Reboisement", en: "Reforestation" } },
  ],
  [
    { theme: "water", icon: HandHeart, cap: { fr: "Accès à l'eau, Adamaoua", en: "Clean water, Adamawa" } },
    { theme: "education", icon: BookOpen, cap: { fr: "Alphabétisation, Douala", en: "Literacy, Douala" } },
    { theme: "community", icon: Users, cap: { fr: "Bénévoles sur le terrain", en: "Volunteers on the ground" } },
  ],
  [
    { theme: "savanna", icon: Shield, cap: { fr: "Aide d'urgence, Nord-Ouest" , en: "Emergency aid, North-West" } },
    { theme: "health", icon: Award, cap: { fr: "Impact durable", en: "Lasting impact" } },
    { theme: "forest", icon: Sun, cap: { fr: "Village partenaire", en: "Partner village" } },
  ],
];
function Home({ lang, go, projects }) {
  const fr = lang === "fr";
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const stats = [
    { icon: Award, num: "4+", lab: { fr: "Projets menés", en: "Projects run" } },
    { icon: Users, num: "4 500+", lab: { fr: "Bénéficiaires directs", en: "Direct beneficiaries" } },
    { icon: Globe, num: "6", lab: { fr: "Pays d'intervention", en: "Countries" } },
    { icon: HandHeart, num: "80+", lab: { fr: "Bénévoles actifs", en: "Active volunteers" } },
  ];
  return (
    <>
      <section className="hero"><div className="wrap hero-grid">
        <div>
          <span className="pill"><Sun size={14} /> {fr ? "Association humanitaire · Cameroun & Afrique" : "Humanitarian association · Cameroon & Africa"}</span>
          <h1 style={{ marginTop: 22 }}>{fr ? "Ensemble," : "Together,"}<br />{fr ? "cultivons l'espoir." : "let's grow hope."}</h1>
          <p className="lead" style={{ marginTop: 22 }}>{fr ? "Depuis 2018, DFD accompagne les communautés du Cameroun et d'Afrique vers l'éducation, la santé et la dignité. Chaque geste compte." : "Since 2018, DFD has supported communities across Cameroon and Africa towards education, health and dignity. Every gesture counts."}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={() => go("donate")}>{fr ? "Soutenir maintenant" : "Support now"} <Heart size={16} /></button>
            <button className="btn btn-ghost-light" onClick={() => go("actions")}>{fr ? "Découvrir nos actions" : "See our actions"} <ArrowRight size={16} /></button>
          </div>
        </div>
        <div>
          <div className="hero-photos" key={slide}>
            {HERO_SLIDES[slide].map((t, i) => <Tile key={i} theme={t.theme} icon={t.icon} label={t.cap[lang]} />)}
          </div>
          <div className="hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`hero-dot ${i === slide ? "on" : ""}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </div></section>

      <div className="wrap"><div className="stats">
        {stats.map((s, i) => <div className="stat" key={i}><div className="ico"><s.icon size={19} /></div><div className="num">{s.num}</div><div className="lab">{s.lab[lang]}</div></div>)}
      </div></div>

      <section className="section"><div className="wrap">
        <div className="shead"><div><span className="eyebrow">{fr ? "Nos champs d'action" : "Our fields of action"}</span>
          <h2 style={{ marginTop: 12 }}>{fr ? "Quatre piliers pour une action durable et solidaire." : "Four pillars for lasting, united action."}</h2></div></div>
        <div className="pillars">{CATS.map((c) => (
          <div className="pillar" key={c.id}><div className="ico" style={{ background: c.color }}><c.icon size={22} /></div><h3>{c[lang]}</h3>
            <p>{c.id === "sante" ? (fr ? "Cliniques mobiles, vaccinations et accès aux soins." : "Mobile clinics, vaccinations and access to care.")
              : c.id === "educ" ? (fr ? "Écoles, fournitures et alphabétisation." : "Schools, supplies and literacy.")
              : c.id === "envt" ? (fr ? "Reforestation et gestion durable des sols." : "Reforestation and sustainable soil management.")
              : (fr ? "Eau potable, aide d'urgence et abris." : "Clean water, emergency aid and shelter.")}</p></div>
        ))}</div>
      </div></section>

      <Ribbon />

      <section className="section" style={{ background: "var(--cream-deep)" }}><div className="wrap">
        <div className="shead"><div><span className="eyebrow gold">{fr ? "Projets récents" : "Recent projects"}</span><h2 style={{ marginTop: 12 }}>{fr ? "Nos projets" : "Our projects"}</h2></div>
          <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go("actions"); }}>{fr ? "Tous les projets" : "All projects"} <ArrowRight size={16} /></a></div>
        <div className="cards">{projects.slice(0, 3).map((p) => <ProjectCard key={p.id} p={p} lang={lang} go={go} />)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="shead"><div><span className="eyebrow">{fr ? "Sur le terrain" : "On the ground"}</span>
          <h2 style={{ marginTop: 12 }}>{fr ? "Des visages, des histoires, un impact réel." : "Faces, stories, real impact."}</h2></div>
          <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go("gallery"); }}>{fr ? "Voir la galerie" : "View gallery"} <ArrowRight size={16} /></a></div>
        <div className="gallery" style={{ marginTop: 24 }}>{GALLERY.map((g, i) => <Tile key={i} theme={g.theme} className={g.size} label={g.cap[lang]} />)}</div>
      </div></section>

      <section className="testi"><div className="wrap">
        <Quote size={44} color="var(--gold)" />
        <q style={{ marginTop: 16 }}>{fr ? "« Grâce à DFD, notre village dispose enfin d'une école. Mes enfants apprennent, et avec eux, c'est tout notre avenir qui grandit. »" : "\u201cThanks to DFD, our village finally has a school. My children are learning — and with them, our whole future is growing.\u201d"}</q>
        <div className="testi-who"><div className="testi-av">F</div><div><div style={{ fontWeight: 700 }}>Fatoumata D.</div><div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{fr ? "Communauté partenaire · Extrême-Nord, Cameroun" : "Partner community · Far North, Cameroon"}</div></div></div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="center" style={{ marginBottom: 40 }}><span className="eyebrow">{fr ? "Soutenir DFD" : "Support DFD"}</span><h2 style={{ marginTop: 12 }}>{fr ? "Trois façons d'agir avec nous." : "Three ways to act with us."}</h2></div>
        <div className="ways">{[
          { icon: Heart, color: "var(--laterite)", t: { fr: "Faire un don", en: "Donate" }, d: { fr: "Un don ponctuel ou mensuel finance directement nos projets sur le terrain.", en: "A one-time or monthly gift directly funds our projects on the ground." }, page: "donate" },
          { icon: HandHeart, color: "var(--gold)", t: { fr: "Devenir bénévole", en: "Volunteer" }, d: { fr: "Offrez du temps, des compétences et rejoignez une communauté engagée.", en: "Give time and skills, and join a committed community." }, page: "volunteer" },
          { icon: Users, color: "var(--green)", t: { fr: "Adhérer", en: "Join us" }, d: { fr: "Devenez membre et participez aux décisions et à la vie de DFD.", en: "Become a member and take part in DFD's decisions and life." }, page: "membership" },
        ].map((w, i) => (
          <div className="way" key={i}><div className="ico" style={{ background: w.color }}><w.icon size={24} /></div><h3>{w.t[lang]}</h3><p>{w.d[lang]}</p>
            <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go(w.page); }}>{fr ? "En savoir plus" : "Learn more"} <ArrowRight size={15} /></a></div>
        ))}</div>
      </div></section>
    </>
  );
}

/* ===================== ABOUT ===================== */
function About({ lang }) {
  const fr = lang === "fr";
  const hist = [
    { yr: "2018", t: { fr: "Création de DFD à Bruxelles autour de trois familles fondatrices.", en: "DFD founded in Brussels by three founding families." } },
    { yr: "2020", t: { fr: "Premier projet éducatif au Cameroun : construction de salles de classe.", en: "First education project in Cameroon: building classrooms." } },
    { yr: "2022", t: { fr: "Ouverture d'un pôle santé avec des cliniques mobiles.", en: "Health hub launched with mobile clinics." } },
    { yr: "2024", t: { fr: "Plus de 4 500 bénéficiaires directs, dans 6 pays.", en: "Over 4,500 direct beneficiaries across 6 countries." } },
  ];
  return (
    <>
      <section className="section tight"><div className="wrap">
        <span className="eyebrow">{fr ? "Qui sommes-nous ?" : "Who we are"}</span>
        <h1 style={{ fontSize: "clamp(34px,5vw,54px)", marginTop: 14, maxWidth: 780 }}>{fr ? "Une association née d'un rêve partagé." : "An association born from a shared dream."}</h1>
        <p className="lead" style={{ marginTop: 18, maxWidth: 760 }}>{fr ? "DFD (Dreams Family of Development) est une association fondée en 2018 par une famille de bénévoles convaincus que l'action collective peut transformer des vies. Depuis, nous accompagnons des communautés au Cameroun et à travers l'Afrique vers plus d'éducation, de santé et de dignité." : "DFD (Dreams Family of Development) is an association founded in 2018 by a family of volunteers convinced that collective action can transform lives. Since then, we have supported communities in Cameroon and across Africa."}</p>
      </div></section>
      <div className="wrap"><div className="hist">
        <Tile theme="community" label={fr ? "Nos bénévoles sur le terrain" : "Our volunteers in the field"} icon={Users} />
        <div><h2 style={{ fontSize: 28, marginBottom: 22 }}>{fr ? "Notre histoire" : "Our story"}</h2>
          <div className="timeline">{hist.map((h, i) => <div className="tl" key={i}><div className="yr">{h.yr}</div><p>{h.t[lang]}</p></div>)}</div></div>
      </div></div>
      <section className="section"><div className="wrap"><h2 style={{ fontSize: 32, marginBottom: 30 }}>{fr ? "Nos valeurs" : "Our values"}</h2>
        <div className="values">{VALUES.map((v, i) => <div className="val" key={i}><div className="ico"><v.icon size={20} /></div><h4>{v.t[lang]}</h4><p>{v.d[lang]}</p></div>)}</div>
      </div></section>
      <section className="section" style={{ background: "var(--cream-deep)" }}><div className="wrap"><h2 style={{ fontSize: 32, marginBottom: 30 }}>{fr ? "L'équipe" : "The team"}</h2>
        <div className="team">{TEAM.map((m, i) => <div className="member" key={i}><Tile theme={m.theme} className="ph" icon={Users} img={m.img} imgFit={m.imgFit} imgPosition={m.imgPosition} /><h4>{m.n}</h4><div className="role">{m.r[lang]}</div></div>)}</div>
      </div></section>
    </>
  );
}

/* ===================== ACTIONS / NEWS / GALLERY / DOCS ===================== */
function Actions({ lang, go, projects }) {
  const fr = lang === "fr"; const [filter, setFilter] = useState("all");
  const list = filter === "all" ? projects : projects.filter((p) => p.cat === filter);
  return (
    <section className="section tight"><div className="wrap">
      <span className="eyebrow">{fr ? "Nos actions" : "Our actions"}</span>
      <h1 style={{ fontSize: "clamp(34px,5vw,54px)", marginTop: 14 }}>{fr ? "Chaque projet, une histoire." : "Every project, a story."}</h1>
      <div className="filters" style={{ marginTop: 30 }}>
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>{fr ? "Tous" : "All"}</button>
        {CATS.map((c) => <button key={c.id} className={`chip ${filter === c.id ? "on" : ""}`} onClick={() => setFilter(c.id)}>{c[lang]}</button>)}
      </div>
      <div className="cards" style={{ marginTop: 22 }}>{list.map((p) => <ProjectCard key={p.id} p={p} lang={lang} go={go} />)}</div>
    </div></section>
  );
}
function News({ lang, news }) {
  const fr = lang === "fr";
  return (
    <section className="section tight"><div className="wrap">
      <span className="eyebrow">{fr ? "Actualités" : "News"}</span>
      <h1 style={{ fontSize: "clamp(34px,5vw,54px)", marginTop: 14 }}>{fr ? "Actualités" : "Latest news"}</h1>
      <div className="news" style={{ marginTop: 34 }}>{news.map((a) => (
        <article className="article" key={a.id}><Tile theme={a.theme} img={a.image} className="img" /><div className="body">
          <div className="meta"><span style={{ display: "flex", gap: 5, alignItems: "center" }}><Calendar size={13} /> {a.date}</span><span style={{ display: "flex", gap: 5, alignItems: "center" }}><Users size={13} /> {a.author}</span></div>
          <h3>{a.title[lang]}</h3><p>{a.desc[lang]}</p></div></article>
      ))}</div>
    </div></section>
  );
}
function Gallery({ lang }) {
  const fr = lang === "fr"; const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const list = filter === "all" ? GALLERY : GALLERY.filter((g) => g.cat === filter);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section className="section tight"><div className="wrap">
      <span className="eyebrow">{fr ? "Galerie" : "Gallery"}</span>
      <h1 style={{ fontSize: "clamp(34px,5vw,54px)", marginTop: 14 }}>{fr ? "Nos moments partagés." : "Our shared moments."}</h1>
      <div className="filters" style={{ marginTop: 30, marginBottom: 26 }}>{GAL_CATS.map((c) => <button key={c.id} className={`chip ${filter === c.id ? "on" : ""}`} onClick={() => setFilter(c.id)}>{c[lang]}</button>)}</div>
      <div className="gallery">{list.map((g, i) => (
        <div key={i} onClick={() => setLightbox(g)} role="button" tabIndex={0} style={{ cursor: "zoom-in" }} onKeyDown={(e) => e.key === "Enter" && setLightbox(g)}>
          <Tile theme={g.theme} className={g.size} label={g.cap[lang]} />
        </div>
      ))}</div>
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,.88)", display: "grid", placeItems: "center", zIndex: 999, padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, width: "100%" }}>
            <div style={{ position: "relative", height: 420, borderRadius: 18, overflow: "hidden" }}>
              <Tile theme={lightbox.theme} label={lightbox.cap[lang]} className="lightbox-tile" />
            </div>
            <button className="btn btn-ghost-light" style={{ marginTop: 16 }} onClick={() => setLightbox(null)}><X size={16} /> {fr ? "Fermer" : "Close"}</button>
          </div>
        </div>
      )}
    </div></section>
  );
}
function Documents({ lang, docs }) {
  const fr = lang === "fr";
  return (
    <section className="section tight"><div className="wrap">
      <span className="eyebrow">Documents</span>
      <h1 style={{ fontSize: "clamp(34px,5vw,54px)", marginTop: 14 }}>{fr ? "Transparence & documents." : "Transparency & documents."}</h1>
      <p className="lead" style={{ marginTop: 16 }}>{fr ? "Nos rapports d'activité, statuts et bilans financiers, librement téléchargeables." : "Our activity reports, bylaws and financial statements, free to download."}</p>
      <div className="grid" style={{ marginTop: 34, gap: 12 }}>{docs.map((d) => (
        <div className="doc" key={d.id}><div className="di"><FileText size={20} /></div>
          <div><h4>{d.t[lang]}</h4><div className="dmeta">PDF · {d.size} · {d.y} · {d.lang}</div></div>
          {d.url && d.url !== "#" ? (
            <a className="dl" href={d.url} target="_blank" rel="noopener noreferrer" download><Download size={16} /> {fr ? "Télécharger" : "Download"}</a>
          ) : (
            <span className="dl" style={{ opacity: .5, cursor: "not-allowed" }}><Download size={16} /> {fr ? "Indisponible" : "Unavailable"}</span>
          )}</div>
      ))}</div>
    </div></section>
  );
}

/* ===================== CONTACT ===================== */
function Contact({ lang }) {
  const fr = lang === "fr";
  const [f, setF] = useState({ name: "", email: "", subject: "", body: "" });
  const [sent, setSent] = useState(false); const [err, setErr] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const submit = async () => {
    setErr("");
    try { await api.contact({ ...f, recaptchaToken }); setSent(true); } catch (e) { setErr(e.message); }
  };
  return (
    <section className="section tight"><div className="wrap contact-grid">
      <div>
        <span className="eyebrow gold">Contact</span>
        <h1 style={{ fontSize: "clamp(32px,4.5vw,48px)", marginTop: 12 }}>{fr ? "Parlons-nous." : "Let's talk."}</h1>
        <p className="lead" style={{ margin: "16px 0 26px" }}>{fr ? "Une question, un partenariat, une envie de contribuer ? Notre équipe vous répond sous 48h." : "A question, a partnership, an urge to help? Our team replies within 48h."}</p>
        <div className="cinfo"><div className="ci"><Mail size={17} /></div> contact@dfd.org</div>
        <div className="cinfo"><div className="ci"><Phone size={17} /></div> +39 366 332 9990</div>
        <a className="cinfo" href="https://www.google.com/maps/search/?api=1&query=Via+Giacomo+Puccini+2%2C+Torino%2C+Italia" target="_blank" rel="noopener noreferrer"><div className="ci"><MapPin size={17} /></div> Via Giacomo Puccini 2, Torino</a>
        <div className="cinfo"><div className="ci"><MapPin size={17} /></div> {fr ? "Bureau terrain · Douala, Cameroun" : "Field office · Douala, Cameroon"}</div>
        <div style={{ height: 200, marginTop: 8 }}>
          <Tile img="/images/bureau-turin.jpg" label={fr ? "Notre bureau, Turin" : "Our office, Turin"} className="office-tile" />
        </div>
        <div className="map">
          <iframe
            title="DFD — Turin"
            src="https://www.google.com/maps?q=Via+Giacomo+Puccini+2,+Torino,+Italia&output=embed"
            width="100%" height="100%" style={{ border: 0 }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <div className="form">
        {sent ? (
          <div style={{ textAlign: "center", padding: "40px 10px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "#fff" }}><Check size={28} /></div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>{fr ? "Merci pour votre message !" : "Thanks for your message!"}</h3>
            <p style={{ color: "var(--muted)" }}>{fr ? "Notre équipe vous répondra sous 48h." : "Our team will reply within 48h."}</p>
          </div>
        ) : (<>
          {err && <div className="err">{err}</div>}
          <div className="field"><label>{fr ? "Nom complet" : "Full name"}</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="field"><label>{fr ? "Sujet" : "Subject"}</label>
            <select value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
              <option>{fr ? "Demande d'information" : "Information request"}</option><option>{fr ? "Partenariat" : "Partnership"}</option><option>Presse</option><option>{fr ? "Bénévolat" : "Volunteering"}</option></select></div>
          <div className="field"><label>{fr ? "Votre message" : "Your message"}</label><textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
          <Recaptcha onToken={setRecaptchaToken} />
          <button className="btn btn-green btn-block" onClick={submit}>{fr ? "Envoyer" : "Send"}</button>
        </>)}
      </div>
    </div></section>
  );
}

/* ===================== DONATE ===================== */
function Donate({ lang }) {
  const fr = lang === "fr";
  const [freq, setFreq] = useState("once"), [amount, setAmount] = useState(30), [custom, setCustom] = useState("");
  const [country, setCountry] = useState("CM"), [method, setMethod] = useState("orange");
  const [phone, setPhone] = useState(""), [name, setName] = useState(""), [email, setEmail] = useState(""), [anon, setAnon] = useState(false);
  const [result, setResult] = useState(null), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [paypalReturn, setPaypalReturn] = useState(null);
  const c = COUNTRIES.find((x) => x.code === country);
  useEffect(() => { if (!c.ops.includes(method)) setMethod(c.ops[0]); }, [country]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("paypal");
    if (status) {
      setPaypalReturn({ status, ref: params.get("ref") });
      window.history.replaceState({}, "", "/donate");
    }
  }, []);
  const value = custom ? Math.max(0, parseInt(custom) || 0) : amount;
  const fcfa = Math.round(value * FCFA); const op = OPS[method];

  const submit = async () => {
    if (value < 1) return; setErr(""); setLoading(true);
    try {
      const r = await api.donate({ amountEur: value, frequency: freq, country, method, name, email, phone, anonymous: anon, recaptchaToken });
      // En mode "live", Orange renvoie une URL de paiement -> redirection.
      if (r.payment?.mode === "live" && r.payment?.payment_url) { window.location.href = r.payment.payment_url; return; }
      setResult(r);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  if (paypalReturn) {
    const ok = paypalReturn.status === "success";
    return (
      <section className="section tight"><div className="wrap" style={{ maxWidth: 620 }}>
        <div className="success" style={ok ? undefined : { background: "var(--laterite)" }}>
          <div className="ci">{ok ? <Check size={34} /> : <X size={34} />}</div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>
            {ok ? (fr ? "Merci du fond du cœur !" : "Thank you from the heart!") : (fr ? "Paiement non abouti" : "Payment not completed")}
          </h2>
          <p style={{ color: "rgba(255,255,255,.9)", marginTop: 12, fontSize: 16 }}>
            {ok
              ? (fr ? "Votre paiement PayPal a été confirmé." : "Your PayPal payment has been confirmed.")
              : (fr ? "Le paiement PayPal a été annulé ou a échoué. Vous n'avez rien été débité." : "The PayPal payment was cancelled or failed. You haven't been charged.")}
          </p>
          {paypalReturn.ref && <p style={{ color: "rgba(255,255,255,.75)", marginTop: 10, fontSize: 14 }}>{fr ? "Référence" : "Reference"} : <strong>{paypalReturn.ref}</strong></p>}
          <button className="btn btn-gold" style={{ marginTop: 22 }} onClick={() => setPaypalReturn(null)}>{fr ? "Retour au don" : "Back to donation"}</button>
        </div>
      </div></section>
    );
  }

  if (result) {
    return (
      <section className="section tight"><div className="wrap" style={{ maxWidth: 620 }}>
        <div className="success">
          <div className="ci"><Check size={34} /></div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>{fr ? "Merci du fond du cœur !" : "Thank you from the heart!"}</h2>
          <p style={{ color: "rgba(255,255,255,.9)", marginTop: 12, fontSize: 16 }}>
            {fr ? `Votre don ${freq === "monthly" ? "mensuel " : ""}de ${value} €` : `Your ${freq === "monthly" ? "monthly " : ""}gift of €${value}`}
            {c.zone === "africa" ? ` (${fcfa.toLocaleString("fr-FR")} FCFA)` : ""} {fr ? "via" : "via"} {opName(op, lang)} {fr ? "est enregistré." : "is recorded."}
          </p>
          <p style={{ color: "rgba(255,255,255,.75)", marginTop: 10, fontSize: 14 }}>{fr ? "Référence" : "Reference"} : <strong>{result.reference}</strong></p>
          <p style={{ color: "rgba(255,255,255,.7)", marginTop: 14, fontSize: 13.5 }}>{result.payment?.message || (fr ? "Paiement confirmé." : "Payment confirmed.")}</p>
          <button className="btn btn-gold" style={{ marginTop: 22 }} onClick={() => setResult(null)}>{fr ? "Faire un autre don" : "Give again"}</button>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section tight"><div className="wrap donate-grid">
      <div>
        <span className="eyebrow gold">{fr ? "Faire un don" : "Donate"}</span>
        <h1 style={{ fontSize: "clamp(32px,4.5vw,50px)", marginTop: 12 }}>{fr ? "Votre don a un impact réel." : "Your gift has a real impact."}</h1>
        <p className="lead" style={{ margin: "18px 0 24px" }}>{fr ? "Grâce à vos dons, nous finançons nos projets d'éducation, de santé, d'environnement et d'humanitaire au Cameroun et en Afrique." : "Thanks to your gifts, we fund our education, health, environment and humanitarian projects in Cameroon and Africa."}</p>
        <div className="assure"><div className="ci"><Check size={15} /></div>{fr ? "Reçu fiscal automatique" : "Automatic tax receipt"}</div>
        <div className="assure"><div className="ci"><Lock size={15} /></div>{fr ? "Paiement 100 % sécurisé" : "100% secure payment"}</div>
        <div className="assure"><div className="ci"><Smartphone size={15} /></div>{fr ? "Orange Money & MTN MoMo pour l'Afrique" : "Orange Money & MTN MoMo for Africa"}</div>
        <div className="assure"><div className="ci"><Award size={15} /></div>{fr ? "Transparence complète sur l'usage des fonds" : "Full transparency on how funds are used"}</div>
      </div>

      <div className="dcard">
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Fréquence" : "Frequency"}</label>
          <div className="seg"><button className={freq === "once" ? "on" : ""} onClick={() => setFreq("once")}>{fr ? "Ponctuel" : "One-time"}</button><button className={freq === "monthly" ? "on" : ""} onClick={() => setFreq("monthly")}>{fr ? "Mensuel" : "Monthly"}</button></div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Montant (€)" : "Amount (€)"}</label>
          <div className="amts">{[10, 30, 50, 100, 250].map((a) => <button key={a} className={`amt ${!custom && amount === a ? "on" : ""}`} onClick={() => { setAmount(a); setCustom(""); }}>{a} €</button>)}
            <input className="amt" style={{ textAlign: "center" }} placeholder={fr ? "Autre" : "Other"} value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" /></div>
          {c.zone === "africa" && value > 0 && <div className="fcfa">≈ {fcfa.toLocaleString("fr-FR")} FCFA</div>}
        </div>
        <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Votre pays" : "Your country"}</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>{COUNTRIES.map((x) => <option key={x.code} value={x.code}>{x.flag} {x[lang]}</option>)}</select></div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Moyen de paiement" : "Payment method"}</label>
          <div className="methods">{c.ops.map((o) => { const O = OPS[o]; return (
            <button key={o} className={`method ${method === o ? "on" : ""}`} onClick={() => setMethod(o)}>
              <div className="mi" style={{ background: O.bg, color: O.fg || "#fff" }}>{O.badge ? <span style={{ fontSize: 11, fontWeight: 800 }}>{O.badge}</span> : <O.icon size={18} />}</div>
              <div><div className="mt">{opName(O, lang)}</div><div className="ms">{O.sub[lang]}</div></div><div className="radio" /></button>
          ); })}</div>
        </div>
        {op.phone && <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Numéro " : "Number "}{typeof op.name === "string" ? op.name : ""}</label><input type="tel" placeholder="+237 6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field" style={{ marginBottom: 10 }}><label>{fr ? "Nom complet" : "Full name"}</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field" style={{ marginBottom: 10 }}><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, margin: "6px 0 18px", cursor: "pointer" }}><input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} style={{ width: 17, height: 17 }} />{fr ? "Faire un don anonyme" : "Donate anonymously"}</label>
        <Recaptcha onToken={setRecaptchaToken} />
        {err && <div className="err">{err}</div>}
        <button className="btn btn-green btn-block" onClick={submit} disabled={loading}>
          <Lock size={16} /> {loading ? (fr ? "Traitement…" : "Processing…") : (fr ? `Donner ${value} €${freq === "monthly" ? " / mois" : ""}` : `Give €${value}${freq === "monthly" ? " / mo" : ""}`)} {!loading && (fr ? "via " : "via ")}{!loading && opName(op, lang)}
        </button>
      </div>
    </div></section>
  );
}

/* ===================== VOLUNTEER (bénévolat) ===================== */
const VOL_INTERESTS = [
  { id: "sante", fr: "Santé", en: "Health" },
  { id: "educ", fr: "Éducation", en: "Education" },
  { id: "envt", fr: "Environnement", en: "Environment" },
  { id: "huma", fr: "Humanitaire", en: "Humanitarian" },
  { id: "event", fr: "Événements", en: "Events" },
  { id: "comm", fr: "Communication", en: "Communications" },
];
function Volunteer({ lang }) {
  const fr = lang === "fr";
  const [f, setF] = useState({ name: "", email: "", phone: "", availability: "", message: "" });
  const [interests, setInterests] = useState([]);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [sent, setSent] = useState(false), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const toggle = (id) => setInterests((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    if (!f.name || !f.email) { setErr(fr ? "Nom et e-mail requis" : "Name and email required"); return; }
    setErr(""); setLoading(true);
    try { await api.volunteer({ ...f, interests, recaptchaToken }); setSent(true); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <section className="section tight"><div className="wrap" style={{ maxWidth: 620 }}>
        <div className="success">
          <div className="ci"><Check size={34} /></div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>{fr ? "Merci pour votre engagement !" : "Thank you for stepping up!"}</h2>
          <p style={{ color: "rgba(255,255,255,.9)", marginTop: 12, fontSize: 16 }}>{fr ? "Votre candidature a été enregistrée. Notre équipe vous recontactera prochainement." : "Your application has been recorded. Our team will reach out soon."}</p>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section tight"><div className="wrap donate-grid">
      <div>
        <span className="eyebrow gold">{fr ? "Devenir bénévole" : "Volunteer"}</span>
        <h1 style={{ fontSize: "clamp(32px,4.5vw,50px)", marginTop: 12 }}>{fr ? "Offrez du temps, changez des vies." : "Give time, change lives."}</h1>
        <p className="lead" style={{ margin: "18px 0 24px" }}>{fr ? "Rejoignez une communauté engagée : sur le terrain, en ligne ou lors de nos événements." : "Join a committed community: on the ground, online, or at our events."}</p>
        <div className="assure"><div className="ci"><HandHeart size={15} /></div>{fr ? "Missions variées selon vos compétences" : "Varied missions matching your skills"}</div>
        <div className="assure"><div className="ci"><Users size={15} /></div>{fr ? "Communauté de 80+ bénévoles actifs" : "Community of 80+ active volunteers"}</div>
      </div>
      <div className="dcard">
        {err && <div className="err">{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field" style={{ marginBottom: 10 }}><label>{fr ? "Nom complet" : "Full name"}</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="field" style={{ marginBottom: 10 }}><label>E-mail</label><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Téléphone" : "Phone"}</label><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Domaines d'intérêt" : "Areas of interest"}</label>
          <div className="filters">{VOL_INTERESTS.map((it) => (
            <button key={it.id} type="button" className={`chip ${interests.includes(it.id) ? "on" : ""}`} onClick={() => toggle(it.id)}>{it[lang]}</button>
          ))}</div>
        </div>
        <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Disponibilités" : "Availability"}</label><input value={f.availability} onChange={(e) => setF({ ...f, availability: e.target.value })} placeholder={fr ? "Ex : week-ends, soirées…" : "E.g. weekends, evenings…"} /></div>
        <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Votre message" : "Your message"}</label><textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
        <Recaptcha onToken={setRecaptchaToken} />
        <button className="btn btn-green btn-block" onClick={submit} disabled={loading}>{loading ? (fr ? "Envoi…" : "Sending…") : (fr ? "Envoyer ma candidature" : "Submit application")}</button>
      </div>
    </div></section>
  );
}

/* ===================== MEMBERSHIP (adhésion) ===================== */
function Membership({ lang }) {
  const fr = lang === "fr";
  const [amount, setAmount] = useState(25), [custom, setCustom] = useState("");
  const [country, setCountry] = useState("CM"), [method, setMethod] = useState("orange");
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [result, setResult] = useState(null), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const [paypalReturn, setPaypalReturn] = useState(null);
  const c = COUNTRIES.find((x) => x.code === country);
  useEffect(() => { if (!c.ops.includes(method)) setMethod(c.ops[0]); }, [country]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("paypal");
    if (status) {
      setPaypalReturn({ status, ref: params.get("ref") });
      window.history.replaceState({}, "", "/membership");
    }
  }, []);
  const value = custom ? Math.max(0, parseInt(custom) || 0) : amount;
  const fcfa = Math.round(value * FCFA); const op = OPS[method];

  const submit = async () => {
    if (value < 1) return;
    if (!name || !email) { setErr(fr ? "Nom et e-mail requis" : "Name and email required"); return; }
    if (!accepted) { setErr(fr ? "Vous devez accepter les statuts" : "You must accept the bylaws"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await api.membership({ amountEur: value, country, method, name, email, phone, acceptedBylaws: accepted, recaptchaToken });
      if (r.payment?.mode === "live" && r.payment?.payment_url) { window.location.href = r.payment.payment_url; return; }
      setResult(r);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  if (paypalReturn) {
    const ok = paypalReturn.status === "success";
    return (
      <section className="section tight"><div className="wrap" style={{ maxWidth: 620 }}>
        <div className="success" style={ok ? undefined : { background: "var(--laterite)" }}>
          <div className="ci">{ok ? <Check size={34} /> : <X size={34} />}</div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>
            {ok ? (fr ? "Bienvenue dans la famille DFD !" : "Welcome to the DFD family!") : (fr ? "Paiement non abouti" : "Payment not completed")}
          </h2>
          <p style={{ color: "rgba(255,255,255,.9)", marginTop: 12, fontSize: 16 }}>
            {ok
              ? (fr ? "Votre paiement PayPal a été confirmé." : "Your PayPal payment has been confirmed.")
              : (fr ? "Le paiement PayPal a été annulé ou a échoué. Vous n'avez rien été débité." : "The PayPal payment was cancelled or failed. You haven't been charged.")}
          </p>
          {paypalReturn.ref && <p style={{ color: "rgba(255,255,255,.75)", marginTop: 10, fontSize: 14 }}>{fr ? "Référence" : "Reference"} : <strong>{paypalReturn.ref}</strong></p>}
          <button className="btn btn-gold" style={{ marginTop: 22 }} onClick={() => setPaypalReturn(null)}>{fr ? "Retour à l'adhésion" : "Back to membership"}</button>
        </div>
      </div></section>
    );
  }

  if (result) {
    return (
      <section className="section tight"><div className="wrap" style={{ maxWidth: 620 }}>
        <div className="success">
          <div className="ci"><Check size={34} /></div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>{fr ? "Bienvenue dans la famille DFD !" : "Welcome to the DFD family!"}</h2>
          <p style={{ color: "rgba(255,255,255,.9)", marginTop: 12, fontSize: 16 }}>
            {fr ? `Votre adhésion de ${value} €` : `Your ${value} € membership`}
            {c.zone === "africa" ? ` (${fcfa.toLocaleString("fr-FR")} FCFA)` : ""} {fr ? "via" : "via"} {opName(op, lang)} {fr ? "est enregistrée." : "is recorded."}
          </p>
          <p style={{ color: "rgba(255,255,255,.75)", marginTop: 10, fontSize: 14 }}>{fr ? "Référence" : "Reference"} : <strong>{result.reference}</strong></p>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section tight"><div className="wrap donate-grid">
      <div>
        <span className="eyebrow gold">{fr ? "Adhérer à DFD" : "Join DFD"}</span>
        <h1 style={{ fontSize: "clamp(32px,4.5vw,50px)", marginTop: 12 }}>{fr ? "Devenez membre de l'association." : "Become a member of the association."}</h1>
        <p className="lead" style={{ margin: "18px 0 24px" }}>{fr ? "En adhérant, vous participez aux décisions de DFD et soutenez durablement nos actions." : "By joining, you take part in DFD's decisions and sustainably support our work."}</p>
        <div className="assure"><div className="ci"><Check size={15} /></div>{fr ? "Cotisation annuelle" : "Annual dues"}</div>
        <div className="assure"><div className="ci"><Users size={15} /></div>{fr ? "Droit de vote à l'assemblée générale" : "Voting rights at the general assembly"}</div>
      </div>
      <div className="dcard">
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Cotisation (€ / an)" : "Dues (€ / year)"}</label>
          <div className="amts">{[15, 25, 50, 100].map((a) => <button key={a} className={`amt ${!custom && amount === a ? "on" : ""}`} onClick={() => { setAmount(a); setCustom(""); }}>{a} €</button>)}
            <input className="amt" style={{ textAlign: "center" }} placeholder={fr ? "Autre" : "Other"} value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" /></div>
          {c.zone === "africa" && value > 0 && <div className="fcfa">≈ {fcfa.toLocaleString("fr-FR")} FCFA</div>}
        </div>
        <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Votre pays" : "Your country"}</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>{COUNTRIES.map((x) => <option key={x.code} value={x.code}>{x.flag} {x[lang]}</option>)}</select></div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{fr ? "Moyen de paiement" : "Payment method"}</label>
          <div className="methods">{c.ops.map((o) => { const O = OPS[o]; return (
            <button key={o} className={`method ${method === o ? "on" : ""}`} onClick={() => setMethod(o)}>
              <div className="mi" style={{ background: O.bg, color: O.fg || "#fff" }}>{O.badge ? <span style={{ fontSize: 11, fontWeight: 800 }}>{O.badge}</span> : <O.icon size={18} />}</div>
              <div><div className="mt">{opName(O, lang)}</div><div className="ms">{O.sub[lang]}</div></div><div className="radio" /></button>
          ); })}</div>
        </div>
        {op.phone && <div className="field" style={{ marginBottom: 18 }}><label>{fr ? "Numéro " : "Number "}{typeof op.name === "string" ? op.name : ""}</label><input type="tel" placeholder="+237 6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field" style={{ marginBottom: 10 }}><label>{fr ? "Nom complet" : "Full name"}</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field" style={{ marginBottom: 10 }}><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, margin: "6px 0 18px", cursor: "pointer" }}><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ width: 17, height: 17 }} />{fr ? "J'accepte les statuts de l'association" : "I accept the association's bylaws"}</label>
        <Recaptcha onToken={setRecaptchaToken} />
        {err && <div className="err">{err}</div>}
        <button className="btn btn-green btn-block" onClick={submit} disabled={loading}>
          <Lock size={16} /> {loading ? (fr ? "Traitement…" : "Processing…") : (fr ? `Adhérer pour ${value} €` : `Join for €${value}`)}
        </button>
      </div>
    </div></section>
  );
}

/* ===================== LEGAL / PRIVACY ===================== */
function Legal({ lang }) {
  const fr = lang === "fr";
  return (
    <section className="section tight"><div className="wrap" style={{ maxWidth: 820 }}>
      <span className="eyebrow">{fr ? "Informations légales" : "Legal information"}</span>
      <h1 style={{ fontSize: "clamp(30px,4.5vw,44px)", marginTop: 14 }}>{fr ? "Mentions légales" : "Legal notice"}</h1>
      <div className="lead" style={{ marginTop: 20, lineHeight: 1.8 }}>
        <p><strong>{fr ? "Association" : "Association"}</strong> : Dreams Family of Development (DFD)</p>
        <p>Via Giacomo Puccini 2, Torino, Italia</p>
        <p>{fr ? "Bureau terrain · Douala, Cameroun" : "Field office · Douala, Cameroon"}</p>
        <p>Email : contact@dfd.org &middot; {fr ? "Téléphone" : "Phone"} : +39 366 332 9990</p>
        <p style={{ marginTop: 24 }}>{fr ? "Directeur de la publication : le Président fondateur de DFD." : "Publication director: DFD's founding President."}</p>
        <p>{fr ? "Hébergement : selon la plateforme de déploiement choisie (voir DEPLOYMENT.md)." : "Hosting: depends on the chosen deployment platform (see DEPLOYMENT.md)."}</p>
      </div>
    </div></section>
  );
}
function Privacy({ lang }) {
  const fr = lang === "fr";
  return (
    <section className="section tight"><div className="wrap" style={{ maxWidth: 820 }}>
      <span className="eyebrow">RGPD</span>
      <h1 style={{ fontSize: "clamp(30px,4.5vw,44px)", marginTop: 14 }}>{fr ? "Politique de confidentialité" : "Privacy policy"}</h1>
      <div className="lead" style={{ marginTop: 20, lineHeight: 1.8 }}>
        <p>{fr ? "DFD collecte uniquement les données nécessaires au traitement des dons, adhésions, candidatures bénévoles et messages de contact : nom, e-mail, téléphone, et informations de paiement." : "DFD only collects data required to process donations, memberships, volunteer applications and contact messages: name, email, phone, and payment information."}</p>
        <p style={{ marginTop: 16 }}>{fr ? "Ces données ne sont jamais revendues à des tiers. Elles sont conservées le temps nécessaire à la gestion de votre relation avec l'association." : "This data is never sold to third parties. It is kept for as long as necessary to manage your relationship with the association."}</p>
        <p style={{ marginTop: 16 }}>{fr ? "Conformément au RGPD, vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à contact@dfd.org." : "In accordance with GDPR, you may request access to, correction of, or deletion of your data by writing to contact@dfd.org."}</p>
      </div>
    </div></section>
  );
}

/* ===================== ADMIN (login + dashboard + submissions) ===================== */
function Admin({ lang }) {
  const fr = lang === "fr";
  const [authed, setAuthed] = useState(!!api.token());
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "editor" });
  const [userErr, setUserErr] = useState("");

  const login = async () => {
    setErr("");
    try { const r = await api.login(creds.email, creds.password); api.setToken(r.token); setAuthed(true); } catch (e) { setErr(e.message); }
  };
  useEffect(() => { if (authed) api.dashboard().then(setData).catch(() => { api.logout(); setAuthed(false); }); }, [authed]);
  useEffect(() => { if (authed) api.me().then(setMe).catch(() => {}); }, [authed]);
  useEffect(() => { if (authed && tab !== "dashboard" && tab !== "users") api.submissions(tab).then(setRows).catch(() => setRows([])); }, [tab, authed]);
  const loadUsers = () => api.listUsers().then(setUsers).catch(() => setUsers([]));
  useEffect(() => { if (authed && tab === "users") loadUsers(); }, [tab, authed]);

  if (!authed) {
    return (
      <section className="section"><div className="wrap login-wrap">
        <div className="center" style={{ marginBottom: 24 }}><span className="eyebrow gold">{fr ? "Espace admin" : "Admin"}</span><h1 style={{ fontSize: 34, marginTop: 10 }}>{fr ? "Connexion" : "Sign in"}</h1></div>
        <div className="login-card">
          {err && <div className="err">{err}</div>}
          <div className="field"><label>E-mail</label><input value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} placeholder="admin@dfd.org" /></div>
          <div className="field"><label>{fr ? "Mot de passe" : "Password"}</label><input type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && login()} /></div>
          <button className="btn btn-green btn-block" onClick={login}><Lock size={16} /> {fr ? "Se connecter" : "Sign in"}</button>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14, textAlign: "center" }}>{fr ? "Démo : admin@dfd.org / DfdAdmin2025!" : "Demo: admin@dfd.org / DfdAdmin2025!"}</p>
        </div>
      </div></section>
    );
  }

  const k = data?.kpis;
  const months = data?.byMonth || [];
  const maxM = Math.max(1, ...months.map((m) => m.total));
  const methodColors = { orange: "#FF6600", mtn: "#FFCC00", card: "#164A3B", sepa: "#B23A1E" };
  const totalMethod = (data?.byMethod || []).reduce((s, m) => s + m.c, 0) || 1;
  const isAdmin = me?.role === "admin";
  const tabs = [["dashboard", fr ? "Tableau de bord" : "Dashboard"], ["donations", fr ? "Dons" : "Donations"], ["members", fr ? "Adhésions" : "Memberships"], ["volunteers", fr ? "Bénévoles" : "Volunteers"], ["messages", "Messages"], ...(isAdmin ? [["users", fr ? "Utilisateurs" : "Users"]] : [])];

  const createUser = async () => {
    setUserErr("");
    try { await api.createUser(newUser); setNewUser({ name: "", email: "", password: "", role: "editor" }); loadUsers(); }
    catch (e) { setUserErr(e.message); }
  };
  const removeUser = async (id) => { try { await api.deleteUser(id); loadUsers(); } catch (e) { setUserErr(e.message); } };

  return (
    <section className="section tight"><div className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div><span className="eyebrow gold">{fr ? "Espace admin" : "Admin"}</span><h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 8 }}>{fr ? "Tableau de bord décisionnel" : "Decision dashboard"}</h1></div>
        <button className="btn btn-outline" style={{ padding: "10px 18px" }} onClick={() => { api.logout(); setAuthed(false); }}><LogOut size={15} /> {fr ? "Déconnexion" : "Log out"}</button>
      </div>

      <div className="admin-tabs">{tabs.map(([id, lab]) => <button key={id} className={`chip ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{lab}</button>)}</div>

      {tab === "dashboard" && k && (<>
        <div className="kpis">
          <div className="kpi"><div className="lab">{fr ? "Dons ce mois" : "Gifts this month"}</div><div className="num">{k.thisMonth.toLocaleString("fr-FR")} €</div><div className="delta"><TrendingUp size={13} /> {fr ? "en temps réel" : "live"}</div></div>
          <div className="kpi"><div className="lab">{fr ? "Total collecté" : "Total raised"}</div><div className="num">{k.totalEur.toLocaleString("fr-FR")} €</div><div className="delta">{k.donorsCount} {fr ? "dons" : "gifts"}</div></div>
          <div className="kpi"><div className="lab">{fr ? "Bénévoles" : "Volunteers"}</div><div className="num">{k.volunteers}</div><div className="delta">{fr ? "candidatures" : "applications"}</div></div>
          <div className="kpi"><div className="lab">{fr ? "Projets actifs" : "Active projects"}</div><div className="num">{k.activeProjects}</div><div className="delta">{fr ? "en cours" : "ongoing"}</div></div>
          <div className="kpi"><div className="lab">{fr ? "Adhésions" : "Memberships"}</div><div className="num">{k.membersTotal.toLocaleString("fr-FR")} €</div><div className="delta">{k.membersCount} {fr ? "adhérents" : "members"}</div></div>
        </div>
        <div className="dash-grid">
          <div className="panel"><h3 style={{ fontSize: 18 }}>{fr ? "Évolution des dons (6 mois)" : "Donations (6 months)"}</h3>
            <div className="bars">{months.length ? months.map((m, i) => (
              <div className="bar-col" key={i}><div className="bar" style={{ height: `${(m.total / maxM) * 100}%` }} title={`${m.total} €`} /><div className="bar-lab">{m.m.slice(5)}</div></div>
            )) : <p style={{ color: "var(--muted)" }}>{fr ? "Aucune donnée." : "No data."}</p>}</div>
          </div>
          <div className="panel"><h3 style={{ fontSize: 18, marginBottom: 6 }}>{fr ? "Répartition des paiements" : "Payment mix"}</h3>
            <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", margin: "16px 0" }}>{(data.byMethod || []).map((m, i) => <div key={i} style={{ width: `${(m.c / totalMethod) * 100}%`, background: methodColors[m.method] || "#999" }} title={m.method} />)}</div>
            <div className="legend">{(data.byMethod || []).map((m, i) => <div className="leg" key={i}><span className="dot" style={{ background: methodColors[m.method] || "#999" }} /> {m.method} <strong style={{ marginLeft: "auto" }}>{Math.round((m.c / totalMethod) * 100)}%</strong></div>)}</div>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ fontSize: 14.5, color: "var(--muted)" }}>{fr ? "Exportez les données pour vos rapports." : "Export data for your reports."}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btn-outline" style={{ padding: "10px 18px" }} href="#" onClick={(e) => { e.preventDefault(); downloadCsv("donations"); }}><Download size={15} /> {fr ? "Dons CSV" : "Donations CSV"}</a>
            <a className="btn btn-outline" style={{ padding: "10px 18px" }} href="#" onClick={(e) => { e.preventDefault(); downloadCsv("members"); }}><Download size={15} /> {fr ? "Adhésions CSV" : "Memberships CSV"}</a>
            <a className="btn btn-green" style={{ padding: "10px 18px" }} href="#" onClick={(e) => { e.preventDefault(); downloadCsv("volunteers"); }}><Download size={15} /> {fr ? "Bénévoles CSV" : "Volunteers CSV"}</a>
          </div>
        </div>
      </>)}

      {tab === "users" && isAdmin && (
        <div className="table-wrap" style={{ padding: 22 }}>
          {userErr && <div className="err">{userErr}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end", marginBottom: 18 }}>
            <div className="field" style={{ marginBottom: 0 }}><label>{fr ? "Nom" : "Name"}</label><input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} /></div>
            <div className="field" style={{ marginBottom: 0 }}><label>E-mail</label><input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
            <div className="field" style={{ marginBottom: 0 }}><label>{fr ? "Mot de passe" : "Password"}</label><input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div>
            <div className="field" style={{ marginBottom: 0 }}><label>{fr ? "Rôle" : "Role"}</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="editor">Editor</option><option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-green" style={{ padding: "10px 18px" }} onClick={createUser}>{fr ? "Créer" : "Create"}</button>
          </div>
          <table className="tbl"><thead><tr><th>{fr ? "Nom" : "Name"}</th><th>E-mail</th><th>{fr ? "Rôle" : "Role"}</th><th /></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td><button className="btn btn-outline" style={{ padding: "6px 12px" }} onClick={() => removeUser(u.id)}>{fr ? "Supprimer" : "Delete"}</button></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab !== "dashboard" && tab !== "users" && (
        <div className="table-wrap">
          {rows.length ? (
            <table className="tbl"><thead><tr>{Object.keys(rows[0]).filter((c) => c !== "password_hash").map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i}>{Object.keys(rows[0]).filter((c) => c !== "password_hash").map((c) => <td key={c}>{c === "status" ? <span className={`badge ${r[c] === "completed" ? "ok" : "pend"}`}>{r[c]}</span> : String(r[c] ?? "")}</td>)}</tr>)}</tbody>
            </table>
          ) : <p style={{ padding: 24, color: "var(--muted)" }}>{fr ? "Aucune donnée pour le moment." : "No data yet."}</p>}
        </div>
      )}
    </div></section>
  );
}

async function downloadCsv(type) {
  const res = await fetch(api.exportUrl(type), { headers: { Authorization: `Bearer ${api.token()}` } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${type}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ===================== APP ===================== */
export default function App() {
  const [lang, setLang] = useState("fr");
  const [page, setPage] = useState(() => pathToPage(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [news, setNews] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.getProjects().then((r) => setProjects(r.map(mapProject))).catch(() => {});
    api.getNews().then((r) => setNews(r.map(mapNews))).catch(() => {});
    api.getDocuments().then((r) => setDocs(r.map(mapDoc))).catch(() => {});
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  useEffect(() => {
    const onPopState = () => setPage(pathToPage(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const go = (p) => {
    setPage(p);
    setMenuOpen(false);
    const path = PAGE_PATHS[p] || "/";
    if (window.location.pathname !== path) window.history.pushState({ page: p }, "", path);
  };

  return (
    <div className="dfd">
      <Header lang={lang} setLang={setLang} page={page} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {page === "home" && <Home lang={lang} go={go} projects={projects} />}
        {page === "about" && <About lang={lang} />}
        {page === "actions" && <Actions lang={lang} go={go} projects={projects} />}
        {page === "news" && <News lang={lang} news={news} />}
        {page === "gallery" && <Gallery lang={lang} />}
        {page === "docs" && <Documents lang={lang} docs={docs} />}
        {page === "contact" && <Contact lang={lang} />}
        {page === "donate" && <Donate lang={lang} />}
        {page === "volunteer" && <Volunteer lang={lang} />}
        {page === "membership" && <Membership lang={lang} />}
        {page === "legal" && <Legal lang={lang} />}
        {page === "privacy" && <Privacy lang={lang} />}
        {page === "admin" && <Admin lang={lang} />}
      </main>
      <Footer lang={lang} go={go} />
    </div>
  );
}
