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

---

## EXECUÇÃO

Delegar ao subagente `architect` com modelo explícito:

```markdown
Agent({
  subagent_type: "architect",
  model: "sonnet",
  prompt: `Analise a spec em .claude/sda/specs/[nome].md e produza o DESIGN seguindo o template da skill design.md.

Requisitos:
- Preencher template: Decisões de Arquitetura, Fluxo de Dados, Contratos/Interfaces, Estrutura de Componentes, Questões em Aberto
- Basear-se APENAS na spec aprovada — não reabrir decisões
- Documentar alternativas descartadas com motivo
- Se faltar informação, declarar em "Questões em Aberto" (não assumir)
- Mudança pequena pode pular esta fase — sinalizar se for o caso
- Usar português para comentários, inglês para termos técnicos
- Retornar o design completo no formato do template`
})
```

> **Atenção:** Use explicitamente `model: "sonnet"` no Agent call. O frontmatter `model:` do subagente é ignorado pelo Claude Code (bug #44385). A saída do architect é apresentada ao usuário por Samantha, que gerencia o DESIGN GATE.
