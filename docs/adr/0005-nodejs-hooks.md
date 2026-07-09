# 0005 — Hooks em Node.js (Migração de Shell Scripts)

## Status
`accepted`

## Contexto
Hooks de validação foram inicialmente shell scripts (.sh). Com Windows como plataforma principal, quebravam por diferenças de PATH, syntax incompatível, e falta de jq. Lógica não trivial (parse JSON, atomicidade) era frágil em shell.

## Decisão
Migrar todos os hooks para Node.js puro (.js). Cada hook recebe contexto via env vars e interage com state.json via fs nativo. Zero dependências npm.

## Consequências
- (+) Portabilidade real (Windows, macOS, Linux)
- (+) Lógica complexa trivial em JS
- (-) Requer Node.js ≥ 18 (já é dependência do framework)

## Alternativas Consideradas
- **PowerShell:** Portabilidade zero — rejeitado
- **Shell + jq polyfill:** Complexidade adicional — rejeitado

## Metadados
- **Data:** 2026-07-04
- **Autor:** Samantha
- **Fase SDD de origem:** Execute → Reflect
