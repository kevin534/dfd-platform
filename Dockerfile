# ============================================================
#  DFD — Image Docker unique (frontend + backend)
#  Étape 1 : build du frontend  →  Étape 2 : serveur qui sert tout
# ============================================================

# ---- Étape 1 : build du frontend ----
FROM node:22-slim AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# ---- Étape 2 : serveur ----
FROM node:22-slim
WORKDIR /app
# dépendances système pour better-sqlite3 (fallback compilation)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/
# frontend compilé, servi par le serveur
COPY --from=web /web/dist ./web/dist
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
WORKDIR /app/server
CMD ["node", "src/index.js"]
