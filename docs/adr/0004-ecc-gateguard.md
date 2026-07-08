# 0004 — ECC_GATEGUARD (Fact-Forcing para Arquivos Novos)

## Status
`accepted`

## Contexto
Durante edições, o agente criava ou modificava arquivos sem verificar impacto em importadores, API pública, ou schemas de dados. Isso causava breaking changes silenciosas: um campo renomeado em um tipo quebrada consumo em 5 arquivos, mas ninguém sabia até o próximo build.

## Decisão
Implementar ECC_GATEGUARD como hook pre-write que força o agente a declarar, antes da primeira edição de qualquer arquivo novo na sessão: importadores/callers, API afetada, schemas de dados. O gate só libera após declaração.

## Consequências
- (+) Redução drástica de breaking changes silenciosos
- (-) Fricção em markdown sem importadores (aceita "zero importadores" e libera)
- (-) Apenas primeira edição por sessão no arquivo

## Alternativas Consideradas
- **Sempre perguntar:** Ruidoso demais — rejeitado
- **Diff review pós-escrita:** Detecta mas não previne — rejeitado

## Metadados
- **Data:** 2026-07-06
- **Autor:** Samantha
- **Fase SDD de origem:** Execute
