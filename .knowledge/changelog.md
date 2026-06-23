# changelog.md — Histórico Versionado do Knowledge Base

> Registro cronológico de tudo que foi adicionado, modificado ou invalidado
> no conhecimento do projeto (`.knowledge/`).
>
> Permite rastrear quando um padrão foi aprendido e, mais importante,
> quando foi invalidado — evitando que conhecimento obsoleto persista.

---

## Estrutura

```
YYYY-MM-DD — [TIPO] [arquivo] — [título do conhecimento]
```

Tipos:
| Tipo | Significado |
|------|-------------|
| `+` ADICIONADO | Novo padrão, heurística ou antipadrão |
| `~` REVISADO | Conteúdo modificado (refinamento) |
| `-` INVALIDADO | Conhecimento removido ou marcado como obsoleto |
| `!` REATIVADO | Conhecimento antes invalidado que voltou a valer |

---

## Registro

### 2026-06-21

- `+` `patterns.md` — _(vazio — aguardando primeiras consolidações)_
- `+` `heuristics.md` — _(vazio — aguardando primeiras consolidações)_
- `+` `antipatterns.md` — _(vazio — aguardando primeiras consolidações)_
- `+` `changelog.md` — Criado este arquivo de versionamento
- `~` `CLAUDE.md` — Fluxo de inicialização reconciliado com lições aprendidas
- `~` `skills/context.md` — Adicionada referência às lições aprendidas do CLAUDE.md + removido separador duplicado
- `~` `skills/debug.md` — Adicionada regra de conexão com ciclo /learn

---

## Como usar

### Ao adicionar conhecimento (via `/learn`)

```markdown
### YYYY-MM-DD
- `+` `patterns.md` — Nome do Padrão
```

### Ao revisar conhecimento existente

```markdown
### YYYY-MM-DD
- `~` `patterns.md` — Nome do Padrão (refinado: [o que mudou])
```

### Ao invalidar conhecimento obsoleto

```markdown
### YYYY-MM-DD
- `-` `patterns.md` — Nome do Padrão
  Motivo: [explicação de por que não é mais válido]
  Substituído por: [novo padrão ou abordagem, se aplicável]
```

---

## Política de Revisão

- Conhecimento sem revisão por **6 meses** deve ser marcado para revisão
- Conhecimento com **evidência contrária** em sessão recente deve ser invalidado
- A invalidação **não apaga** o conteúdo — move para seção "Obsoleto" no final do arquivo
- Um registro invalidado pode ser reativado se novas evidências o suportarem
