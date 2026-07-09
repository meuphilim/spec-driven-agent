# SKILL: plan.md
> `/plan` · após spec aprovada

**Pré-requisitos:**
1. Spec com `Status: APROVADA` — se não existir → `@.claude/sda/skills/spec.md`
2. Design com `Status: APROVADO` (DESIGN GATE) — se não existir → `@.claude/sda/skills/design.md`
   *Pular Design exige justificativa registrada e aprovação explícita.*

---

## TEMPLATE

```markdown
# PLANO: [título da spec]
**Spec:** .claude/sda/specs/[arquivo].md  **Estimativa:** P|M|G

## Passos
### Passo 1: [nome]
- Ação: criar|editar|deletar · Arquivo: `path` · Detalhe: [o quê] · Risco: Baixo|Médio|Alto

## Arquivos Impactados
| Arquivo | Mudança | Motivo |
|---|---|---|

## Ordem de Execução
[Dependências entre passos]

## Testes Necessários
- [ ] [critério de aceite da spec]

## Rollback
[Como desfazer se algo der errado]
```

---

## GATE OBRIGATÓRIO

Após gerar o plano, produza exatamente este bloco e **pare**:

```
┌─ PLAN GATE ──────────────────────────────────────────┐
│ 📐 Plano: [título]  Estimativa: [P|M|G]              │
│ Passos: [N]  Arquivos: [N criados / N modificados]   │
│ Risco mais alto: [Baixo|Médio|Alto] — [motivo]       │
│                                                       │
│ 1. Escopo correto?                                    │
│ 2. Arquivos críticos a não tocar?                     │
│ 3. Rollback claro?                                    │
│                                                       │
│ ✋ Confirma? Responda "confirmar" para executar.      │
└───────────────────────────────────────────────────────┘
```

**Sem "confirmar" explícito → não escreva código.**

> Exemplo completo em `@.claude/sda/skills/examples.md` (consulte na primeira vez)

---

## REGRAS
- Passos granulares — menores são mais seguros e reversíveis
- Passo com risco ALTO → discutir antes de executar
- Em mudanças Médio+: não avance sem verificar resultado do passo anterior
- Atualizar plano se escopo mudar

---

## EXECUÇÃO

Delegar ao subagente `architect` com modelo explícito:

```markdown
Agent({
  subagent_type: "architect",
  model: "sonnet",
  prompt: `Analise a spec em .claude/sda/specs/[nome].md e o design (se houver) e produza o PLANO seguindo o template da skill plan.md.

Requisitos:
- Preencher template completo: Passos, Arquivos Impactados, Ordem de Execução, Testes Necessários, Rollback
- Passos devem ser granulares e seguros/reversíveis
- Identificar risco mais alto e justificar
- Basear-se APENAS na spec aprovada + design aprovado (ou justificativa de skip)
- Se escopo mudar durante execução, o plano deve ser atualizado
- Usar português para comentários, inglês para termos técnicos
- Retornar o plano completo no formato do template`
})
```

> **Atenção:** Use explicitamente `model: "sonnet"` no Agent call. O frontmatter `model:` do subagente é ignorado pelo Claude Code (bug #44385). A saída do architect é apresentada ao usuário por Samantha, que gerencia o PLAN GATE.

