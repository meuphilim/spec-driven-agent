# Spec-Driven Agent Framework

> **Versão:** 4.0.0 | **Status:** Production Ready | **Última atualização:** 2026-06-22

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/meuphilim/spec-driven-agent)
[![Claude Code](https://img.shields.io/badge/Claude%20Code- Compatible-green.svg)](https://docs.anthropic.com/en/docs/claude-code)

---

## Visão Geral

O **Spec-Driven Agent Framework** é um sistema completo de desenvolvimento orientado por especificações, projetado para agentes LLM (Claude Code). Ele combina especificação obrigatória, ciclo de aprendizado automático e controle de execução para garantir código de alta qualidade com rastreabilidade completa.

### Por que usar?

- **Disciplina forçada** — GATEs impedem pular etapas críticas
- **Aprendizado contínuo** — knowledge base evolui com cada sessão
- **Controle de execução** — monitoramento de turns e custos
- **Eficiência** — 77% menos tokens que frameworks tradicionais
- **Reprodutível** — fluxo idêntico para qualquer tarefa

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
│                    SPEC-DRIVEN AGENT v4.0                       │
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
projeto/
├── CLAUDE.md              # Orquestrador do framework
├── skills/                # 13 skills modulares
│   ├── context.md         # Mapeamento + memória
│   ├── spec.md            # Template de especificação
│   ├── estimate.md        # Estimativa de complexidade
│   ├── plan.md            # Plano de execução
│   ├── implement.md       # Protocolo de implementação
│   ├── fix.md             # Correção de bugs
│   ├── debug.md           # Investigação exploratória
│   ├── refactor.md        # Reestruturação segura
│   ├── review.md          # Code review
│   ├── status.md          # Estado atual
│   ├── reflect.md         # Auto-avaliação
│   ├── learn.md           # Consolidação de conhecimento
│   └── socrates.md        # Coleta de contexto ausente
├── .knowledge/            # Knowledge base
│   ├── patterns.md        # Padrões validados
│   ├── heuristics.md      # Heurísticas aprendidas
│   ├── antipatterns.md    # Antipadrões identificados
│   └── changelog.md       # Versionamento do knowledge
├── .specs/                # Especificações de tarefas
├── .sessions/             # Histórico de sessões
├── install-framework.bat  # Script de instalação
└── README.md              # Este arquivo
```

---

## Instalação

### Pré-requisitos

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instalado e configurado
- Windows (para script de instalação) ou capacidade de copiar arquivos manualmente

### Opção 1: Script de Instalação (Windows)

```batch
cd D:\Backup 0526\Documents\GitHub\meu-projeto
C:\Users\Meuphilim\Downloads\spec-driven-agent-otimizado.tar\spec-driven-agent\install-framework.bat
```

### Opção 2: Cópia Manual

```bash
# Copiar framework para o projeto
cp -r /caminho/para/spec-driven-agent/* meu-projeto/
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
2. **Hooks são conceituais** — não implementados como código real
3. **Knowledge base jovem** — precisa de mais uso para maturar
4. **Turn limits são sugestões** — agentes podem exceder se necessário
5. **Windows-only** — script de instalação é .bat (não funciona em Linux/Mac)

---

## Roadmap

### v4.1 (Planejado)

- [ ] Hooks implementados como código real
- [ ] Integração com GitHub Actions para validação
- [ ] Dashboard de métricas de uso
- [ ] Suporte a Linux/Mac no install script

### v5.0 (Futuro)

- [ ] Automação completa do ciclo SPEC → PLAN → EXECUTE
- [ ] Integração com CI/CD para validação automática
- [ ] Plugin system para skills customizadas
- [ ] Multi-language support

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
