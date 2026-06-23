# Contribuindo para o Spec-Driven Agent

Obrigado por considerar contribuir! Este documento descreve como participar do desenvolvimento do framework.

---

## Diretrizes Gerais

### Código de Conduta

- Seja respeitoso e profissional
- Foque no que é melhor para a comunidade
- Aceite construtivamente críticas

### Princípios de Contribuição

1. **Siga o fluxo do framework** — use o próprio framework para desenvolver
2. **Especifique antes de implementar** — toda mudança começa com uma spec
3. **Teste suas mudanças** — valide em pelo menos 1 projeto real
4. **Documente** — atualize README, CHANGELOG e skills afetadas

---

## Fluxo de Contribuição

### 1. Fork e Clone

```bash
git clone https://github.com/seu-usuario/spec-driven-agent.git
cd spec-driven-agent
```

### 2. Criar Branch

```bash
git checkout -b feat/nome-da-feature
# ou
git checkout -b fix/nome-do-fix
# ou
git checkout -b docs/atualizacao-documentacao
```

### 3. Seguir o Framework

Para qualquer mudança significativa:

```
1. /context    → Mapear o que está sendo modificado
2. /spec       → Criar especificação da mudança
3. /plan       → Gerar plano de execução
4. /implement  → Executar mudanças
5. /review     → Revisar código
6. /reflect    → Auto-avaliação
7. /learn      → Consolidar aprendizados
```

### 4. Commit

Siga [Conventional Commits](https://www.conventionalcommits.org/pt-BR/):

```
feat(spec): adicionar validação de campos obrigatórios

- Adicionado validação no template de spec
- Campo "Contexto" agora é obrigatório
- Critérios de aceite devem ser verificáveis

Refs: #12
```

### 5. Push e PR

```bash
git push origin feat/nome-da-feature
```

Crie um Pull Request com:
- Título descritivo
- Descrição do que foi mudado e por quê
- Referência a issues (se aplicável)
- Screenshots (se mudanças visuais)

---

## Tipos de Contribuição

### 🐛 Bug Fixes

- Reporte o bug primeiro (Issue)
- Crie spec de fix antes de corrigir
- Inclua testes se possível

### ✨ Features

- Abra uma Issue discutindo a feature
- Crie spec completa antes de implementar
- Divida em PRs menores se for grande

### 📚 Documentação

- Correções de ortografia/gramática
- Exemplos práticos adicionais
- Esclarecimentos em sections confusas

### 🧪 Tests

- Testes para skills existentes
- Cenários de uso documentados
- Edge cases identificados

---

## Estrutura de uma Skill

Ao criar ou modificar uma skill, siga o padrão:

```markdown
# SKILL: nome.md
> `/comando` · quando ativar

## QUANDO EXECUTAR
[lista de gatilhos]

---

## PROTOCOLO
### 1. [Passo]
[descrição]

---

## REPORT
[formato de saída]

---

## REGRAS
- [regra 1]
- [regra 2]
```

---

## Estrutura de uma Spec

```markdown
# SPEC: nome-da-feature

**Data:** YYYY-MM-DD
**Tipo:** FEAT|FIX|REFACTOR|INFRA|DOCS
**Status:** RASCUNHO|APROVADA|CANCELADA

## Contexto
[por que existe]

## Objetivo
[o que deve ser verdade quando concluído]

## Escopo
### Inclui
- [o que entra]
### Exclui
- [o que NÃO entra]

## Critérios de Aceite
- [ ] [critério verificável]

## Riscos
[o que pode dar errado]
```

---

## Issues

### Template de Bug Report

```markdown
**Descrição do bug**
[descrição clara]

**Passos para reproduzir**
1. ...
2. ...

**Comportamento esperado**
[o que deveria acontecer]

**Comportamento atual**
[o que acontece]

**Ambiente**
- OS: [Windows/Mac/Linux]
- Claude Code: [versão]
- Framework: [versão]
```

### Template de Feature Request

```markdown
**Descrição**
[descrição da feature]

**Problema que resolve**
[qual problema o usuário enfrenta]

**Solução proposta**
[como resolveria]

**Alternativas consideradas**
[outras opções avaliadas]

**Additional context**
[contexto adicional]
```

---

## Pull Requests

### Checklist

- [ ] Branch criada a partir de `main`
- [ ] Commits seguem Conventional Commits
- [ ] Spec criada (se mudança significativa)
- [ ] Skills afetadas foram atualizadas
- [ ] README atualizado (se necessário)
- [ ] CHANGELOG atualizado
- [ ] Testes manuais realizados
- [ ] Code review concluído

### Template

```markdown
## Descrição
[descrição das mudanças]

## Tipo de mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Feature
- [ ] 📚 Documentação
- [ ] 🧪 Testes
- [ ] 🔧 Refactor

## Checklist
- [ ] Spec criada e aprovada
- [ ] Skills atualizadas
- [ ] README/CHANGELOG atualizados
- [ ] Testes realizados

## Issues relacionadas
Closes #XX
```

---

## Perguntas?

Abra uma [Discussion](https://github.com/meuphilim/spec-driven-agent/discussions) para perguntas gerais ou ideias.
