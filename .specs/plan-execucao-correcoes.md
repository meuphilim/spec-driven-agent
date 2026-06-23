# PLAN: Execução das Correções

**Specs:** fix-context + fix-reflect + fix-learn
**Data:** 2026-06-22
**Estimativa:** ~60 min

---

## ORDEM DE EXECUÇÃO

```
1. fix-context-popula-sessions (GAP 1 - Crítico)
   ↓
2. fix-reflect-auto-dispara-learn (GAP 5 - Importante)
   ↓
3. fix-learn-verifica-evidencias (GAP 6 - Importante)
```

**Por essa ordem:** fix-context popula `.sessions/` que fix-reflect e fix-learn usam.

---

## FIX 1: /context popula .sessions/

**Arquivo:** `skills/context.md`
**Mudança:** Adicionar passo 6 após passo 5
**Esforço:** ~15 min

### Passos
1. Ler `context.md` completo
2. Adicionar seção 6 "Registrar descobertas"
3. Testar mentalmente: executar /context → verificar se registro seria gerado

---

## FIX 2: /reflect auto-dispara /learn

**Arquivo:** `skills/reflect.md`
**Mudança:** Adicionar seção 4.5 + modificar seção 5
**Esforço:** ~15 min

### Passos
1. Ler `reflect.md` completo
2. Adicionar seção 4.5 "Checklist de Consolidação"
3. Substituir seção 5 por "Auto-Consolidação"
4. Testar mentalmente: executar /reflect → verificar se /learn seria acionado

---

## FIX 3: /learn verifica evidências

**Arquivo:** `skills/learn.md`
**Mudança:** Adicionar passo 0 antes do protocolo
**Esforço:** ~30 min

### Passos
1. Ler `learn.md` completo
2. Adicionar seção 0 "Verificar evidências automaticamente"
3. Testar mentalmente: executar /learn → verificar se busca seria feita

---

## CHECKLIST FINAL

- [ ] Fix 1: context.md atualizado
- [ ] Fix 2: reflect.md atualizado
- [ ] Fix 3: learn.md atualizado
- [ ] Todas as mudanças são cirúrgicas (sem reescrita)
- [ ] Formato mantido consistente com skills existentes
