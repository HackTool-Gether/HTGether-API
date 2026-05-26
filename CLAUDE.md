# CLAUDE.md — HTGether API

## Stack

- NestJS + Prisma ORM + PostgreSQL
- TypeScript
- Docker Compose (api, db, studio)
- JWT auth (access 15min, refresh 7d)

## Architecture

- `src/auth/` — Authentication (local, OIDC, LDAP), JWT, guards
- `src/setup/` — Initial platform setup and onboarding wizard
- `src/settings/` — Platform settings (company, AI, SMTP)
- `src/projects/` — Projects, scopes, findings, reports
- `src/prisma/` — Prisma service and schema
- `prisma/schema.prisma` — Database schema, always run `npx prisma generate` after changes

## Dev commands

- `docker compose up -d` — Start all services (api, db, studio)
- `docker compose up -d --build api` — Rebuild and restart API
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma migrate dev` — Create and apply migrations
- `npx tsc --noEmit` — Type-check without emitting

## MANDATORY — Pre-commit checklist (BLOCKING)

**This section is the single most important rule in this file.**
You MUST run ALL 4 checks below before EVERY `git commit`. No exceptions.

```bash
# 1. Pre-commit hooks (linting, secrets, formatting, shellcheck, build)
pre-commit run --all-files

# 2. Grype SCA scan (dependency vulnerabilities)
grype dir:. --fail-on high

# 3. Bearer SAST scan (code-level security issues)
bearer scan . --severity critical,high

# 4. TypeScript type-check
npx tsc --noEmit
```

**If ANY check fails, DO NOT commit. Fix the issue first, then re-run.**

- Grype High/Critical → update dependency or add override
- Bearer Critical/High → fix the flagged code pattern
- Medium/Low from grype or bearer are acceptable
- Pre-commit failures → fix and re-run until all pass

This is not a suggestion — it is a hard gate.

## Code conventions

- Responses in French for user-facing strings
- Use Prisma `select` to avoid returning sensitive fields (password, etc.)
- All new endpoints need proper DTO validation with class-validator
- CORS origin is configured via `CORS_ORIGIN` env var
