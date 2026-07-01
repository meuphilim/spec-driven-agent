# Spec-Driven Agent Framework

> **Versão:** 5.1.3 | **Status:** Production Ready | **Última atualização:** 2026-07-01

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-5.1.3-blue.svg)](https://github.com/meuphilim/spec-driven-agent)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-25%2F25-brightgreen.svg)](https://github.com/meuphilim/spec-driven-agent)

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
- **8 Reference Guides** — Boas práticas completas
- **Ponytail** — Filosofia YAGNI integrada
- **25 Testes** — Cobertura automatizada

---

## Conceitos Fundamentais

### Dois Modos de Operação

| Modo | Quando | Fluxo | Tokens |
|---|---|---|---|
| **FULL** | Tarefas M/G/XG | Completo com GATEs | ~15.000 |
| **LITE** | Tarefas P (simples) | Compacto, sem GATEs | ~1.500 |

**Detecção automática:** Effort `low` = modo LITE

### Modo LITE

```
🎯 CLASSIFY:P → EXECUTE → 📝 REFLECT:1L
```

- Spec inline (não cria arquivo)
- Plan automático (sem GATE)
- Reflect: 1 linha

### Modo FULL

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

## Comandos

### CLI

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

## Validação

### Protocolo de Validação (v5.1)

O framework inclui protocolo completo para validar:

1. **Modo LITE** — 10 tarefas P com coleta de métricas
2. **Knowledge Base** — 5 sessões com consolidação

Consulte `VALIDATION-PROTOCOL.md` para detalhes.

### Testes Automatizados

```bash
node cli/test.js       # 11 testes principais
node cli/test-lite.js  # 8 testes do Modo LITE
```

**Total: 19 testes — todos passando ✅**

---

## Segurança

| Medida | Status |
|---|---|
| Shell injection fix | ✅ execFileSync |
| Path sanitization | ✅ Blocklist completa |
| JSON injection fix | ✅ jq -n --arg |
| SECURITY.md | ✅ Política definida |
| CODE_OF_CONDUCT.md | ✅ Contributor Covenant |

---

## Economia de Tokens

| Cenário | Antes | Depois | Economia |
|---|---|---|---|
| Tarefa P | 3.000 | 1.200 | **-60%** |
| Tarefa M | 15.000 | 10.500 | **-30%** |
| Sessão (5 tarefas) | 75.000 | 48.000 | **-36%** |

---

## Roadmap

### v5.1 (Atual) ✅

- [x] Modo Lite (-60% tokens)
- [x] Few-shot examples
- [x] Knowledge loading condicional
- [x] Observabilidade leve
- [x] 8 reference guides
- [x] Ponytail integration
- [x] Dashboard de métricas
- [x] npm publish automático
- [x] 19 testes automatizados
- [x] SECURITY.md + CODE_OF_CONDUCT.md
- [x] Validation protocol
- [x] Session templates

### v5.2 (Planejado)

- [ ] Dashboard visual de métricas
- [ ] Suporte a múltiplos modelos LLM
- [ ] Plugin system para skills customizadas

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
