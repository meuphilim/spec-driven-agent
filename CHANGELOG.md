# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [5.1.0] - 2026-06-28

### Added

- **Testes LITE** — 8 testes automatizados para Modo LITE (`test-lite.js`):
  - CLAUDE.md contém definição LITE
  - Tabela dual-mode presente
  - Status skill com formato LITE
  - Context skill com loading condicional
  - Reflect skill com formato compacto
  - Init cria estrutura completa
  - Versão consistente entre arquivos
  - Ponytail integrado
- **Validation Protocol** — Protocolo completo para validar Modo LITE e Knowledge Base:
  - 10 tarefas P com coleta de métricas
  - 5 sessões KB com consolidação
  - Templates de registro padronizados
  - Análise e relatório de resultados
- **Session Template** — Template para coleta de métricas durante validação

### Changed

- **reflect.md** — Adicionado suporte a Modo LITE (formato compacto 1 linha)
- **README.md** — Atualizado para v5.1.0 com badges e documentação completa

---

## [5.0.0] - 2026-06-28

### Added

- **Modo Lite** — Fluxo otimizado para tarefas P (-60% tokens):
  - CLASSIFY:P → EXECUTE → REFLECT:1L
  - Sem GATEs formais, spec inline
  - Detecção automática: effort low = LITE
- **Few-shot examples** — Exemplos completos em spec.md, plan.md, reflect.md
- **Knowledge loading condicional** — Só carrega se ≥5 linhas de conteúdo
- **Observabilidade leve** — Métricas no /status + alerta de overhead
- **Ponytail integration** — Filosofia YAGNI (lazy senior dev)
- **SECURITY.md** — Política de vulnerabilidade
- **CODE_OF_CONDUCT.md** — Código de conduta

### Changed

- **CLAUDE.md** — Comprimido: hooks (30→8 linhas), restrições (10→8 itens)
- **Node.js** — Engine atualizado de >=14 para >=18
- **README** — Reescrito com foco em modos LITE/FULL
- **Status skill** — Modo LITE: 1 linha · Modo FULL: completo

### Fixed

- **Version mismatch** — CLI lê de package.json (single source of truth)
- **save-session.sh path** — `.sessions` → `sessions`
- **CI paths** — `skills/*.md` → caminho correto
- **sanitizePath** — Adicionado blocklist de caracteres
- **isInstalled()** — Verifica `.claude/sda/skills/` em vez de `skills/`

### Removed

- **collect-metrics.sh** — Consolidado em post-task.sh
- **update-turn.sh** — Código morto removido
- **Duplicate skills/hooks/knowledge** — ~3.500 linhas removidas

---

## [4.4.0] - 2026-06-26

### Added

- **Dashboard de Métricas** — Comando `sda metrics` com visualização de:
  - Total de tarefas e taxa de sucesso
  - Skills mais usadas (gráfico de barras)
  - Uso diário (últimos 7 dias)
  - Estatísticas de GATEs
- **collect-metrics.sh** — Hook para coleta automática de métricas
- **Ponytail Plugin** — Integração com filosofia YAGNI (lazy senior dev)

### Changed

- Removidas ~3.500 linhas de duplicação (skills, hooks, knowledge)
- Hooks simplificados com `_utils.sh` compartilhado
- `status.md` agora filtra specs por status (não carrega todas)

### Fixed

- JSON injection em init-session.sh (usando jq)
- Shell injection em cli.js (execFileSync)
- Path inconsistency entre skills e CLAUDE.md
- `update()` crash em installs parciais (existsSync guards)
- Modelo inválido em Samantha.md

---

## [4.3.0] - 2026-06-26

### Added

- **npm publish automático** — Release workflow publica no npm ao criar tag
- **3 novos Reference Guides:**
  - `testing-patterns.md` — Pirâmide de testes, TDD, mocking, cobertura
  - `security-best-practices.md` — OWASP, autenticação, validação, secrets
  - `performance-optimization.md` — Caching, bundle, database, Core Web Vitals
- **publishConfig** — Configuração de acesso público no npm

### Changed

- **cli/package.json** — Versão 4.3.0, publishConfig adicionado
- **README.md** — 8 reference guides documentados

---

## [4.2.0] - 2026-06-25

### Added

- **Samantha Agent** — Agente especializado em produtividade, workflows, automação e documentação
- **References/** — 5 guias de referência para boas práticas:
  - `bash-best-practices.md` — Modo estrito, tratamento de erros, cross-platform
  - `ci-cd-patterns.md` — GitHub Actions, Turborepo, caching, matrix builds
  - `documentation-templates.md` — README, ADRs, CHANGELOG, PR templates
  - `git-workflows.md` — Conventional Commits, branch strategy, hooks
  - `project-structure.md` — Monorepo layouts, convenções de pastas

### Changed

- **CLI init** — Copia automaticamente agents/ e skills/references/
- **CLI update** — Atualiza agents/ e skills/references/ junto com skills
- **CLI status** — Exibe agents/ no checklist de status
- **README.md** — Estrutura de diretórios atualizada com novos componentes

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
