# 0003 — LITE/FULL Dual Mode com Triviality Override

## Status
`accepted`

## Contexto
O SDD de 7 fases com GATEs consome ~15.000 tokens por iteração FULL. Para tarefas triviais (1 linha de config, ajuste de CSP), o overhead era desproporcional. A tabela CLASSIFY original mapeava INFRA → medium → FULL sem considerar escopo real.

Auditoria de 2026-07-06 (CSP de 1 linha em Projeto-Teste) demonstrou que até tarefas INFRA podem ser triviais.

## Decisão
Implementar dois modos: FULL (SDD completo para M/G/XG) e LITE (CLASSIFY → Execute → Reflect 1L para tarefas P). Adicionar Triviality Override: 4 critérios objetivos (1 arquivo, ≤5 linhas, zero breaking, zero dependência, zero lógica nova) — se todos "sim", override para LITE independente do tipo.

## Consequências
- (+) Economia significativa de tokens em tarefas triviais
- (+) Menos atrito para mudanças simples
- (+) Decisão objetiva (4 critérios) vs subjetiva
- (-) Risco de falso positivo (qualquer critério "não" mantém FULL)

## Alternativas Consideradas
- **Modo único FULL:** Simples mas caro — rejeitado
- **Detecção por modelo:** Imprevisível — rejeitado
- **Apenas score P:** INFRA escapava — rejeitado

## Metadados
- **Data:** 2026-07-07
- **Autor:** Samantha (via auditoria CSP)
- **Fase SDD de origem:** Validate → Reflect
