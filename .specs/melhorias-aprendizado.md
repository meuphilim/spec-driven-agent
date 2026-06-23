# SPEC: melhorias-aprendizado

**Data:** 2026-06-22
**Tipo:** REFACTOR
**Status:** APROVADA

---

## Contexto

O framework tem um ciclo de aprendizado completo: `/reflect` → `/learn` → `.knowledge/`. Porém, a knowledge base está completamente vazia (3 arquivos sem conteúdo). O protocolo de invalidação em `/learn.md` existe mas nunca foi testado. O gatilho de qualidade em `/reflect.md` (3 sessões sem descobertas) nunca foi acionado. É necessário avaliar se o ciclo de aprendizado está funcionando ou se há gaps que o tornam ineficaz.

## Objetivo

Identificar gaps no ciclo de aprendizado do framework e propor melhorias para torná-lo eficaz em uso real.

## Escopo

### Inclui
- Analisar se `/reflect` gera dados suficientes para `/learn`
- Verificar se os templates de `/learn` são adequados para consolidação real
- Verificar se o protocolo de invalidação é prático (não apenas teórico)
- Verificar se o gatilho de qualidade (3 sessões sem descobertas) é acionável
- Analisar se `.sessions/` é populado corretamente
- Verificar se há automação possível (ex: `/reflect` poderia auto-disparar `/learn`)
- Identificar gaps que impedem o framework de aprender de verdade
- Propor melhorias concretas para cada gap

### Exclui
- Implementação das melhorias (apenas documentação + spec)
- Mudanças no CLAUDE.md (tratado em spec separada)
- Testes reais do ciclo (requer múltiplas sessões de uso)

## Comportamento Esperado

Ao finalizar:
- Análise do fluxo completo de aprendizado (entrada → processamento → saída → reutilização)
- Lista de gaps identificados no ciclo
- Para cada gap: descrição, por que é problema, proposta de correção
- Sugestões de automação (o que poderia ser automatizado)
- Recomendação de quais melhorias teriam maior impacto

## Critérios de Aceite

- [ ] Fluxo de aprendizado está completamente mapeado
- [ ] Todos os gaps estão documentados com proposta de correção
- [ ] Pelo menos 3 melhorias de automação estão propostas
- [ ] Melhorias estão priorizadas por impacto
- [ ] O protocolo de invalidação foi analisado e tem proposta de melhoria (se necessário)

## Riscos e Dependências

- **Risco:** Muitas melhorias podem tornar o framework complexo demais
- **Dependência:** `gaps-integracao.md` deve ser concluído primeiro (garante que integrações estão mapeadas)

## Fora do Escopo / Próximas Specs

- Specs de implementação para cada melhoria proposta
- Mudanças no CLAUDE.md
- Testes reais do ciclo de aprendizado
