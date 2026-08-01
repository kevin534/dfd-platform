# Guide de déploiement — DFD

Ce guide couvre : (1) la mise en ligne, (2) l'activation des vrais paiements
Orange Money / MTN MoMo / carte, et (3) le passage à PostgreSQL.

---

## 1. Mise en ligne

### Option recommandée : Render.com (gratuit pour démarrer)

1. Créez un compte sur https://render.com
2. Poussez ce dossier sur un dépôt GitHub (voir plus bas).
3. Sur Render : **New +** → **Blueprint** → sélectionnez votre dépôt.
   Render lit `render.yaml` et configure tout automatiquement.
4. Dans l'onglet **Environment**, renseignez `ADMIN_PASSWORD` et, plus tard,
   vos clés de paiement.
5. Render vous donne une URL publique (ex. `https://dfd-platform.onrender.com`).

> Pour un nom de domaine (ex. `www.dfd.org`) : achetez-le chez OVH ou Gandi,
> puis ajoutez-le dans Render → **Settings** → **Custom Domains**.

### Publier le code sur GitHub

```bash
cd dfd-platform
git init
git add .
git commit -m "DFD — plateforme initiale"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/dfd-platform.git
git push -u origin main
```

### Autres hébergeurs

- **Railway / Fly.io / VPS** : l'image Docker (`Dockerfile`) fonctionne partout.
  `docker build -t dfd . && docker run -p 4000:4000 dfd`
- **Frontend séparé (Vercel/Netlify) + backend (Render)** : possible, mais le
  déploiement en une image unique ci-dessus est plus simple pour une association.

---

## 2. Activer les vrais paiements

Par défaut `PAYMENTS_MODE=demo` : les dons sont enregistrés mais aucun paiement
réel n'a lieu. Pour encaisser réellement, il faut un **compte marchand** par
opérateur, puis renseigner les clés dans les variables d'environnement et passer
`PAYMENTS_MODE=live`.

### Orange Money (Afrique)
1. Créez un compte sur https://developer.orange.com
2. Souscrivez à l'API **Orange Money Web Payment** (contrat marchand, par pays).
3. Récupérez `ORANGE_CLIENT_ID`, `ORANGE_CLIENT_SECRET`, `ORANGE_MERCHANT_KEY`.
4. Renseignez-les + `ORANGE_RETURN_URL` / `ORANGE_CANCEL_URL`.

### MTN Mobile Money (Afrique)
1. Créez un compte sur https://momodeveloper.mtn.com
2. Souscrivez au produit **Collections**.
3. Récupérez `MTN_SUBSCRIPTION_KEY`, créez un **API User** + **API Key**.
4. Renseignez-les et `MTN_TARGET_ENV` (`sandbox` puis production).

### Stripe (carte / SEPA — Europe)
1. Créez un compte sur https://dashboard.stripe.com
2. Récupérez `STRIPE_SECRET_KEY` (et `STRIPE_WEBHOOK_SECRET` pour la
   confirmation asynchrone).

> **Sécurité** : ne mettez jamais ces clés dans le code ni sur GitHub.
> Renseignez-les uniquement dans les variables d'environnement de l'hébergeur.

Le code d'intégration est déjà écrit dans `server/src/payments/`
(`orange.js`, `mtn.js`, `index.js`) et suit les API officielles. Il ne reste
qu'à fournir les clés et à finaliser les webhooks de confirmation selon les
retours de chaque opérateur.

---

## 3. Passer à PostgreSQL (production à fort trafic)

SQLite convient parfaitement pour démarrer. Pour PostgreSQL :

1. Créez une base (Render, Supabase, Neon…).
2. Remplacez `better-sqlite3` par `pg` dans `server/src/db.js`
   (le schéma SQL est standard et directement réutilisable).
3. Adaptez les requêtes `db.prepare(...).run/get/all` vers le client `pg`.

Le schéma se trouve en haut de `server/src/db.js`.

---

## 4. Conformité (RGPD) — checklist

- [x] Don anonyme possible
- [x] Mots de passe hachés (bcrypt), sessions JWT expirables
- [x] Limitation anti-abus sur les formulaires (rate limiting)
- [ ] Ajouter les pages **Mentions légales** et **Politique de confidentialité**
- [ ] Bannière cookies (si vous ajoutez des mesures d'audience)
- [ ] Procédure de suppression des données sur demande

---

## Variables d'environnement (récapitulatif)

Voir `server/.env.example` pour la liste complète et commentée.
