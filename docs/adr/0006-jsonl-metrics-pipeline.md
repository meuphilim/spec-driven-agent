# 0006 — Métricas via JSONL + Snapshots

## Status
`accepted`

## Contexto
O framework não tinha visibilidade sobre custo, tokens, ou progresso. Sem métricas, não era possível demonstrar economia LITE vs FULL nem tomar decisões de roteamento informadas. Necessário sistema offline, incremental, com consulta rápida.

## Decisão
Pipeline em 3 camadas: Eventos (JSONL append-only), Snapshots (agregação pré-computada), Dashboard (TUI + Web com SSE live). Economia LITE vs FULL via rastreamento cronológico de modo.

## Consequências
- (+) Zero dependências externas (HTTP nativo, JSONL simples)
- (+) Consulta rápida via snapshots pré-computados
- (+) Economia demonstrável com dados reais
- (-) JSONL não indexado (não é problema no volume atual)

## Alternativas Consideradas
- **SQLite:** Mais rápido mas dependência extra — rejeitado
- **SaaS:** Custo e latência — rejeitado

## Metadados
- **Data:** 2026-07-04
- **Autor:** Samantha
- **Fase SDD de origem:** Design → Execute
