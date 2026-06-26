# CI/CD Patterns

Reference for GitHub Actions pipelines, caching, and monorepo (Turborepo) builds.

---

## 1. Baseline Pipeline Shape

Every pipeline should run, in order, fast-fail first:

```
1. Install (cached)
2. Lint
3. Typecheck
4. Test
5. Build
6. (on main/tags) Deploy
```

Put the cheapest, fastest-to-fail checks first so a broken PR fails in seconds, not minutes.

---

## 2. GitHub Actions — pnpm + Turborepo Baseline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # needed for turbo's affected-package detection

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Restore turbo cache
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ github.job }}-${{ github.sha }}
          restore-keys: turbo-${{ github.job }}-

      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck test build --cache-dir=.turbo
```

Key points:
- `--frozen-lockfile` — fail the build if `pnpm-lock.yaml` is out of sync instead of silently mutating it.
- `fetch-depth: 0` — Turborepo needs git history to figure out which packages changed.
- `concurrency` block cancels stale runs when new commits land on the same PR — saves minutes/money.

---

## 3. Turborepo: Only Build/Test What Changed

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "test": { "dependsOn": ["build"], "outputs": ["coverage/**"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

For PRs, scope tasks to changed packages only:

```yaml
- run: pnpm turbo run test --filter=...[origin/main]
```

`--filter=...[origin/main]` runs the task on any package changed since `main` *and* anything that depends on it — this is what keeps CI fast as the monorepo grows (Next.js app, NestJS API, shared packages).

---

## 4. Matrix Builds

Useful when you need to validate against multiple Node versions or OSes:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [20, 22]
        os: [ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      # ...
```

Only add OS matrix entries (macOS/Windows runners) if the project genuinely needs to be validated there — they're slower and cost more minutes.

---

## 5. Database-Dependent Tests (Prisma)

Spin up Postgres as a service container, run migrations, then test:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
      - run: pnpm turbo run test
```

Never run `prisma migrate dev` or `migrate reset` in CI — always `migrate deploy` (applies existing migrations, doesn't generate new ones or prompt).

---

## 6. Secrets

- Never echo secrets in logs — GitHub Actions masks known secret values automatically, but only if they're registered as Actions secrets, not hardcoded.
- Use environment-scoped secrets (`environment: production`) for deploy jobs requiring manual approval.
- Rotate any secret that was ever committed to git history, even if since deleted — assume it's compromised.

---

## 7. Deploy Gate Pattern

Keep deploy as a separate job that only runs after CI passes, gated to `main`:

```yaml
jobs:
  ci:
    # ... lint/typecheck/test/build

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "deploy here (Vercel/Docker/etc.)"
```

---

## 8. Caching Checklist

- [ ] pnpm store cached via `actions/setup-node` `cache: pnpm` (or `actions/cache` on `~/.pnpm-store`)
- [ ] Turbo remote/local cache configured (`.turbo` directory or Vercel Remote Cache)
- [ ] Docker layer caching for image builds (`docker/build-push-action` with `cache-from`/`cache-to`)
- [ ] Cache keys include lockfile hash, not just branch name, so stale caches don't leak between dependency changes
