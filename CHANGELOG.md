# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [4.0.0] - 2026-06-22

### Added

- **Effort Level** — Profundidade adaptativa por tipo de tarefa (low/medium/high/xhigh/max)
- **Hooks de Validação** — pre-tool, post-tool, pre-execute, post-task, stop
- **Monitoramento de Turns** — Limites por effort level (10/20/40/60)
- **Padrão de Mensagens** — Formato padronizado para Init/Turn/Result/Bloqueio
- **Subagents** — Protocolo para pesquisa longa, análise paralela e tarefas isoladas
- **Socrates Gate** — Mecanismo para coletar contexto ausente via perguntas estruturadas
- **GATEs Obrigatórios** — SPEC GATE, PLAN GATE, REFLECT GATE

### Changed

- **CLAUDE.md** — Atualizado com features do Agent Loop (v4.0)
- **estimate.md** — Integrado effort level ao score de complexidade
- **implement.md** — Adicionado monitoramento de turns durante execução
- **Todas as skills** — Otimizadas para menor consumo de tokens

### Fixed

- **GAP 1** — `/context` agora registra descobertas em `.sessions/`
- **GAP 5** — `/reflect` sempre verifica consolidação via `/learn`
- **GAP 6** — `/learn` verifica evidências automaticamente

---

## [3.1.0] - 2026-06-22

### Added

- **SPEC GATE** — Aguarda "aprovado" antes de criar plano
- **PLAN GATE** — Aguarda "confirmar" antes de escrever código
- **REFLECT GATE** — Força reflexão antes de encerrar tarefa
- **Restrições com violações** — `⛔ VIOLAÇÃO` para pular etapas

### Changed

- **CLAUDE.md** — Simplificado de 276 para 138 linhas (-50%)
- **Todas as skills** — Compactadas usando `·` como separador

---

## [3.0.0] - 2026-06-22

### Added

- **Otimização de tokens** — 48% de redução em skills (1270 → 662 linhas)
- **Formato compacto** — Tabelas enxutas, templates inline
- **Consolidação de redundâncias** — Instruções duplicadas removidas

---

## [2.0.0] - 2026-06-22

### Added

- **Socrates Gate** — Coleta de contexto ausente via perguntas
- **Correções de integração** — context, reflect, learn sincronizados
- **Knowledge base populada** — 3 padrões, 1 heurística, 1 antipadrão

### Fixed

- **GAP 1** — `/context` popula `.sessions/`
- **GAP 5** — `/reflect` dispara `/learn` automaticamente
- **GAP 6** — `/learn` verifica evidências antes de consolidar

---

## [1.0.0] - 2026-06-21

### Added

- **Framework base** — 12 skills iniciais
- **CLAUDE.md** — Orquestrador com fluxo obrigatório
- **Knowledge base** — Estrutura para padrões, heurísticas e antipadrões
- **Sessions** — Histórico de execuções
- **Skills**: context, spec, estimate, plan, implement, fix, debug, refactor, review, status, reflect, learn
