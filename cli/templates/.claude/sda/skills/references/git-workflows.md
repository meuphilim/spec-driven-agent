# Git Workflows

Reference for commit conventions, branch strategy, and hook configuration.

---

## 1. Conventional Commits

Format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that's neither a fix nor a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Tooling, build config, deps |
| `ci` | CI/CD pipeline changes |

Examples:

```
feat(auth): add NextAuth RBAC role guard
fix(api): correct prisma transaction rollback on order creation
chore(deps): bump turborepo to 2.x
```

Breaking changes get a `!` and a footer:

```
feat(api)!: rename `userId` to `accountId` across endpoints

BREAKING CHANGE: clients must update field name in all requests.
```

Why it matters beyond style: conventional commits let you auto-generate changelogs and auto-bump semver (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major) via tools like `changesets` or `semantic-release`.

---

## 2. Branch Strategy

For a small-to-mid team monorepo, trunk-based is simpler to operate than full GitFlow:

```
main                    — always deployable
feat/short-description  — short-lived, merged via PR
fix/short-description
chore/short-description
```

Rules of thumb:
- Branches live days, not weeks. Long-lived feature branches accumulate merge conflicts.
- Merge to `main` via squash-merge so history stays one-commit-per-feature and readable.
- Tag releases (`v1.4.0`) on `main` rather than maintaining a permanent `release` branch, unless you need to support multiple versions in parallel (e.g. SaaS + on-prem).

---

## 3. Useful Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  st = status -sb
  co = checkout
  br = branch
  lg = log --oneline --graph --decorate --all
  last = log -1 HEAD
  amend = commit --amend --no-edit
  undo = reset --soft HEAD~1
  cleanup = "!git branch --merged main | grep -v '\\*\\|main' | xargs -r git branch -d"
```

`git cleanup` deletes local branches already merged into `main` — useful after a sprint of small PRs.

---

## 4. Hook Configuration (Husky + lint-staged + commitlint)

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

`.husky/pre-commit`:
```bash
pnpm exec lint-staged
```

`.husky/commit-msg`:
```bash
pnpm exec commitlint --edit "$1"
```

`commitlint.config.js`:
```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"],
    "prisma/schema.prisma": ["prisma format"]
  }
}
```

Optional `pre-push` hook to catch typecheck failures before they hit CI:
```bash
# .husky/pre-push
pnpm turbo run typecheck --filter=...[origin/main]
```

This catches the failure locally in seconds instead of waiting for a CI round-trip.

---

## 5. `.gitignore` Essentials (Node/Next/Nest monorepo)

```gitignore
node_modules/
.turbo/
.next/
dist/
build/
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage/
.vercel/
```

Always commit `.env.example`, never `.env`.

---

## 6. Protecting `main`

At the GitHub repo level (not git config), configure branch protection on `main`:
- Require PR before merging (no direct pushes)
- Require status checks to pass (CI green) before merge
- Require at least 1 approval if more than one person touches the repo
- Optionally require linear history (forces squash or rebase merges)

This is what makes `git push --force` and `git reset --hard` dangerous enough to gate behind `deny`/`ask` in agent permissions — they can rewrite shared history if branch protection isn't airtight.
