# SPEC: fix-context-popula-sessions

**Data:** 2026-06-22
**Tipo:** FIX
**Status:** APROVADA
**GAP:** 1 (Crítico)

---

## Contexto

A skill `/context` carrega o projeto e lê `.knowledge/`, mas nunca registra descobertas em `.sessions/`. Isso impede que o ciclo de aprendizado funcione, pois não há dados de entrada para `/learn`.

## Objetivo

Fazer com que `/context` registre automaticamente descobertas em `.sessions/` ao final do mapeamento.

## Escopo

### Inclui
- Adicionar passo 6 em `skills/context.md`
- Formato de registro: compacto e padronizado
- Registro automático (sem pedir permissão)

### Exclui
- Mudanças em outras skills
- Mudanças no CLAUDE.md
- Criação de novos arquivos

## Comportamento Esperado

Ao finalizar `/context`, o seguinte deve ser adicionado a `.sessions/YYYY-MM-DD-[projeto].md`:

```markdown
## Contexto Carregado
- Projeto: [nome]
- Stack: [descrição]
- Convenções encontradas: [lista]
- Possíveis melhorias: [lista]
- Alertas: [lista]
```

## Critérios de Aceite

- [ ] Passo 6 adicionado em `context.md`
- [ ] Formato de registro definido
- [ ] Registro é automático (sem pedir permissão)
- [ ] Registro é compacto (máximo 10 linhas)
- [ ] Teste: executar `/context` e verificar se `.sessions/` é populado

## Riscos e Dependências

- **Risco:** Pode gerar muitos registros (mitigado por limite de 10 linhas)
- **Dependência:** Nenhuma

## Implementação

Em `skills/context.md`, adicionar após o passo 5:

```markdown
---

### 6. Registrar descobertas

Ao final do mapeamento, registre em `.sessions/YYYY-MM-DD-[projeto].md`:

```markdown
## Contexto Carregado
- Projeto: [nome do projeto]
- Stack: [descrição resumida]
- Convenções encontradas: [lista com 2-3 convenções principais]
- Possíveis melhorias: [lista ou "nenhuma identificada"]
- Alertas: [lista ou "nenhum"]
```

**Regras:**
- Máximo de 10 linhas
- Formato compacto
- Sem pedir permissão
- Se o arquivo de sessão não existir, crie-o
```
