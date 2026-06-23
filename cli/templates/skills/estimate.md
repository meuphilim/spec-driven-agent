# SKILL: estimate.md
> `/estimate` · antes de spec para avaliar complexidade

## QUANDO USAR
Antes de criar/aprovar spec · durante `/plan` · quando usuário perguntar "quanto tempo?"

---

## PROTOCOLO

### 1. Arquivos impactados
```
Criar: [N] · Modificar: [N] · Remover: [N]
```

### 2. Score de Risco

| Fator | 0 pts | 1 pt | 3 pts |
|---|---|---|---|
| Arquivos | 1-2 | 3-5 | 6+ |
| Testes | >80% | 20-80% | <20% |
| Deps externas | Nenhuma | 1-3 | 4+ ou crítica |
| Domínio | Já implementado | Conhecido | Novo |
| Regressão | Isolado | 1 módulo | Cross-cutting |
| Requisitos | Especificado | Parcial | Ambíguo |
| Interface pública | Nenhuma | Interna | API externa |

### 3. Complexidade + Effort Level

| Score | Tamanho | Estimativa | Effort | Ação |
|---|---|---|---|---|
| 0-3 | 🟢 P | <2h | `low` | Spec enxuta + executar |
| 4-8 | 🟡 M | 2-8h | `medium` | Spec completa + plan |
| 9-15 | 🔴 G | 8-40h | `high` | Dividir em sub-specs |
| 16+ | ⚫ XG | 40h+ | `xhigh` | Repensar escopo |

> Effort do tipo de tarefa (CLAUDE.md §CLASSIFY) prevalece se for maior que o effort do tamanho. Ex: um FIX de score P ainda usa `high`.

### 4. Tarefas G/XG — dividir obrigatoriamente
```
⚠️ TAREFA GRANDE: [G/XG] — [X horas]
Sub-specs sugeridas:
1. .specs/[sub-1].md → [P/M]
2. .specs/[sub-2].md → [P/M]
Dependências: [sub-1 → sub-2]
```

### 5. Calibragem pós-tarefa (em `/reflect`)
```
Estimativa: [P/M/G/XG] · Real: [horas] · Desvio: [sub/super/acerto] · Causa: [fator imprevisto]
```

---

## REGRAS
- Não cria nem modifica arquivos — só analisa
- Nunca estime sem varrer os arquivos alvo
- Em G/XG, nunca prossiga sem dividir escopo
