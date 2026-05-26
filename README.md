# HTGether-API

Backend de **HTGether**, plateforme collaborative de pentest.
Gestion de projets d'audit, findings, scopes, notes, rapports
et chat en temps reel.

## 1. Presentation

- **Framework** : NestJS 11 (Node.js 20)
- **ORM** : Prisma 6 + PostgreSQL 16
- **Auth** : JWT access (15 min) + refresh (7 j), LOCAL / OIDC / LDAP
- **Temps reel** : Socket.IO (messagerie projet, presence)
- **IA** : Multi-provider (OpenAI, Anthropic, Gemini, Mistral, OpenRouter)
- **Deploiement** : Docker Compose (api + db + studio)

### Modules principaux

| Module | Description |
| --- | --- |
| `auth` | Authentification locale, SSO, LDAP, JWT, guards |
| `projects` | Projets, membres, invitations, remarques manager |
| `findings` | Vulnerabilites avec CVSS, statut, composant |
| `scopes` | Perimetres d'audit, composants, notes |
| `reports` | Multi-rapports, sections, contenu TipTap |
| `templates` | Templates Handlebars HTML/CSS, rendu PDF, assets |
| `ai` | Generation IA en SSE (reformulation, completion) |
| `knowledge-base` | Base de connaissances entreprise + personnelle |
| `attack-chains` | Chaines d'exploitation (finding ordering) |
| `mail` | Notifications email (nodemailer) |
| `settings` | Configuration plateforme (entreprise, IA, SMTP) |

## 2. Installation et lancement

### Prerequis

- Docker + Docker Compose
- Node.js 20+ (pour le developpement local)

### Lancement rapide (Docker)

```bash
cp .env.example .env    # adapter JWT_SECRET, JWT_REFRESH_SECRET
docker compose up -d    # db (:5436) + api (:4000) + studio (:5555)
```

L'API ecoute sur `http://localhost:4000/api`,
Prisma Studio sur `http://localhost:5555`.

### Developpement local

```bash
npm ci
cp .env.example .env

# Demarrer la base seule
docker compose up db -d

# Appliquer les migrations + generer le client Prisma
npx prisma migrate dev

# Lancer le serveur en mode watch
npm run start:dev
```

### Variables d'environnement

| Variable | Defaut | Description |
| --- | --- | --- |
| `DATABASE_URL` | voir `.env.example` | URL PostgreSQL |
| `JWT_SECRET` | — | Secret pour les access tokens |
| `JWT_REFRESH_SECRET` | — | Secret pour les refresh tokens |
| `JWT_EXPIRATION` | `15m` | Duree des access tokens |
| `JWT_REFRESH_EXPIRATION` | `7d` | Duree des refresh tokens |
| `PORT` | `4000` | Port de l'API |
| `CORS_ORIGIN` | `http://localhost:3000` | Origine autorisee |

### Commandes utiles

```bash
npm run start:dev          # Dev server (watch)
npm run build              # Build production
npx prisma migrate dev     # Creer/appliquer une migration
npx prisma studio          # Interface graphique DB
npx tsc --noEmit           # Type-check
```

## 3. Pipeline DevSecOps

Chaque commit passe par **4 couches de verification** avant
d'etre pousse, plus **4 workflows GitHub Actions** en CI.

### Checks locaux (obligatoires avant commit)

```bash
pre-commit run --all-files              # 1. Hooks de qualite
grype dir:. --fail-on high              # 2. SCA (dependances)
bearer scan . --severity critical,high  # 3. SAST (code)
npx tsc --noEmit                        # 4. Type-check
```

### Pre-commit hooks

Installation : `pip install pre-commit && pre-commit install`

| Hook | Role |
| --- | --- |
| `trailing-whitespace` | Espaces en fin de ligne |
| `end-of-file-fixer` | Newline en fin de fichier |
| `check-yaml` / `check-json` | Syntaxe YAML/JSON |
| `check-added-large-files` | Bloque fichiers > 500 Ko |
| `check-merge-conflict` | Marqueurs de conflit |
| `detect-private-key` | Cles privees commitees |
| `gitleaks` | Secrets dans le code |
| `yamllint` / `markdownlint` | Lint YAML et Markdown |
| `shellcheck` | Lint scripts shell |
| `build-app` | Verifie que `npm run build` passe |

### GitHub Actions

| Workflow | Declencheur | Description |
| --- | --- | --- |
| `ci.yml` | Push `main`, PR | Lint, type-check, build |
| `pre-commit.yml` | Push, PR | Hooks pre-commit |
| `security-scan.yml` | Push `main`, PR | SCA Grype (fail High+) |
| `bearer.yml` | Push `main`, PR | SAST Bearer (fail High+) |

### Outils de securite

| Outil | Type | Cible | Seuil |
| --- | --- | --- | --- |
| **Grype** | SCA | Dependances npm (CVE/GHSA) | High |
| **Bearer** | SAST | Code (injection, path traversal) | High |
| **Gitleaks** | Secrets | Commits (cles, tokens) | Tout |
| **ShellCheck** | Lint | Scripts shell | Tout |

### Faux positifs

Les faux positifs Bearer sont documentes dans `bearer.ignore`
avec justification. Les chemins de fichiers du module
knowledge-base sont valides par `path.resolve()` + verification
de prefixe avant lecture.
