# SPEC: fix-learn-verifica-evidencias

**Data:** 2026-06-22
**Tipo:** FIX
**Status:** APROVADA
**GAP:** 6 (Importante)

---

## Contexto

A skill `/learn` exige que descobertas apareçam em 2+ sessões para consolidar, mas não verifica automaticamente se isso já aconteceu. Depende de ação manual do agente para buscar evidências.

## Objetivo

Fazer com que `/learn` busque evidências em `.sessions/` automaticamente antes de pedir confirmação ao usuário.

## Escopo

### Inclui
- Adicionar passo 0 em `skills/learn.md`
- Busca automática de evidências
- Relatório de evidências para o usuário

### Exclui
- Mudanças em outras skills
- Mudanças no CLAUDE.md
- Mudanças no protocolo de invalidação

## Comportamento Esperado

Ao executar `/learn`:

1. Buscar nas últimas 5 sessões
2. Verificar se a descoberta aparece em cada uma
3. Apresentar relatório de evidências ao usuário
4. Se 2+ sessões com evidência → prosseguir com consolidação
5. Se < 2 sessões → registrar e aguardar

## Critérios de Aceite

- [ ] Passo 0 adicionado em `learn.md`
- [ ] Busca automática funciona
- [ ] Relatório de evidências é apresentado
- [ ] Consolidação só acontece com 2+ evidências
- [ ] Teste: executar `/learn` e verificar busca automática

## Riscos e Dependências

- **Risco:** Busca pode ser lenta (mitigado por limite de 5 sessões)
- **Dependência:** `.sessions/` deve ter registros (GAP 1 deve ser corrigido primeiro)

## Implementação

Em `skills/learn.md`, adicionar antes do protocolo de consolidação:

```markdown
---

### 0. Verificar evidências automaticamente

Antes de pedir confirmação:

1. **Busque nas últimas 5 sessões:**
```bash
ls .sessions/ | sort -r | head -5
```

2. **Para cada sessão, verifique se a descoberta aparece:**
```bash
Select-String -Path .sessions/*.md -Pattern "[palavra-chave]"
```

3. **Apresente ao usuário:**
```
📊 EVIDÊNCIAS ENCONTRADAS
- Sessão YYYY-MM-DD: [aparece? SIM/NÃO]
- Sessão YYYY-MM-DD: [aparece? SIM/NÃO]
- Sessão YYYY-MM-DD: [aparece? SIM/NÃO]
- Total com evidência: [N]/[total]

Recomendação: [consolidar/aguardar]
```

4. **Decida:**
   - N >= 2 → prossiga com consolidação
   - N < 2 → registre na sessão e aguarde
```
