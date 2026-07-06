# Metrics — Event Log & Snapshots

> 🌐 Read this documentation in [English](README_en.md).

Este diretório armazena dados de telemetria local do Spec-Driven Agent.

## Formato

### Eventos brutos (fonte de verdade)

`events-YYYY-MM-DD.jsonl` — append-only, um arquivo por dia.

Cada linha é um objeto JSON com timestamp automático. Construído de forma segura
por `_utils.sh` → `event_logger()` → `json_build()` (usa `jq --arg`, sem interpolação
de strings — comandos com aspas como `grep "pattern"` ou `git commit -m "msg"` são
escapados corretamente).

**Tipos de evento:**

| Evento | Gerado por | Campos principais |
|--------|-----------|-------------------|
| `session_start` | `init-session.sh` | `session_id`, `project`, `model`, `mode` (LITE/FULL) |
| `session_end` | `stop.sh` | `session_id`, `reason` |
| `turn` | `pre-tool.sh` | `turn` (número), `phase`, `effort` |
| `tool` | `post-tool.sh` | `tool` (Read, Write, Edit, Bash...), `file` ou `command` (truncado 80c), `dur_ms`, `effort` |
| `agent` | `post-tool.sh` | `agent_type`, `model`, `dur_ms`, `effort`, `tokens` (objeto com `total`, `input`, `output`, `cache_write`, `cache_read`) |
| `task` | `post-task.sh` | `skill`, `spec`, `success` (boolean), `dur_s` |
| `gate` | `post-task.sh` / `check-gate.sh` | `gate` (spec/design/plan), `status`, `spec` |

### Snapshots (leitura otimizada)

Gerados por `sda dashboard --build`. Arquivos em `snapshots/`:

| Arquivo | Conteúdo |
|---------|----------|
| `daily-YYYY-MM-DD.json` | Agregação do dia (tasks, tokens, skills, agents, gates, economy) |
| `weekly-YYYY-WNN.json`  | Agregação semanal |
| `total.json`            | Agregação total |

Snapshots são cache de leitura. A fonte de verdade é sempre o JSONL.
Se um JSONL for mais novo que o snapshot, o dashboard detecta a stale (via `isSnapshotFresh()`)
e reconstrói automaticamente.

### Economy (LITE vs FULL)

O snapshot inclui `economy` que compara custo de tokens entre modos:

| Campo | Descrição |
|-------|-----------|
| `lite_tokens` | Total de tokens em tarefas LITE |
| `full_baseline_per_agent` | Média de tokens por chamada de agente em FULL (baseline) |
| `estimated_full_tokens` | Quanto as tarefas LITE custariam em FULL |
| `saved_tokens` | Economia real |
| `savings_pct` | Percentual de economia |

O rastreamento é cronológico: `tagEventsWithMode()` processa eventos em ordem,
atribuindo cada `agent`/`task` ao modo ativo no momento (LITE ou FULL).

## Ciclo de Vida

- Eventos com mais de 90 dias são compactados em snapshot mensal.
- Compaction é automático (disparado pelo hook post-task, 1x/dia).
- Após compactação, o JSONL bruto do mês é removido.

## Privacidade

**Zero telemetria.** Todos os dados ficam neste diretório local.
Nada é enviado para servidor externo.

## Comandos

```bash
sda dashboard          # alias: sda metrics (mesmo que --summary)
sda dashboard live     # TUI em tempo real (readline, polling 1s)
sda dashboard summary  # Resumo texto agregado
sda dashboard json     # JSON puro (pipe-friendly)
sda dashboard build    # Reconstrói snapshots do zero
```
