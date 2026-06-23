# .specs/

Pasta de especificações do projeto.

Toda tarefa começa aqui. Nenhuma linha de código sem spec aprovada.

## Estrutura de nomes

```
feat-[descricao].md       → nova funcionalidade
fix-[descricao].md        → correção de bug
refactor-[descricao].md   → reestruturação
infra-[descricao].md      → configuração / ambiente
docs-[descricao].md       → documentação
```

## Status possíveis

| Status | Significado |
|---|---|
| RASCUNHO | Criada, aguardando aprovação |
| APROVADA | Aprovada, pronta para execução |
| EM EXECUÇÃO | Implementação em andamento |
| CONCLUÍDA | Implementada e verificada |
| CANCELADA | Descartada — motivo deve estar registrado na spec |

## Como usar

```
/spec [descrição]   → cria uma nova spec aqui
/status             → lista todas as specs e seus estados
```
