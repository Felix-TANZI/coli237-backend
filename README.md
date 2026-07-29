# COLI237 — Backend

API de la plateforme de recensement de livreurs **COLI237**.
Développée avec NestJS, Prisma et PostgreSQL.

> Éditeur : NET AND PROSYSTEMS SARL

---

## Aperçu

Cette API gère le recensement des acteurs de la livraison (livreurs indépendants, livreurs d'agence, administrateurs de compagnie, managers d'agence) par des agents de terrain. Elle expose deux espaces logiques :

- **Espace agent** : recensement des personnes, gestion des compagnies, consultation de ses propres fiches.
- **Espace admin** : validation ou rejet des fiches, gestion des agents, export des données.

Les agents travaillent parfois hors ligne ; la synchronisation se fait côté frontend.

---

## Prérequis

- **Node.js** 20 ou plus (testé sur Node 24)
- **pnpm** (gestionnaire de paquets)
- **Docker** (pour la base PostgreSQL en local)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-depot-backend>
cd coli237-backend

# 2. Installer les dépendances
pnpm install

# 3. Créer le fichier d'environnement
cp .env.example .env
# puis éditer .env (voir la section Configuration)

# 4. Démarrer la base PostgreSQL (Docker)
docker compose up -d    # ou votre commande Docker habituelle

# 5. Appliquer les migrations et générer le client Prisma
pnpm prisma migrate dev
pnpm prisma generate

# 6. Créer le premier compte administrateur (script d'amorçage)
pnpm prisma db seed
```

---

## Configuration

Toutes les variables sont documentées dans `.env.example`. Les principales :

| Variable                                                 | Rôle                                                   |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `PORT`                                                   | Port d'écoute de l'API (défaut : 3000)                 |
| `DATABASE_URL`                                           | Chaîne de connexion PostgreSQL                         |
| `JWT_SECRET`                                             | Clé de signature des jetons (générer une valeur forte) |
| `JWT_EXPIRES_IN`                                         | Durée de validité des jetons (ex : `7d`)               |
| `CORS_ORIGINS`                                           | Origines autorisées (ex : `http://localhost:5173`)     |
| `ADMIN_EMAIL` / `ADMIN_TELEPHONE` / `ADMIN_MOT_DE_PASSE` | Identifiants du premier admin créé par le seed         |

> **Important** : le fichier `.env` ne doit jamais être versionné (il est déjà dans `.gitignore`). Pour générer un `JWT_SECRET` fort :
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Lancer le projet

```bash
# Développement (rechargement automatique)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

L'API démarre sur `http://localhost:3000`.
La documentation interactive Swagger est disponible sur `http://localhost:3000/docs`.

---

## Scripts utiles

| Commande                  | Effet                           |
| ------------------------- | ------------------------------- |
| `pnpm start:dev`          | Lance l'API en mode watch       |
| `pnpm build`              | Compile le projet               |
| `pnpm typecheck`          | Vérifie les types sans compiler |
| `pnpm lint`               | Analyse le code (ESLint)        |
| `pnpm format`             | Formate le code (Prettier)      |
| `pnpm test`               | Lance les tests                 |
| `pnpm prisma migrate dev` | Crée et applique une migration  |
| `pnpm prisma generate`    | Régénère le client Prisma       |
| `pnpm prisma db seed`     | Crée le premier admin           |

---

## Structure

```
src/
├── config/          Configuration (env, Swagger)
├── prisma/          Service Prisma
├── securite/        Garde-fous transverses
├── stockage/        Enregistrement des fichiers
├── modules/
│   ├── auth/        Connexion, inscription, mot de passe
│   ├── agents/      Gestion des agents (admin)
│   ├── personnes/   Recensement, validation, documents
│   ├── compagnies/  Gestion des compagnies
│   ├── export/      Export Excel / PDF
│   └── health/      Sonde de disponibilité
└── main.ts          Point d'entrée
prisma/
├── schema.prisma    Modèle de données
├── migrations/      Historique des migrations
└── seed.ts          Amorçage (premier admin)
```

---

## Sécurité

L'API applique plusieurs protections :

- **Jetons JWT** pour l'authentification, signés avec `JWT_SECRET`.
- **Helmet** pour durcir les en-têtes HTTP (CSP stricte, anti-clickjacking).
- **Rate limiting** (`@nestjs/throttler`) : limite globale par IP, et limites strictes sur la connexion et l'inscription.
- **Validation des entrées** via Zod sur toutes les requêtes.
- **Validation des fichiers** : seuls jpg, png et pdf sont acceptés, taille maximale 5 Mo.
- **CORS** restreint aux origines déclarées.
- `trust proxy` activé pour un fonctionnement correct derrière un reverse proxy.

---

## Principaux points d'entrée de l'API

| Méthode    | Route                        | Description              | Accès                      |
| ---------- | ---------------------------- | ------------------------ | -------------------------- |
| POST       | `/auth/connexion`            | Se connecter             | Public                     |
| POST       | `/auth/inscription`          | Créer un compte agent    | Public                     |
| POST       | `/auth/changer-mot-de-passe` | Changer son mot de passe | Connecté                   |
| GET / POST | `/personnes`                 | Lister / recenser        | Connecté                   |
| PATCH      | `/personnes/:id`             | Modifier une fiche       | Agent (ses fiches) / Admin |
| POST       | `/personnes/:id/valider`     | Valider une fiche        | Admin                      |
| POST       | `/personnes/:id/rejeter`     | Rejeter une fiche        | Admin                      |
| POST       | `/personnes/:id/documents`   | Ajouter un document      | Connecté                   |
| GET / POST | `/compagnies`                | Lister / créer           | Connecté                   |
| GET        | `/export/personnes.xlsx`     | Export Excel             | Connecté                   |
| GET        | `/export/personnes.pdf`      | Export PDF               | Connecté                   |

La liste complète et à jour est consultable sur `/docs`.

---

## Licence

Projet privé — NET AND PROSYSTEMS SARL. Tous droits réservés.
