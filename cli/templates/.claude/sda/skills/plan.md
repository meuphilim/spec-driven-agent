# SKILL: plan.md
> `/plan` · após spec aprovada

**Pré-requisito:** Spec com `Status: APROVADA`. Se não existir → `@skills/spec.md`.

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

---

## REGRAS
- Passos granulares — menores são mais seguros e reversíveis
- Passo com risco ALTO → discutir antes de executar
- Em mudanças Médio+: não avance sem verificar resultado do passo anterior
- Atualizar plano se escopo mudar
