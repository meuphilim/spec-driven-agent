# 0001 — SDD 7-Phase Flow (Spec-Driven Development)

## Status
`accepted`

## Contexto
O framework foi originalmente construído em torno do fluxo SDA (Spec-Driven Agent), que não distinguia fases de Design e Validate como etapas separadas. Auditoria de 2026-06-21 identificou 6 gaps: Constitution não era fase explícita, acessibilidade ausente, Design não existia entre Spec e Plan, Validate automático não existia, e o fluxo FULL não refletia o SDD padrão da indústria.

## Decisão
Adotar o fluxo SDD completo de 7 fases: Constitution → Specify → Design → Plan → Execute → Validate → Reflect. Cada fase tem GATE obrigatório que bloqueia a transição até aprovação explícita.

## Consequências
- (+) Sequência clara — nenhuma fase pulada sem justificativa
- (+) Design como fase dedicada força reflexão arquitetural
- (+) Validate automático garante código alinhado à spec
- (-) Overhead para tarefas triviais (mitigado pelo modo LITE + Triviality Override)

## Alternativas Consideradas
- **SDA original (3 fases):** Rápido mas sem análise arquitetural — rejeitado
- **Sem fluxo fixo:** Agente decide ordem — rejeitado por inconsistência

## Metadados
- **Data:** 2026-06-21
- **Autor:** Samantha (via auditoria)
- **Fase SDD de origem:** Reflect
