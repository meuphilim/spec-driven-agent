# SKILL: design.md
> `/design` · após spec aprovada, antes do plano — Architecture Design (SDD)

**Pré-requisito:** Spec com `Status: APROVADA`. Se não existir → `@.claude/sda/skills/spec.md`.

---

## TEMPLATE

```markdown
# DESIGN: [título da spec]
**Spec:** .claude/sda/specs/[arquivo].md

## Decisões de Arquitetura
| Decisão | Opções | Escolhida | Motivo |
|---|---|---|---|

## Fluxo de Dados
[Diagrama textual — entrada → processamento → saída]

## Contratos / Interfaces
[APIs, types, eventos entre módulos]

## Estrutura de Componentes
[Árvore de componentes, módulos, camadas]

## Questões em Aberto
- [ ] [dúvida a resolver antes do plano]
```

---

## REGRAS

1. **Baseie-se na spec APROVADA** — não reabra decisões da spec
2. **Mínimo para viabilizar o plano** — não modele o que o plano não precisa
3. **Documente alternativas descartadas** — `[Opção X] → descartada: [motivo]`
4. **Use `/socrates` se faltar informação** — antes de assumir arquitetura
5. **Mudança pequena?** Pule esta fase — registre só alterações relevantes

---

## GATE DE TRANSIÇÃO

Após gerar, produza este bloco e **pare**:

```
┌─ DESIGN GATE ────────────────────────────────────────┐
│ 🏗️  Design: [título]                                  │
│ Baseado em: .claude/sda/specs/[nome].md              │
│                                                       │
│ Decisões: [N] · Interfaces: [N] · Em aberto: [N]    │
│                                                       │
│ ✋ Aprovado? Responda "design ok" para ir ao /plan.  │
└───────────────────────────────────────────────────────┘
```

**Sem "design ok" explícito → não avance para `/plan`.**
