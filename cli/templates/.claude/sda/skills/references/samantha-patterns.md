# Samantha — Automation Patterns (consulta sob demanda)

> Carregue este arquivo quando precisar de exemplos concretos de automação.
> Não carregue na inicialização — consulte quando for implementar.

---

## One-Command Setup
```json
// package.json
{
  "scripts": {
    "setup": "node scripts/setup.js",
    "dev": "turbo run dev",
    "db:reset": "prisma migrate reset --force && prisma db seed",
    "test:ci": "turbo run test -- --coverage"
  }
}
```

## Pre-Commit Gate (Husky + lint-staged)
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```
```bash
// .husky/pre-commit
pnpm exec lint-staged
```

## Bash Script Boilerplate
```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "🔄 Executando..."
# ... commands ...
echo "✅ Done!"
```

## README Structure
```markdown
# Project Name

## Prerequisites
- Node.js >= 20, pnpm, Docker

## Quick Start
git clone ... && pnpm install && pnpm setup && pnpm dev

## Available Scripts
- pnpm dev — dev server
- pnpm build — production build
- pnpm test — test suite
```
