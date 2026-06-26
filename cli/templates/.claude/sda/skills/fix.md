# SKILL: fix.md
> `/fix` · bug com causa raiz conhecida

```
SINTOMA → REPRODUZIR → ISOLAR → CAUSA RAIZ → SPEC → CORRIGIR → VERIFICAR
```

---

### 1. Sintoma
```
- Atual vs Esperado · Reprodução (passos) · Ambiente · Frequência · Logs/erros
```
Se faltarem informações → perguntar antes de investigar.

### 2. Reproduzir
Confirme reprodução antes de qualquer mudança. Sem reprodução → documente e pergunte. Mínimo 3 cenários tentados.

### 3. Isolar
Qual arquivo? Qual função? Qual linha? É estado, lógica, tipagem ou timing?

### 4. Causa Raiz
Identifique **por que** existe, não apenas **onde**.
Tipos: Lógica · Estado · Tipagem · Contrato · Ambiente · Edge case

### 4.5. Complexidade
| Nível | Critério | Próximo passo |
|---|---|---|
| Simples | 1 arquivo, sem risco de regressão | Spec enxuta + corrigir |
| Média | 2-3 arquivos | Spec completa → aguardar aprovação |
| Alta | Múltiplos arquivos ou intermitente | Spec + `/plan` + aprovação |

### 5. Spec do Fix (`.claude/sda/specs/fix-[desc].md`)
```markdown
# SPEC: fix-[desc]
Tipo: FIX
## Causa Raiz
## Correção Proposta
## Arquivos Impactados
## Testes de Verificação
- [ ] Bug original não reproduz
- [ ] Casos relacionados continuam funcionando
```

### 6. Corrigir
Correção mínima para a causa raiz. Não "melhorar" código ao redor — escopo separado.

### 7. Verificar
```
- [ ] Bug original não reproduz
- [ ] Passos testados manualmente
- [ ] Testes automatizados passam
- [ ] Regressão manual rápida
```

---

## REPORT
```
🐛 BUG CORRIGIDO
Causa: [1-2 linhas] · Correção: [o que mudou]
📁 Arquivos: [lista]
✅ Bug: não reproduz · Regressão: [passou / problema em X]
⚠️ Observações: [monitorar]
```
