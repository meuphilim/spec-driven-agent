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
