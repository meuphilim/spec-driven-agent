# Project Structure

Reference for monorepo layouts, folder conventions, and configuration management.

---

## 1. Standard Turborepo Layout (Next.js + NestJS)

```
.
├── apps/
│   ├── web/                 # Next.js frontend (App Router)
│   │   ├── app/
│   │   │   ├── (admin)/     # route group — admin area
│   │   │   ├── (reader)/    # route group — public/reader area
│   │   │   └── layout.tsx
│   │   ├── public/
│   │   └── package.json
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   ├── common/
│       │   └── main.ts
│       └── package.json
├── packages/
│   ├── ui/                  # shared component library
│   ├── config/              # shared eslint/tsconfig/tailwind config
│   ├── database/            # Prisma schema + client, shared by web & api
│   └── types/                # shared TS types/DTOs between web & api
├── scripts/                 # one-off and setup automation
├── docs/
│   └── adr/
├── .github/
│   └── workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

Rules of thumb:
- `apps/` = deployable units. `packages/` = shared code, never deployed on its own.
- Route groups (`(admin)`, `(reader)`) belong inside `app/`, not as separate top-level apps — they share the same Next.js build, middleware, and auth context.
- Prisma schema lives in a shared `packages/database` so both `apps/web` (if it does server actions/RSC db reads) and `apps/api` (NestJS) import the same generated client instead of each maintaining their own schema copy.

---

## 2. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 3. Configuration File Placement

| Config | Where | Why |
|---|---|---|
| `tsconfig.base.json` | `packages/config/` | One source of truth, extended by each app |
| `eslint.config.js` | `packages/config/` (flat config), extended per app | Avoids 6 copies of the same rules |
| `tailwind.config.ts` | `packages/config/` base + thin override per app | Tailwind v4 design tokens shared across web + any admin-only UI |
| `.env.example` | repo root | One checklist of every var any app needs |
| `.env` (per app, if values diverge) | `apps/*/` | Only when an app genuinely needs different values, not by default |
| `docker-compose.yml` | repo root | Local Postgres/Redis shared by all apps |

Avoid scattering config — if every app has its own `eslint.config.js` with subtly different rules, that's drift, not flexibility.

---

## 4. The "No Junk Drawer" Rule

A folder named `utils/`, `helpers/`, or `common/` with 40+ unrelated files is a sign the project needs sub-grouping. Prefer:

```
# Bad
src/utils/
  formatDate.ts
  validateEmail.ts
  parseCsv.ts
  hashPassword.ts
  retryFetch.ts

# Better — grouped by domain
src/lib/date/
src/lib/validation/
src/lib/csv/
src/lib/auth/
src/lib/http/
```

If a file in `utils/` is only used by one feature, it probably belongs co-located with that feature instead:

```
src/features/orders/
  orders.service.ts
  orders.controller.ts
  orders.utils.ts      # only used here — keep it local
```

---

## 5. RBAC / Multi-Role Apps — Folder Implications

When an app has admin vs. reader separation (route groups, NextAuth roles), keep the split visible in structure, not just in logic:

```
app/
  (admin)/
    dashboard/
    users/
    layout.tsx        # admin-only layout, role guard here
  (reader)/
    page.tsx           # public home
    articles/
    layout.tsx          # public layout
  api/
    auth/[...nextauth]/route.ts
middleware.ts           # role-based redirect at the edge
```

Guard at two layers: `middleware.ts` for the fast redirect (UX), and the actual data-fetching layer (server actions / NestJS guards) for the real authorization check. Never rely on the middleware redirect alone — it's not a security boundary by itself.

---

## 6. Document Storage (Docker-mounted git repo pattern)

When document storage is a Docker-mounted git repo rather than a database table:

```
docker-compose.yml
  volumes:
    - ./data/documents:/app/documents   # bind-mounted, git-tracked separately
```

Keep this repo's `.gitignore` and the app's `.gitignore` separate — the documents repo should not inherit `node_modules`/build ignores from the app repo, and vice versa. Document the mount path and the document-repo's own remote in the README's "Project Structure" section so a new dev doesn't mistake it for a regular bind-mounted volume with no git history.

---

## 7. Structure Health Checklist

- [ ] Can a new dev tell what's an app vs. shared package at a glance?
- [ ] Is there exactly one `tsconfig.base.json`, not one per app?
- [ ] Are route groups used for layout/access separation, not separate apps?
- [ ] Is there a `utils/`/`helpers/` folder with more than ~10 unrelated files? (red flag)
- [ ] Does `pnpm-workspace.yaml` match the actual `apps/`/`packages/` folders on disk?
