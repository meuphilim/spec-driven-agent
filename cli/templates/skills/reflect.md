# SKILL: reflect.md
> `/reflect` · obrigatório após toda tarefa concluída

---

## PROTOCOLO

### 1. Avaliar execução
- Spec estava clara? Plano foi seguido sem desvios?
- Alguma etapa custou mais do esperado? Algo deveria ter sido identificado antes?
- Critérios de aceite atendidos? Há algo frágil que pode quebrar?
- Decisões não óbvias? Assunções feitas? O que faria diferente?

### 2. Classificar descobertas
| Tipo | Destino |
|---|---|
| 🟢 PADRÃO | `.knowledge/patterns.md` |
| 🔵 HEURÍSTICA | `.knowledge/heuristics.md` |
| 🔴 ANTIPADRÃO | `.knowledge/antipatterns.md` |
| 🟡 MELHORIA DE SKILL | Registrar para `@skills/learn.md` |
| ⚪ OBSERVAÇÃO | Registrar na sessão, rever depois |

### 3. Registrar sessão (`.sessions/YYYY-MM-DD-[projeto].md`)
```markdown
# Sessão: YYYY-MM-DD — [projeto]
## Tarefas: [tipo] [spec] → CONCLUÍDA|PARCIAL|BLOQUEADA
## Decisões: [decisão] → [motivo]
## Funcionou bem: [obs]
## Gerou atrito: [obs + causa]
## Descobertas: [tipo]: [desc] → consolidar|aguardar|nenhuma
## Métricas: desvios [N] · retrabalho [s/n] · bloqueios [N]
```

### 4. Qualidade mínima
Reflexão válida exige **ao menos uma descoberta relevante**.

Se 3 sessões consecutivas sem descobertas:
```
⚠️ ALERTA: 3 sessões sem descobertas.
Possível causa: reflexão automática · tarefas simples · viés de confirmação
Recomendo revisar processo ou aceitar que o projeto não gera aprendizado novo.
```
Dica: tarefas P (pequenas) podem pular `/reflect`.

### 5. Consolidação
Se há descobertas PADRÃO/HEURÍSTICA/ANTIPADRÃO → executar `@skills/learn.md`.

---

## GATE OBRIGATÓRIO

Ao concluir o reflect, produza este bloco antes de encerrar a tarefa:

```
┌─ REFLECT GATE ───────────────────────────────────────┐
│ 🪞 Reflexão: [tarefa]                                │
│                                                       │
│ ✅ Funcionou: [item]                                  │
│ ⚠️  Atrito: [item + causa]                            │
│ 💡 Descobertas: [tipo]: [desc] → consolidar|aguardar │
│                                                       │
│ Sessão gravada em: .sessions/[arquivo]               │
│                                                       │
│ 🔄 Próximo: /learn | aguardar | encerrar             │
└───────────────────────────────────────────────────────┘
```

Se `descobertas` estiver vazio por 3 sessões → emitir alerta de qualidade (ver protocolo §4).
