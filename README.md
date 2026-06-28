# Spec-Driven Agent Framework

> **Versão:** 5.0.0 | **Status:** Production Ready | **Última atualização:** 2026-06-28

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/meuphilim/spec-driven-agent)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

---

## Visão Geral

O **Spec-Driven Agent Framework** é um sistema completo de desenvolvimento orientado por especificações, projetado para agentes LLM (Claude Code). Combina especificação obrigatória, ciclo de aprendizado automático e controle de execução para garantir código de alta qualidade com rastreabilidade completa.

### Por que usar?

- **Disciplina forçada** — GATEs impedem pular etapas críticas
- **Aprendizado contínuo** — knowledge base evolui com cada sessão
- **Controle de execução** — monitoramento de turns e custos
- **Eficiência** — Modo Lite reduz 60% tokens em tarefas simples
- **Reprodutível** — fluxo idêntico para qualquer tarefa
- **Samantha Agent** — Especialista em produtividade e automação
- **8 Reference Guides** — Boas práticas para bash, CI/CD, docs, git, estrutura, testes, segurança, performance
- **Ponytail** — Filosofia YAGNI integrada (lazy senior dev)

---

## Objetivos

1. **Especificar antes de implementar** — toda tarefa começa com uma spec formal
2. **Aprender com cada sessão** — padrões, heurísticas e antipadrões são consolidados
3. **Controlar execução** — limits de turns, hooks de validação, effort levels
4. **Manter contexto leve** — subagents para tarefas paralelas
5. **Garantir qualidade** — code review, testes, reflexão obrigatória
6. **Otimizar tokens** — Modo Lite para tarefas simples (-60% custo)

---

## Conceitos Fundamentais

### Dois Modos de Operação

| Modo | Quando | Fluxo | Tokens |
|---|---|---|---|
| **FULL** | Tarefas M/G/XG | Completo com GATEs | ~15.000 |
| **LITE** | Tarefas P (simples) | Compacto, sem GATEs | ~1.500 |

**Detecção automática:** Effort `low` = modo LITE

### Modo LITE (tarefas P)

```
🎯 CLASSIFY:P → EXECUTE → 📝 REFLECT:1L
```

- Spec inline (não cria arquivo)
- Plan automático (sem GATE)
- Reflect: 1 linha

### Modo FULL (tarefas M/G/XG)

```
MEMÓRIA → CLASSIFY → [ESTIMATE] → SPEC → PLAN → EXECUTE → REPORT → REFLECT
```

### GATEs (Modo FULL)

| GATE | Trigger | O que impede |
|------|---------|--------------|
| **SPEC GATE** | "aprovado" | Código sem spec aprovada |
| **PLAN GATE** | "confirmar" | Código sem plano confirmado |
| **REFLECT GATE** | automático | Tarefa sem reflexão |

### Effort Level

| Effort | Quando | Turns máx | Modo |
|--------|--------|-----------|------|
| `low` | Documentação, tarefas simples | 10 | **LITE** |
| `medium` | Configuração, rotinas | 20 | FULL |
| `high` | Implementação, correções | 40 | FULL |
| `xhigh` | Debug, investigação | 60 | FULL |

### Hooks

| Hook | Quando | Ação |
|------|--------|------|
| `pre-tool` | Antes de tool call | Verificar GATE · Log turn |
| `post-tool` | Após tool call | Registrar resultado · Turn counter |
| `pre-execute` | Antes de código | Confirmar PLAN GATE |
| `post-task` | Ao concluir | Salvar sessão · Coletar métricas |
| `stop` | Ao atingir limite | Salvar · Reportar · Aguardar |

### Knowledge Base

| Tipo | Arquivo | Função |
|------|---------|--------|
| **PADRÃO** | `patterns.md` | Abordagens que funcionam |
| **HEURÍSTICA** | `heuristics.md` | Regras práticas de decisão |
| **ANTIPADRÃO** | `antipatterns.md` | Erros a evitar |

---

## Fluxo de Funcionamento

### Modo LITE (Tarefas P — ~1.500 tokens)

```
🎯 CLASSIFY:P → EXECUTE → 📝 REFLECT:1L
```

### Modo FULL (Tarefas M/G/XG — ~15.000 tokens)

```
1. MEMÓRIA     → Carregar knowledge base (condicional)
2. CLASSIFY    → Identificar tipo + Effort + Modo
3. ESTIMATE    → (Opcional) Avaliar complexidade
4. SPEC GATE   → Criar especificação → Aguardar "aprovado"
5. PLAN GATE   → Gerar plano → Aguardar "confirmar"
6. EXECUTE     → Implementar com monitoramento de turns
7. REPORT      → Resumo do que foi feito
8. REFLECT GATE → Auto-avaliação obrigatória
9. LEARN       → Consolidar padrões na knowledge base
```

---

## Estrutura de Diretórios

