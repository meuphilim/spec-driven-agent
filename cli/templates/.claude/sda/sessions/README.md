# .sessions/ — Memória Episódica

Registro cronológico de sessões de trabalho.
Cada arquivo representa uma sessão e alimenta o processo de aprendizado.

## Estrutura de nomes

```
YYYY-MM-DD-[nome-do-projeto].md
```

Exemplo: `2026-06-21-mercado-express.md`

## Como é gerado

Automaticamente via `@.claude/sda/skills/reflect.md` ao final de cada tarefa.

## Como é usado

- `/status` lê sessões recentes para contexto
- `/learn` lê sessões para identificar padrões repetidos
- `@.claude/sda/skills/context.md` carrega sessão do dia se existir

## Ciclo de vida

Sessões com mais de 90 dias podem ser arquivadas em `.sessions/archive/`.
O conteúdo já consolidado em `.knowledge/` não precisa ser mantido nas sessões.
