# SKILL: debug.md
> `/debug` · investigação sem causa raiz conhecida

```
FIX  → causa raiz conhecida
DEBUG → causa raiz desconhecida → use esta skill
```

---

## FLUXO
```
SINTOMA → COLETA → HIPÓTESES → FILTRO → BISECT → ISOLAMENTO → CAUSA → RELATÓRIO
```

### 1. Coleta (antes de qualquer hipótese)
```
- Observado vs Esperado
- Passos para reproduzir · Frequência (sempre/intermitente/condicional)
- Ambiente (OS, runtime, branch) · Última vez que funcionou
- Logs disponíveis · Mudanças recentes · Dados de entrada
```
Regra: **sem logs, sem hipótese.**

### 2. Hipóteses — listar TODAS antes de testar
```
Hipótese A: [descrição]
- Evidência a favor/contra · Como testar · Custo: Baixo|Médio|Alto
```
Testar primeiro: **menor custo que exclui mais possibilidades**.

### 3. Testar — uma hipótese por vez
```
🟢 A INVALIDADA → motivo → próximo: B
🔴 B CONFIRMADA → achado
```

### 4. Bisect (regressões)
```bash
git bisect start
git bisect bad HEAD && git bisect good <último-bom>
# marcar good/bad até encontrar commit culpado
git bisect run <comando-de-teste>
```

### 5. Isolamento
| Técnica | Quando |
|---|---|
| Minimal reproducer | Remover variáveis até o bug sumir |
| A/B test | Variar 1 parâmetro por vez |
| Log differential | Comparar logs sucesso vs falha |
| Reverter mudanças | Uma a uma |
| Mudar ambiente | OS/browser/versão diferente |

### 6. Causa Raiz
```
🔍 CAUSA RAIZ
Causa: [1-2 linhas] · Tipo: LÓGICA|ESTADO|TIPAGEM|CONTRATO|AMBIENTE|TIMING|INFRA
Onde: [arquivo:linha] · Introduzida: [commit/versão]
Por que não detectada: [teste faltando, cenário não coberto]
Mecanismo: [como X causa Y na linha Z]
Solução candidata: [direção — correção é escopo do /fix]
```

### 7. Próximo passo
| Cenário | Ação |
|---|---|
| Correção simples | `.claude/sda/specs/fix-[desc].md` → `/fix` |
| Correção complexa | spec + `/plan` → `/fix` |
| Fora do escopo | Relatório + recomendar spec separada |
| Não encontrou causa | Relatório do que foi testado + sugestões |

---

## REPORT
```
🔍 DEBUG CONCLUÍDO
Problema: [desc] · Hipóteses: [N total / N invalidadas / N confirmadas]
🔬 CAUSA: [resumo]
📁 Fontes: [logs, código, ambiente]
⚠️ Observações: [o que facilitaria futuros debugs]
➡️ Próximo: [spec de fix | nova investigação | sem solução]
```

---

## REGRAS
- Debug não produz código — só conhecimento
- Após 5 hipóteses sem confirmação: pause e reporte
- Nunca salte do sintoma para correção sem testar ao menos 1 hipótese
- Causa recorrente (2+ sessões) → `@skills/learn.md`
