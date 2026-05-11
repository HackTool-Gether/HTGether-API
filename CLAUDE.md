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

## MANDATORY — Before every commit

These steps are NON-NEGOTIABLE. A commit that breaks CI is unacceptable.

1. **Pre-commit hooks** — Run `pre-commit run --all-files`.
   Fix ALL failures (trailing whitespace, EOF, yamllint, markdownlint,
   gitleaks, shellcheck, build). Do NOT commit until every hook passes.
2. **Grype SCA scan** — Run `grype dir:. --fail-on high`.
   If any High or Critical vulnerability is found, fix it
   (update dependency, add override) BEFORE committing. Medium/Low are acceptable.
3. **TypeScript** — Run `npx tsc --noEmit` to verify no type errors.

If any of these 3 checks fail, DO NOT commit. Fix the issue first.

## Code conventions

- Responses in French for user-facing strings
- Use Prisma `select` to avoid returning sensitive fields (password, etc.)
- All new endpoints need proper DTO validation with class-validator
- CORS origin is configured via `CORS_ORIGIN` env var
