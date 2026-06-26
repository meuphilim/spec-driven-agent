# Documentation Templates

Reference for README, ADR, and CHANGELOG formats.

---

## 1. README Structure

A README should answer four questions in order: **what, why, how to run, how to test.** Anything beyond that belongs in `docs/`.

```markdown
# Project Name

One sentence: what this is and who it's for.

## Why
2-3 sentences on the problem this solves. Not a feature list — the motivation.

## Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker (for local Postgres)

## Quick Start
\`\`\`bash
git clone <repo>
pnpm install
cp .env.example .env
pnpm db:reset
pnpm dev
\`\`\`

## Project Structure
\`\`\`
apps/
  web/      — Next.js frontend
  api/      — NestJS backend
packages/
  ui/       — shared component library
  config/   — shared eslint/tsconfig
\`\`\`

## Available Scripts
| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run test suite |
| `pnpm db:reset` | Reset and reseed local database |

## Environment Variables
See `.env.example`. Required: `DATABASE_URL`, `NEXTAUTH_SECRET`.

## Deployment
Brief pointer — link to `docs/deployment.md` if it's more than 3 lines.
```

A new dev should be able to clone, run `pnpm install && pnpm dev`, and have a working app in under 5 minutes using only this file.

---

## 2. Architecture Decision Records (ADR)

One file per significant, hard-to-reverse decision. Store under `docs/adr/0001-short-title.md`, numbered sequentially, never deleted (superseded ADRs get marked, not removed — they're history).

```markdown
# 0007 — Use NextAuth with database sessions instead of JWT

## Status
Accepted

## Context
We need RBAC roles that can be revoked immediately (e.g. suspend a user
mid-session). JWT sessions can't be invalidated without a blocklist, which
adds its own infrastructure. Stateless JWT also made the admin/reader
route-group separation harder to enforce server-side.

## Decision
Use NextAuth with the Prisma adapter and database-backed sessions.

## Consequences
- (+) Sessions can be revoked instantly by deleting the DB row.
- (+) Role changes take effect on the next request, not next token refresh.
- (-) Adds a DB read on every authenticated request (mitigated with
  session caching at the edge).
- (-) Slightly more infra than pure JWT for purely stateless deploys.

## Alternatives Considered
- Stateless JWT + Redis blocklist — rejected, adds Redis as a hard
  dependency for a problem the DB already solves.
```

Why ADRs matter: six months later nobody remembers *why* database sessions were chosen over JWT. The code doesn't explain itself — the ADR does.

---

## 3. CHANGELOG Format (Keep a Changelog + SemVer)

```markdown
# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/),
versioning follows [SemVer](https://semver.org/).

## [Unreleased]
### Added
- Wikipedia-style public home page for the reader route group.

## [1.4.0] - 2026-06-15
### Added
- Admin/reader route group separation in the Next.js app.
### Fixed
- Tailwind v4 editor style conflicts in the rich-text component.

## [1.3.0] - 2026-05-30
### Changed
- Migrated document storage to Docker-mounted git repo.

### Removed
- Deprecated `/api/v1/legacy-export` endpoint.
```

Categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Only use the ones you need per release — don't pad with empty headers.

If commits follow Conventional Commits (see `git-workflows.md`), this file can be generated automatically with `changesets` or `conventional-changelog` instead of hand-maintained.

---

## 4. PR Description Template

`.github/pull_request_template.md`:

```markdown
## What
Brief description of the change.

## Why
Link to issue/ADR if applicable.

## How to test
Steps to verify locally.

## Screenshots (if UI change)
```

---

## 5. API Documentation (NestJS)

For NestJS APIs, prefer generated docs over hand-written ones — they drift less:

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('API')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

Annotate DTOs with `@ApiProperty()` so the generated schema stays accurate as fields change — this beats a manually maintained `API.md` that's always one PR behind reality.
