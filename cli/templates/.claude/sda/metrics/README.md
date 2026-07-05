# Metrics — Event Log & Snapshots

Este diretório armazena dados de telemetria local do Spec-Driven Agent.

## Formato

### Eventos brutos (fonte de verdade)

`events-YYYY-MM-DD.jsonl` — append-only, um arquivo por dia.

Cada linha é um objeto JSON com os campos:

| Campo     | Tipo     | Descrição                                    |
|-----------|----------|----------------------------------------------|
| `ts`      | string   | ISO 8601 timestamp                           |
| `event`   | string   | `session_start`, `session_end`, `turn`, `tool`, `agent`, `gate`, `task` |
| ...       | variado  | Campos específicos por tipo de evento        |

### Snapshots (leitura otimizada)

Gerados por `sda dashboard --build`. Arquivos em `snapshots/`:

| Arquivo | Conteúdo |
|---------|----------|
| `daily-YYYY-MM-DD.json` | Agregação do dia |
| `weekly-YYYY-WNN.json`  | Agregação semanal |
| `total.json`            | Agregação total |

Snapshots são cache de leitura. A fonte de verdade é sempre o JSONL.

## Ciclo de Vida

- Eventos com mais de 90 dias são compactados em snapshot mensal.
- Compaction é automático (disparado pelo hook post-task, 1x/dia).
- Após compactação, o JSONL bruto do mês é removido.

## Privacidade

**Zero telemetria.** Todos os dados ficam neste diretório local.
Nada é enviado para servidor externo.
