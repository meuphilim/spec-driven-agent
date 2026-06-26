# SKILL: spec.md
> `/spec` · toda tarefa nova sem especificação clara

## QUANDO CRIAR
Toda feature · refactor com impacto em >1 arquivo · bug com diagnóstico incerto · mudança em interface pública

---

## TEMPLATE

```markdown
# SPEC: [título]
**Data:** YYYY-MM-DD  **Tipo:** FEAT|FIX|REFACTOR|INFRA|DOCS  **Status:** RASCUNHO|APROVADA|CANCELADA

## Contexto
[Por que existe? Qual problema resolve?]

## Objetivo
[O que deve ser verdade quando concluído?]

## Escopo
### Inclui
- [o que entra]
### Exclui
- [o que NÃO entra]

## Comportamento Esperado
[Como o sistema se comporta após a mudança. Use exemplos concretos.]

## Critérios de Aceite
- [ ] [condição verificável]

## Riscos e Dependências
[O que pode dar errado? O que precisa estar pronto antes?]
```

---

## VALIDAÇÃO
Antes de aprovar, verifique:
- Objetivo mensurável? (dá pra saber quando está "pronto")
- Exclusões claras? (sem elas o escopo cresce)
- Critérios testáveis? (cada um pode ser ✅ ou ❌)
- Riscos mapeados?

---

## GATE OBRIGATÓRIO

Após gerar a spec, produza exatamente este bloco e **pare**:

```
┌─ SPEC GATE ──────────────────────────────────────────┐
│ 📋 Spec: [título]                                     │
│ Arquivo: .claude/sda/specs/[nome].md                             │
│ Status: RASCUNHO                                      │
│                                                       │
│ Checklist:                                            │
│ [x] Objetivo mensurável                               │
│ [x] Exclusões claras                                  │
│ [x] Critérios testáveis                               │
│ [x] Riscos mapeados                                   │
│                                                       │
│ ✋ Aprovado? Responda "aprovado" para continuar.      │
└───────────────────────────────────────────────────────┘
```

**Sem "aprovado" explícito → não avance para `/plan`.**
Se o usuário pedir para pular: registre `Status: CANCELADA — motivo: [razão]` e documente o risco.

## REGRAS
- Specs canceladas registram motivo
- Specs ficam em `.claude/sda/specs/`
