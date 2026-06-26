# Spec-Driven Agent Framework

> **Versão:** 4.2.0 | **Status:** Production Ready | **Última atualização:** 2026-06-26

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-4.2.0-blue.svg)](https://github.com/meuphilim/spec-driven-agent)
[![Claude Code](https://img.shields.io/badge/Claude%20Code- Compatible-green.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)](https://nodejs.org/)

---

## Visão Geral

O **Spec-Driven Agent Framework** é um sistema completo de desenvolvimento orientado por especificações, projetado para agentes LLM (Claude Code). Ele combina especificação obrigatória, ciclo de aprendizado automático e controle de execução para garantir código de alta qualidade com rastreabilidade completa.

### Por que usar?

- **Disciplina forçada** — GATEs impedem pular etapas críticas
- **Aprendizado contínuo** — knowledge base evolui com cada sessão
- **Controle de execução** — monitoramento de turns e custos
- **Eficiência** — 77% menos tokens que frameworks tradicionais
- **Reprodutível** — fluxo idêntico para qualquer tarefa
- **Samantha Agent** — Especialista em produtividade, workflows e automação
- **Reference Guides** — 5 guias de boas práticas (bash, CI/CD, docs, git, estrutura)

---

## Objetivos

1. **Especificar antes de implementar** — toda tarefa começa com uma spec formal
2. **Aprender com cada sessão** — padrões, heurísticas e antipadrões são consolidados
3. **Controlar execução** — limits de turns, hooks de validação, effort levels
4. **Manter contexto leve** — subagents para tarefas paralelas
5. **Garantir qualidade** — code review, testes, reflexão obrigatória

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC-DRIVEN AGENT v4.2                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  MEMORY  │───→│ CLASSIFY │───→│   SPEC   │───→│   PLAN   │  │
│  │ .knowledge│   │ + Effort │    │  GATE    │    │  GATE    │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                              │          │
│       │              ┌───────────────────────────────┘          │
│       │              ▼                                          │
│       │         ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│       │         │ EXECUTE  │───→│  REPORT  │───→│ REFLECT  │   │
│       │         │ + Turns  │    │          │    │  GATE    │   │
│       │         │ + Hooks  │    │          │    │          │   │
│       │         └──────────┘    └──────────┘    └──────────┘   │
│       │                                            │            │
│       │                                            ▼            │
│       │         ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│       └────────→│  LEARN   │◄───│ KNOWLEDGE│◄───│ SESSIONS │   │
│                 │          │    │ .knowledge│   │ .sessions│   │
│                 └──────────┘    └──────────┘    └──────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conceitos Fundamentais

### GATEs

Pontos de verificação obrigatórios que impedem avanço sem aprovação:

| GATE | Trigger | O que impede |
|------|---------|--------------|
| **SPEC GATE** | "aprovado" | Código sem spec aprovada |
| **PLAN GATE** | "confirmar" | Código sem plano confirmado |
| **REFLECT GATE** | automático | Tarefa sem reflexão |

### Effort Level

Profundidade adaptativa por tipo de tarefa:

| Effort | Quando | Turns máx |
|--------|--------|-----------|
| `low` | Documentação, tarefas simples | 10 |
| `medium` | Configuração, rotinas | 20 |
| `high` | Implementação, correções | 40 |
| `xhigh` | Debug, investigação | 60 |

### Hooks

Interceptadores automáticos em cada ponto do ciclo:

| Hook | Quando | Ação |
|------|--------|------|
| `pre-tool` | Antes de tool call | Verificar GATE · Escopo · Log |
| `post-tool` | Após tool call | Verificar resultado · Turn counter |
| `pre-execute` | Antes de código | Confirmar PLAN GATE |
| `post-task` | Ao concluir | Disparar REFLECT · Salvar estado |
| `stop` | Ao atingir limite | Salvar · Reportar · Aguardar |

### Knowledge Base

Aprendizado acumulado em 3 categorias:

| Tipo | Arquivo | Função |
|------|---------|--------|
| **PADRÃO** | `patterns.md` | Abordagens que funcionam |
| **HEURÍSTICA** | `heuristics.md` | Regras práticas de decisão |
| **ANTIPADRÃO** | `antipatterns.md` | Erros a evitar |

---

## Fluxo de Funcionamento

```
1. MEMÓRIA     → Carregar knowledge base e sessões anteriores
2. CLASSIFY    → Identificar tipo (FEAT/FIX/DEBUG/REFACTOR/INFRA/DOCS) + Effort
3. ESTIMATE    → (Opcional) Avaliar complexidade para tarefas ambíguas
4. SPEC GATE   → Criar especificação → Aguardar "aprovado"
5. PLAN GATE   → Gerar plano → Aguardar "confirmar"
6. EXECUTE     → Implementar com monitoramento de turns + hooks
7. REPORT      → Resumo do que foi feito
8. REFLECT GATE → Auto-avaliação obrigatória
9. LEARN       → Consolidar padrões na knowledge base
```

---

## Estrutura de Diretórios

```
spec-driven-agent/
├── CLAUDE.md              # Orquestrador do framework
├── package.json           # Configuração npm
├── README.md              # Este arquivo
├── CONTRIBUTING.md        # Guia de contribuição
├── CHANGELOG.md           # Histórico de versões
├── LICENSE                # Licença MIT
├── .gitignore             # Arquivos ignorados pelo Git
├── .npmignore             # Arquivos ignorados pelo npm
├── cli/                   # CLI npm
│   ├── bin/cli.js         # Comando principal
│   ├── index.js           # Entry point
│   ├── package.json       # Metadados do pacote
│   ├── test.js            # Testes automatizados
│   └── templates/         # Templates do framework
│       ├── CLAUDE.md
│       ├── .claude/sda/
│       │   ├── skills/ (13 + references/)
│       │   ├── knowledge/ (4)
│       │   ├── hooks/ (7 scripts)
│       │   ├── agents/ (Samantha)
│       │   └── specs/
├── .claude/sda/           # Framework instalado
│   ├── skills/            # 13 skills modulares
│   │   ├── context.md     # Mapeamento + memória
│   │   ├── spec.md        # Template de especificação
│   │   ├── estimate.md    # Estimativa de complexidade
│   │   ├── plan.md        # Plano de execução
│   │   ├── implement.md   # Protocolo de implementação
│   │   ├── fix.md         # Correção de bugs
│   │   ├── debug.md       # Investigação exploratória
│   │   ├── refactor.md    # Reestruturação segura
│   │   ├── review.md      # Code review
│   │   ├── status.md      # Estado atual
│   │   ├── reflect.md     # Auto-avaliação
│   │   ├── learn.md       # Consolidação de conhecimento
│   │   ├── socrates.md    # Coleta de contexto ausente
│   │   └── references/    # Guias de referência
│   │       ├── bash-best-practices.md
│   │       ├── ci-cd-patterns.md
│   │       ├── documentation-templates.md
│   │       ├── git-workflows.md
│   │       └── project-structure.md
│   ├── knowledge/         # Knowledge base
│   │   ├── patterns.md    # Padrões validados
│   │   ├── heuristics.md  # Heurísticas aprendidas
│   │   ├── antipatterns.md # Antipadrões identificados
│   │   └── changelog.md   # Versionamento do knowledge
│   ├── agents/            # Agentes especializados
│   │   └── Samantha.md    # Especialista em produtividade
│   ├── specs/             # Especificações de tarefas
│   ├── sessions/          # Histórico de sessões
│   └── hooks/             # Scripts bash de enforcement
└── .github/               # Configuração GitHub
    ├── workflows/
    │   ├── ci.yml         # Pipeline CI
    │   └── release.yml    # Pipeline de release
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE/
```

---

## Instalação

### Pré-requisitos

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instalado e configurado
- Node.js >= 14.0.0 (para instalação via npm)

### Opção 1: npm (Recomendado — Cross-Platform)

```bash
# Instalação global
npm install -g spec-driven-agent

# Ou uso direto via npx
npx spec-driven-agent init

# Ou com alias mais curto
npx sda init
```

### Opção 2: CLI Local

```bash
# No diretório do repositório
npm install
node cli/bin/cli.js init /caminho/para/projeto

# Ou via script npm
npm run init
```

### Opção 3: Clone do Repositório

```bash
git clone https://github.com/meuphilim/spec-driven-agent.git
cp -r spec-driven-agent/* meu-projeto/
```

---

## Uso

### Iniciar uma Sessão

Ao abrir um projeto com o framework instalado:

```
1. O CLAUDE.md do framework assume o controle
2. Knowledge base é carregada automaticamente
3. Fluxo obrigatório é ativado
```

### Exemplo: Criar uma Feature

```
🎯 CLASSIFY: FEAT · Effort: high

📋 SPEC GATE
┌─────────────────────────────────────────────┐
│ Spec: Adicionar autenticação OAuth          │
│ Status: RASCUNHO                            │
│                                             │
│ ✋ Aprovado? Responda "aprovado"            │
└─────────────────────────────────────────────┘

→ Usuário: "aprovado"

📐 PLAN GATE
┌─────────────────────────────────────────────┐
│ Plano: 5 passos · 3 arquivos               │
│ Risco: Médio — integração com API externa   │
│                                             │
│ ✋ Confirma? Responda "confirmar"           │
└─────────────────────────────────────────────┘

→ Usuário: "confirmar"

🔄 EXECUÇÃO · Turn: 1/40
✅ Passo 1: Criar types · 📁 auth/types.ts
🔄 EXECUÇÃO · Turn: 2/40
✅ Passo 2: Implementar provider · 📁 auth/provider.ts
...

✅ RESULTADO · Turns: 8 · Arquivo: auth/

🪞 REFLECT GATE
┌─────────────────────────────────────────────┐
│ Funcionou: Tipos bem definidos antes        │
│ Atrito: Integração com OAuth mais complexa  │
│ Descobertas: PADRÃO — definir types primeiro│
└─────────────────────────────────────────────┘
```

### Comandos Disponíveis

#### CLI (npm)

| Comando | Função |
|---------|--------|
| `sda init` | Inicializar framework no diretório atual |
| `sda init <dir>` | Inicializar framework em diretório específico |
| `sda update` | Atualizar framework para última versão |
| `sda status` | Ver status da instalação |
| `sda --version` | Ver versão |
| `sda --help` | Ver ajuda |

#### Framework (Claude Code)

| Comando | Função |
|---------|--------|
| `/context` | Mapear projeto + carregar memória |
| `/spec` | Criar especificação |
| `/estimate` | Estimar complexidade |
| `/plan` | Gerar plano de execução |
| `/implement` | Executar implementação |
| `/fix` | Corrigir bug |
| `/debug` | Investigar problema |
| `/refactor` | Reestruturar código |
| `/review` | Code review |
| `/status` | Ver estado atual |
| `/reflect` | Auto-avaliação |
| `/learn` | Consolidar conhecimento |
| `/socrates` | Coletar contexto ausente |

### Samantha Agent

Agente especializado em produtividade, workflows, automação e documentação técnica.

| Área | Descrição |
|------|-----------|
| **Workflows** | Analisar fluxos, identificar gargalos, sugerir melhorias |
| **Documentação** | READMEs, docs de API, changelogs, ADRs |
| **Organização** | Listas de tarefas, estruturas de pastas, repos |
| **Automação** | Scripts, git hooks, CI/CD, deploys |

### Reference Guides

Guias de boas práticas carregados sob demanda:

| Guia | Quando usar |
|------|-------------|
| `bash-best-practices.md` | Scripts bash, tratamento de erros, cross-platform |
| `ci-cd-patterns.md` | GitHub Actions, Turborepo, caching |
| `documentation-templates.md` | README, ADRs, CHANGELOG, PR templates |
| `git-workflows.md` | Conventional Commits, branch strategy |
| `project-structure.md` | Monorepo layouts, convenções de pastas |

---

## Casos de Uso Práticos

### 1. Nova Feature Complexa

```
Tipo: FEAT · Effort: high
→ SPEC GATE → PLAN GATE → EXECUTE (40 turns) → REFLECT → LEARN
```

### 2. Correção de Bug Simples

```
Tipo: FIX · Effort: high
→ SPEC GATE (enxuta) → EXECUTE (5 turns) → REFLECT
```

### 3. Investigação de Bug Desconhecido

```
Tipo: DEBUG · Effort: xhigh
→ /debug (investigar) → SPEC de fix → /fix → REFLECT → LEARN
```

### 4. Refatoração Grande

```
Tipo: REFACTOR · Effort: high
→ SPEC GATE → PLAN GATE → EXECUTE com subagents → REFLECT → LEARN
```

### 5. Projeto Legado

```
→ /context (detecta legado) → protocolo legado → estabilizar → evoluir
```

---

## Boas Práticas

### Sempre

- ✅ Seguir o fluxo completo (CLASSIFY → SPEC → PLAN → EXECUTE → REFLECT)
- ✅ Declarar effort level no início
- ✅ Respeitar GATEs (não pular)
- ✅ Usar subagents para tarefas longas
- ✅ Consolidar aprendizados via /learn

### Nunca

- ❌ Pular etapas por "ser simples"
- ❌ Implementar sem spec aprovada
- ❌ Escrever código sem plano confirmado
- ❌ Encerrar sem reflexão
- ❌ Ignorar knowledge base

---

## Limitações Conhecidas

1. **Dependência de disciplina** — GATEs dependem de triggers de texto
2. **Knowledge base jovem** — precisa de mais uso para maturar
3. **Turn limits são sugestões** — agentes podem exceder se necessário

---

## Roadmap

### v4.2 (Atual) ✅

- [x] CLI npm cross-platform (init, update, status)
- [x] GATEs obrigatórios (SPEC, PLAN, REFLECT)
- [x] Effort levels adaptativos
- [x] Monitoramento de turns
- [x] Hooks implementados como código real (8 scripts bash)
- [x] Socrates Gate
- [x] Subagents para contexto leve
- [x] GitHub Actions CI/CD
- [x] Testes automatizados (9/9)
- [x] Samantha Agent (especialista em produtividade)
- [x] Reference Guides (5 guias de boas práticas)
- [x] Fix shell injection (execFileSync)

### v4.3 (Planejado)

- [ ] Dashboard de métricas de uso
- [ ] Integração com npm publish automático
- [ ] Suporte a múltiplos modelos de LLM
- [ ] Mais reference guides (testing, security, performance)

### v5.0 (Futuro)

- [ ] Automação completa do ciclo SPEC → PLAN → EXECUTE
- [ ] Plugin system para skills customizadas
- [ ] Multi-language support
- [ ] Interface web para gerenciamento

---

## Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para guia completo de contribuição.

---

## Licença

Este projeto está licenciado sob a licença MIT. Consulte [LICENSE](LICENSE) para detalhes.

---

## Contato

- **Autor:** Meuphilim
- **GitHub:** [@meuphilim](https://github.com/meuphilim)
- **Issues:** [GitHub Issues](https://github.com/meuphilim/spec-driven-agent/issues)
