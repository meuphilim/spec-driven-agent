# SPEC: audit-estrutural

**Data:** 2026-06-22
**Tipo:** REFACTOR
**Status:** APROVADA

---

## Contexto

O framework Spec-Driven Agent foi criado em uma única sessão com 12 skills, 3 knowledge bases e 1 CLAUDE.md. Não houve validação estrutural posterior. É necessário verificar se todos os arquivos estão coerentes entre si, sem referências quebradas, naming consistente e protocolos completos.

## Objetivo

Garantir que o framework está estruturalmente íntegro — todas as referências cruzadas funcionam, naming é consistente, e não há dead links ou arquivos órfãos.

## Escopo

### Inclui
- Verificar todas as referências `@skills/[nome].md` no CLAUDE.md → apontam para arquivos reais?
- Verificar todos os slash commands `/comando` → mapeiam para skills corretas?
- Verificar referências cruzadas entre skills (ex: `@skills/learn.md` mencionado em `reflect.md`)
- Verificar naming consistente (camelCase vs kebab-case nos nomes de arquivo)
- Verificar se `.knowledge/` tem os 3 arquivos obrigatórios
- Verificar se `.specs/` existe e está acessível
- Verificar se `.sessions/` existe e está acessível
- Listar todos os arquivos órfãos (existem mas não são referenciados)

### Exclui
- Mudanças de conteúdo nas skills (escopo é apenas estrutura)
- Mudanças no CLAUDE.md (será tratado em spec separada se necessário)
- Criação de novos arquivos

## Comportamento Esperado

Ao finalizar:
- Todos os caminhos referenciados existem
- Todos os slash commands mapeiam para skills reais
- Naming de arquivos é consistente (decidir padrão e documentar)
- Lista de arquivos órfãos documentada
- Nenhum dead link

## Critérios de Aceite

- [ ] Todas as referências `@skills/` no CLAUDE.md são válidas
- [ ] Todos os slash commands mapeiam para skills reais
- [ ] Referências entre skills estão corretas
- [ ] Naming de arquivos é consistente (padrão único definido)
- [ ] Lista de arquivos órfãos documentada
- [ ] `.knowledge/`, `.specs/`, `.sessions/` existem e são acessíveis

## Riscos e Dependências

- **Risco:** Pode encontrar gaps que exigem criação de novos arquivos (fora do escopo desta spec)
- **Dependência:** Nenhuma — tarefa autônoma de auditoria

## Fora do Escopo / Próximas Specs

- `gaps-integracao.md` — falhas de integração entre skills
- `melhorias-aprendizado.md` — gaps no ciclo de aprendizado
