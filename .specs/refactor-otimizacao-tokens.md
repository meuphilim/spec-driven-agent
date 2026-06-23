# SPEC: refactor-otimizacao-tokens

**Data:** 2026-06-22
**Tipo:** REFACTOR
**Status:** RASCUNHO

---

## Contexto

O framework tem 44 arquivos .md com 4240 linhas. Há redundâncias significativas:
- Templates repetidos entre skills
- Instruções duplicadas (ex: "nunca assuma" aparece em context.md e CLAUDE.md)
- Formatos de relatório muito verbosos
- Seções explicativas desnecessárias quando o template já é claro

## Objetivo

Reduzir consumo de tokens em ~30-40% sem alterar comportamento, resultados ou precisão.

## Escopo

### Inclui
- Análise de redundâncias entre skills
- Consolidação de templates repetidos
- Simplificação de instruções verbosas
- Remoção de explicações óbvias
- Manutenção de todos os fluxos e resultados

### Exclui
- Mudança de comportamento (resultados devem ser idênticos)
- Remoção de funcionalidades
- Mudança de nomes de comandos
- Alteração de templates de spec/plan

## Comportamento Esperado

- Skills menores (menos tokens para carregar)
- Mesmos resultados de saída
- Mesma precisão nas instruções
- Fluxos idênticos

## Critérios de Aceite

- [ ] Análise de redundâncias documentada
- [ ] Cada skill otimizada mantendo funcionalidade
- [ ] CLAUDE.md simplificado
- [ ] Redução de ~30-40% em linhas totais
- [ ] Nenhum fluxo alterado
- [ ] Teste mental: cada skill gera mesmo resultado antes/depois
