# DFD — Dreams Family of Development

Plateforme web de l'association **Dreams Family of Development** : site public
multilingue (FR/EN), collecte de dons pour le Cameroun et l'Afrique avec
**Orange Money, MTN Mobile Money et carte bancaire** selon le pays du donateur,
back-office sécurisé et tableau de bord décisionnel.

Application **fullstack complète et fonctionnelle** : React (frontend) +
Node/Express + SQLite (backend).

---

## Démarrage rapide

### Option A — Docker (le plus simple)

```bash
docker compose up --build
```

Puis ouvrez **http://localhost:4000**. C'est tout.

### Option B — Sans Docker (2 terminaux)

**Terminal 1 — backend :**
```bash
cd server
cp .env.example .env
npm install
npm start          # API sur http://localhost:4000
```

**Terminal 2 — frontend :**
```bash
cd web
npm install
npm run dev        # site sur http://localhost:5173
```

Ouvrez **http://localhost:5173**.

---

## Accès administrateur (démo)

- Cliquez sur **« Espace admin »** en bas de page (footer).
- Identifiants par défaut : `admin@dfd.org` / `DfdAdmin2025!`
  (modifiables dans `server/.env`).

Vous y trouverez : le tableau de bord (dons, bénévoles, projets, répartition
des paiements), la liste des soumissions et l'export CSV.

---

## Ce qui fonctionne dès maintenant

- Site public complet, responsive, bilingue FR/EN
- Pages : Accueil, À propos, Nos actions (filtres), Actualités, Galerie,
  Documents, Contact, Faire un don
- Formulaires réels enregistrés en base : don, contact, bénévolat, newsletter
- **Paiements adaptés au pays** : Orange Money / MTN MoMo pour l'Afrique
  (avec équivalent FCFA), carte / SEPA pour l'Europe
- Espace admin sécurisé (JWT) + tableau de bord + export CSV

Par défaut, les paiements tournent en **mode démo** (transaction simulée, aucun
argent réel). Pour activer les vrais paiements, voir **DEPLOYMENT.md**.

---

## Architecture

```
dfd-platform/
├── web/                 Frontend React (Vite)
│   └── src/
│       ├── App.jsx      Toutes les pages + espace admin
│       ├── api.js       Client API
│       └── styles.css   Design "climat africain" (vert/or/latérite)
├── server/              Backend Express
│   └── src/
│       ├── index.js     Serveur
│       ├── db.js        Base SQLite + données de démo
│       ├── auth.js      Authentification JWT
│       ├── routes/      Contenu, formulaires, admin
│       └── payments/    Orange Money, MTN MoMo, Stripe
├── Dockerfile           Image unique (build web + serveur)
├── docker-compose.yml   Lancement en une commande
└── render.yaml          Déploiement Render.com
```

## Remarques

- Les visuels sont des **tuiles stylisées** (dégradés + motifs africains) à
  remplacer par les vraies photos de terrain.
- La base est **SQLite** (zéro configuration). Pour PostgreSQL en production,
  voir **DEPLOYMENT.md**.
- Documentation de déploiement et d'activation des paiements : **DEPLOYMENT.md**.
