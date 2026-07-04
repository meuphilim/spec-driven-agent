# Samantha — Audit Checklists (consulta sob demanda)

> Carregue este arquivo quando Samantha precisar fazer uma auditoria completa.
> Não carregue na inicialização — consulte apenas quando relevante.

---

## Scripts & CLI (The Engine)
- [ ] Repetitive tasks wrapped in simple commands? (e.g., `pnpm dev`, `pnpm db:reset`)
- [ ] Clear, descriptive script names? (No `script1.sh` or `fix.js`)
- [ ] Cross-platform where possible? (Or explicitly documented if bash-only)
- [ ] Fail fast and loud? (`set -e` in bash, proper error handling in Node/Python)
- [ ] Helpful console logs? (Tell the user what is happening and what failed)
- [ ] Environment variables instead of hard-coded secrets/URLs?

## Git & Version Control (The Safety Net)
- [ ] Git hooks configured? (Husky/lefthook for lint-staged, commitlint, pre-push tests)
- [ ] Conventional commits enforced? (e.g., feat:, fix:, chore:)
- [ ] Aliases for common operations? (e.g., `git co`, `git st`, `git lg`)
- [ ] `.gitignore` comprehensive? (No `node_modules`, `.env`, or OS junk tracked)
- [ ] Branch protection rules documented or configured?

## CI/CD & DevOps (The Pipeline)
- [ ] CI pipeline? (GitHub Actions, GitLab CI, etc.)
- [ ] CI runs: lint, typecheck, tests, build?
- [ ] Caches configured? (node_modules, turbo, docker layers)
- [ ] Deployments automated or painfully manual?
- [ ] Secrets managed properly? (Never in code, use GitHub Secrets/Vault)
- [ ] Staging/preview environment?

## Documentation (The Memory)
- [ ] README.md answers: What is this? How to install? How to run? How to test?
- [ ] CHANGELOG.md maintained (or automated via release tools)?
- [ ] API documentation exists and is up-to-date?
- [ ] ADRs for complex choices?
- [ ] "Why" documented, not just "How"?
- [ ] Onboarding a new dev takes < 15 minutes using only the docs?

## Project Structure (The Skeleton)
- [ ] Consistent folder structure (e.g., `src/`, `tests/`, `scripts/`, `docs/`)
- [ ] Related files co-located or logically grouped?
- [ ] No "junk drawer" folders (like `utils/` with 50 unrelated files)
- [ ] Configuration files grouped or clearly named?
- [ ] Monorepo tools configured if applicable? (Turborepo, Nx, pnpm workspaces)

## Environment & Setup (The Onboarding)
- [ ] `.env.example` exists with all required variables documented?
- [ ] Single "setup" command? (e.g., `pnpm setup` or `make install`)
- [ ] Setup script checks prerequisites? (Node version, Docker running)
- [ ] Docker Compose for local dependencies? (DB, Redis, etc.)
- [ ] Works on a fresh clone without manual "gotchas"?

## Code & Script Quality
- [ ] No `console.log` debug statements (proper logger if needed)
- [ ] Shebangs on bash scripts (`#!/usr/bin/env bash`)
- [ ] Strict modes (`set -euo pipefail` in bash, `"use strict"` in JS)
- [ ] Scripts executable (`chmod +x` or defined in package.json)
- [ ] Standard CLI tools instead of custom re-implementations
- [ ] DRY — no copy-paste logic across scripts
- [ ] All scripts have `--help` flag or clear usage instructions

## Ship-Gate Checklist
### Efficiency
- [ ] No task is done manually more than 3 times a week
- [ ] All repetitive commands have a short alias or script
- [ ] Setup takes < 5 minutes on a fresh machine
- [ ] CI/CD runs in < 10 minutes (with caches)

### Reliability
- [ ] Scripts fail fast and provide actionable error messages
- [ ] Git hooks prevent broken commits (linting, formatting, tests)
- [ ] Environment variables are validated on startup
- [ ] No secrets are hard-coded or committed to git

### Maintainability
- [ ] Folder structure is logical and consistent
- [ ] No "magic" steps (everything is in a script or Makefile)
- [ ] Dependencies are pinned or locked (`pnpm-lock.yaml`)
- [ ] Dead code and unused scripts are removed
