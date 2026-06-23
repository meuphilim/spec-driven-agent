# SPEC: fix-reflect-auto-dispara-learn

**Data:** 2026-06-22
**Tipo:** FIX
**Status:** APROVADA
**GAP:** 5 (Importante)

---

## Contexto

A skill `/reflect` deveria acionar `/learn` quando houver descobertas consolidáveis, mas na prática isso pode não acontecer porque a condição "se identificar padrão consolidável" é ambígua e depende de ação manual do agente.

## Objetivo

Fazer com que `/reflect` SEMPRE verifique se há descobertas para consolidar e execute `/learn` automaticamente quando apropriado.

## Escopo

### Inclui
- Adicionar checklist de consolidação em `skills/reflect.md`
- Tornar a verificação explícita e automática
- Remover ambiguidade da condição

### Exclui
- Mudanças em outras skills
- Mudanças no CLAUDE.md
- Mudanças no protocolo de invalidação

## Comportamento Esperado

Ao finalizar `/reflect`:

1. Verificar se há descobertas marcadas como PADRÃO, HEURÍSTICA ou ANTIPADRÃO
2. Para cada descoberta, buscar em `.sessions/` anteriores
3. Se apareceu em 2+ sessões → executar `/learn` automaticamente
4. Se não → registrar na sessão e aguardar

## Critérios de Aceite

- [ ] Checklist de consolidação adicionado em `reflect.md`
- [ ] Verificação é automática (sem pedir permissão)
- [ ] Execução de `/learn` é automática quando apropriado
- [ ] Registro de "aguardando mais evidências" quando não consolida
- [ ] Teste: executar `/reflect` com descoberta que apareceu em 2+ sessões

## Riscos e Dependências

- **Risco:** Pode consolidar conhecimento prematuramente (mitigado por verificação de 2+ sessões)
- **Dependência:** Nenhuma

## Implementação

Em `skills/reflect.md`, adicionar antes da seção 5:

```markdown
---

### 4.5 Checklist de Consolidação

Antes de decidir sobre consolidação, execute:

- [ ] Há descobertas marcadas como PADRÃO, HEURÍSTICA ou ANTIPADRÃO?
- [ ] Para cada descoberta, buscou em `.sessions/` anteriores?
- [ ] A descoberta apareceu em 2+ sessões?
- [ ] O usuário concorda que vale registrar?

**Se TODOS os itens marcados:**
→ Prossiga com consolidação (execute `/learn`)

**Se ALGUM item não marcado:**
→ Registre na sessão atual e aguarde mais evidências
```

Substituir seção 5 por:

```markdown
### 5. Auto-Consolidação

Após registrar a sessão, verifique automaticamente:

1. **Há descobertas para consolidar?**
   - Se NÃO → finalize a reflexão
   - Se SIM → prossiga

2. **Para cada descoberta, busque evidências:**
```bash
ls .sessions/ | sort -r | head -5
```

3. **Verifique cada sessão:**
   - A descoberta aparece? SIM/NÃO
   - Data da sessão

4. **Conte evidências:**
   - 2+ sessões com evidência → consolide AGORA
   - 1 sessão com evidência → registre e aguarde
   - 0 sessões com evidência → descarte

5. **Se consolidar:** execute `@skills/learn.md`
6. **Se não consolidar:** registre na sessão atual
```
