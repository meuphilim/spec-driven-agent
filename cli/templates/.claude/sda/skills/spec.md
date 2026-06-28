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

## EXEMPLO COMPLETO

```markdown
# SPEC: Adicionar validação de email
**Data:** 2026-06-28  **Tipo:** FEAT  **Status:** APROVADA

## Contexto
O formulário de contato aceita emails inválidos, causando erros downstream.

## Objetivo
Validar email no frontend (formato) e backend (existência DNS) antes de salvar.

## Escopo
### Inclui
- Validação Zod no schema do formulário
- Validação DNS no endpoint POST /api/contact

### Exclui
- Validação de deliverability (SMTP check)
- Mudanças no design do formulário

## Comportamento Esperado
- Email inválido no frontend → mensagem de erro inline
- Email válido no frontend mas inválido no DNS → erro 422 na API
- Email válido → salvamento normal

## Critérios de Aceite
- [ ] `test@email.invalid` rejeitado no frontend
- [ ] `user@gmail.com` aceito no frontend e backend
- [ ] `nonexistent@fakedomain.xyz` rejeitado no backend (422)
- [ ] Mensagens de erro em português

## Riscos e Dependências
- DNS validation pode ter falsos negativos (servidores down)
- Timeout de 3s para não bloquear UI
```

## REGRAS
- Specs canceladas registram motivo
- Specs ficam em `.claude/sda/specs/`