```
spec-driven-agent/
├── CLAUDE.md                    # Orquestrador (otimizado para tokens)
├── PONYTAIL.md                  # Filosofia YAGNI
├── package.json
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── cli/                         # CLI npm
│   ├── bin/cli.js               # Comando principal
│   ├── index.js                 # Entry point
│   ├── package.json
│   ├── test.js                  # 11 testes automatizados
│   └── templates/               # ÚNICA fonte canônica
│       ├── CLAUDE.md
│       └── .claude/sda/
│           ├── skills/          # 13 skills + ponytail + references/
│           ├── knowledge/       # patterns, heuristics, antipatterns
│           ├── hooks/           # 8 scripts bash + _utils.sh
│           ├── agents/          # Samantha.md
│           └── specs/
└── .github/workflows/           # CI/CD
    ├── ci.yml
    └── release.yml
```

---

## Instalação

### Pré-requisitos

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instalado
- Node.js >= 18.0.0

### npm (Recomendado)

```bash
npm install -g spec-driven-agent
npx sda init
```

### CLI Local

```bash
npm install
node cli/bin/cli.js init /caminho/para/projeto
```

---

## Comandos Disponíveis

### CLI (npm)

| Comando | Função |
|---------|--------|
| `sda init` | Inicializar framework |
| `sda update` | Atualizar framework |
| `sda status` | Ver status da instalação |
| `sda metrics` | Dashboard de métricas |
| `sda --version` | Ver versão |

### Framework (Claude Code)

| Comando | Função |
|---------|--------|
| `/context` | Mapear projeto |
| `/spec` | Criar especificação |
| `/plan` | Gerar plano |
| `/implement` | Executar implementação |
| `/fix` | Corrigir bug |
| `/debug` | Investigar problema |
| `/refactor` | Reestruturar código |
| `/review` | Code review |
| `/status` | Ver estado atual |
| `/reflect` | Auto-avaliação |
| `/learn` | Consolidar conhecimento |
| `/socrates` | Coletar contexto ausente |

---

## Modo Lite vs Full

### Exemplo: Tarefa P (corrigir typo)

**Modo LITE:**
```
🎯 CLASSIFY: FIX · Effort: low · Modo: LITE
✅ Corrigido "usario" → "usuario" · 📁 lib/auth.ts
📝 PADRÃO: Sempre rodar spellcheck antes de commit
```

**Custo:** ~1.200 tokens

### Exemplo: Tarefa M (adicionar feature)

**Modo FULL:**
```
🎯 CLASSIFY: FEAT · Effort: high · Modo: FULL

📋 SPEC GATE
┌─────────────────────────────────────────────┐
│ Spec: Adicionar validação de email          │
│ ✋ Aprovado? Responda "aprovado"            │
└─────────────────────────────────────────────┘

→ Usuário: "aprovado"

📐 PLAN GATE → EXECUTE → REPORT → REFLECT GATE
```

**Custo:** ~10.500 tokens

---

## Economia de Tokens

| Cenário | Antes (v4.x) | Depois (v5.0) | Economia |
|---|---|---|---|
| Tarefa P | 3.000 tokens | 1.200 tokens | **-60%** |
| Tarefa M | 15.000 tokens | 10.500 tokens | **-30%** |
| Sessão (5 tarefas) | 75.000 tokens | 48.000 tokens | **-36%** |

---

## Reference Guides (8)

| Guia | Quando usar |
|------|-------------|
| `bash-best-practices.md` | Scripts bash, tratamento de erros |
| `ci-cd-patterns.md` | GitHub Actions, Turborepo, caching |
| `documentation-templates.md` | README, ADRs, CHANGELOG |
| `git-workflows.md` | Conventional Commits, branch strategy |
| `project-structure.md` | Monorepo layouts, convenções |
| `testing-patterns.md` | TDD, mocking, cobertura |
| `security-best-practices.md` | OWASP, auth, validação |
| `performance-optimization.md` | Caching, bundle, Core Web Vitals |

---

## Segurança

Consulte [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

Medidas implementadas:
- Input sanitization (sanitizePath com caracteres proibidos)
- execFileSync em vez de execSync (anti-shell injection)
- jq -n --arg para JSON seguro em hooks
- existsSync guards em operações filesystem

---

## Roadmap

### v5.0 (Atual) ✅

- [x] Modo Lite para tarefas P (-60% tokens)
- [x] Few-shot examples em skills
- [x] Knowledge loading condicional
- [x] Observabilidade leve
- [x] 8 reference guides
- [x] Ponytail integration (YAGNI)
- [x] Dashboard de métricas
- [x] npm publish automático
- [x] 11 testes automatizados
- [x] SECURITY.md + CODE_OF_CONDUCT.md
- [x] Shell injection fix
- [x] Path consistency

### v5.1 (Planejado)

- [ ] Suporte a múltiplos modelos de LLM
- [ ] Dashboard web de métricas
- [ ] Plugin system para skills customizadas
- [ ] Multi-language support

---

## Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para guia completo.

---

## Licença

MIT License. Consulte [LICENSE](LICENSE).

---

## Contato

- **Autor:** Meuphilim
- **GitHub:** [@meuphilim](https://github.com/meuphilim)
- **Issues:** [GitHub Issues](https://github.com/meuphilim/spec-driven-agent/issues)
