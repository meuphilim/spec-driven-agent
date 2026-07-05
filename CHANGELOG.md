# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [5.2.0] - 2026-07-05

### Added

- **Dashboard de métricas em tempo real** — `sda dashboard` com 4 subcomandos:
  - `live` — TUI com readline (zero deps), polling state.json + snapshots
  - `summary` — Resumo texto agregado (LITE/FULL, tokens, skills, gates)
  - `json` — JSON puro (pipe-friendly)
  - `build` — Reconstrói snapshots do zero
- **Event store append-only** — `events-YYYY-MM-DD.jsonl` substitui `metrics.json`
- **6 hooks reescritos** — post-tool, post-task, pre-tool, init-session, stop, check-gate
- **Token tracking real** — extrai `tool_response.usage` de subagentes via PostToolUse
- **Compaction automático** — `events-compact.sh`: rotação 90d + snapshot mensal
- **`json_build()` em `_utils.sh`** — função segura para construir JSON via `jq --arg`
- **`tasksByMode`** — rastreamento de tarefas LITE vs FULL no snapshot

### Fixed

- **JSON escaping nos hooks** — `event_logger` agora usa `jq --arg` em vez de interpolação de strings. Comandos com aspas (`git commit -m "msg"`, `grep "pattern"`) não quebram mais o JSONL. Fim da perda silenciosa de eventos.
- **Economy separado por modo** — `calculateEconomy()` rastreia modo ativo cronologicamente via `tagEventsWithMode()`. Tokens LITE e FULL em pools separados.
- **Snapshot stale** — `isSnapshotFresh()` detecta JSONL mais novo que snapshot. Auto-rebuild na leitura.
- **Locale fixo** — `toLocaleString('pt-BR')` em todos os displays (teste consistente em qualquer ambiente Node).
- **TUI sem delay** — `renderLive()` chamada imediatamente, sem esperar 1s do `setInterval`.
- **Silent parse error** — `readJsonlFile` descartava linhas mal formatadas sem contador. Agora rastreia em `parse_errors`.

### Changed

- **`event_logger` API** — nova sintaxe `event_logger key="string" num=42@ raw='{"a":1}@'`
  - `@` suffix → valor RAW (números, booleans, null, objetos)
  - sem `@` → string escapada automaticamente por `jq --arg`
- **`sda metrics`** — vira alias para `sda dashboard --summary` (compatibilidade mantida)
- **50 testes** — 24 integração + 15 events unit + 11 dashboard unit

### Performance

- **JSONL append-only** — elimina reescrita de arquivo a cada evento
- **Snapshot cache** — leitura otimizada sem reprocessar JSONL a cada comando
- **Token tracking híbrido** — subagentes via PostToolUse (preciso), ferramentas comuns = "indisponível" (nunca estimar)

---

## [5.1.7] - 2026-07-05

### Added

- **Landing page oficial** — site Astro 5 + Tailwind CSS 4 com 10 seções, dual-theme, terminal hero animado
- **Deploy Vercel** — `vercel.json` com auto-detecção de ambiente, deploy zero-config
- **Deploy GitHub Pages** — workflow `site.yml` com build + publish automático
- **SDD Alignment** — Samantha como orquestradora, 7 fases (Constitution → Reflect), 5 GATEs
- **`design.md` skill** — arquitetura, fluxo de dados, contratos, DESIGN GATE
- **`review.md` skill** — code review automatizado com verificação contra spec
- **`CREDITS.md`** — atribuições oficiais para skills, conceitos e ferramentas
- **SEO completo** — OG tags, Twitter cards, sitemap.xml, robots.txt, canonical URL

### Fixed

- **Vercel build** — corrigido `exit 127` (path do site) e schema `rootDirectory` inválido
- **SVG rendering** — keyframes ausentes, animação blink no Tailwind v4
- **`.gitignore`** — backup e site dirs adicionados

### Changed

- **CLAUD.md** — alinhado ao fluxo SDD completo com Samantha como orquestradora
- **README.md** — badges atualizados, documentação do site adicionada

### Performance / Token Optimization

- **Ponytail skill** — compressão de 117 → 52 linhas (−70% tokens por invocação)
- **Samantha agent** — compactado de 379 → 67 linhas (−75% tokens/sessão se agente primário)
- **Checklists extraídos** — `samantha-audit-checklists.md` (+79 linhas on-demand)
- **Patterns extraídos** — `samantha-patterns.md` (+63 linhas on-demand)
- **Exemplos on-demand** — `examples.md` extraído para referência sem custo fixo

---

## [5.1.6] - 2026-07-04

### Added

- **Testes unitários** — 26 testes para `sanitizePath` em `cli/test-unit.js` (53 total)
- **Cross-platform `mktemp_safe()`** — fallback Node.js para Windows sem `mktemp`
- **CI matricial** — Node 18/20/22 × Ubuntu/Windows (6 jobs) + LITE mode tests
- **`cli/lib/sanitize.js`** — módulo compartilhado extraído para testes isolados

### Fixed

- **Paths `@skills/`** → `@.claude/sda/skills/` em 9+ arquivos (35 correções)
- **`sanitizePath()`** — blocklist expandido de 9→17 metacharacters + `path.resolve`
- **All hooks** — migrados de `$(mktemp)` para `mktemp_safe()`
- **`release.yml`** — `softprops/action-gh-release@v1` → `@v2`

### Changed

- **README.md** — badges, contagem de testes (53), tabela cross-platform
- **CI workflow** — dividido em `lint` (validação) + `test` (matriz) jobs

### Performance / Token Optimization

- **Ponytail skill** — compressão de 117 → 52 linhas (−70% tokens por invocação)
- **Samantha agent** — compactado de 379 → 67 linhas (−75% tokens/sessão se agente primário)
- **Checklists extraídos** — criados `samantha-audit-checklists.md` (+3.8KB on-demand)
- **Patterns extraídos** — criados `samantha-patterns.md` (+1.2KB on-demand)
- **Exemplos compartilhados** — `examples.md` criado (4.4KB on-demand); spec.md, plan.md, reflect.md extraídos (−2.5KB cada)
- **Skills + referências** — de 13 → 14 skills (+1), 8 → 10 referências (+2)

---

## [5.1.4] - 2026-07-01

### Fixed

- **prepublishOnly** — revertido para `node -e` (cross-platform, compatível Windows)
- **Version** — alinhado para 5.1.4 (evita conflito com 5.1.0 existente no npm)

### Changed

- **cli/bin/cli.js** — `makeScriptsExecutable()` usando `fs.chmodSync` (anti-shell injection)
- **package.json (root)** — `private: true`, nome `spec-driven-agent-workspace`
- **.gitignore** — exclui `cli/README.md` e `cli/LICENSE` (gerados por prepublishOnly)
- **cli/package.json** — `LICENSE` adicionado ao `files`

---

## [5.1.3] - 2026-07-01

### Fixed

- **JSON injection** — `init-session.sh` fallback usa `node -e` em vez de heredoc com interpolação
- **bin paths** — validado prefixo `./` para npm publish
- **prepublishOnly** — script cross-platform via `node -e` (compatível Windows/Unix)

### Added

- **Matrix CI** — testes em Node 18/20/22 × Ubuntu/Windows (6 jobs)
- **Testes expandidos** — 17 → 25 testes:
  - sanitizePath: semicolon, pipe, backtick injection
  - bin paths validation
  - update command backup verification
  - index.js exports validation

### Changed

- **ci.yml** — reestruturado com jobs separados (validate + test matrix)

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
