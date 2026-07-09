# SKILL: review.md
> `/review` · antes de merge/PR ou após implementação complexa

---

## OBRIGATÓRIO: CARREGAR SPEC
Antes de revisar, carregue a spec correspondente:
```bash
ls .claude/sda/specs/*.md 2>/dev/null | head -5
```
Confirme que o código implementa cada critério de aceite. **Review sem spec é inválido.**

---

## OBTER DIFF
```bash
git diff main                    # branch vs main
git diff HEAD~1                  # último commit
git diff main -- path/arquivo.ts # arquivo específico
```

---

## VALIDAÇÃO AUTOMÁTICA (Fase SDD: Validate)
Cruce cada critério da spec com o diff:

```
📋 VALIDAÇÃO vs SPEC — [spec]
✅ Critério implementado: [evidência no diff]
❌ Critério ausente/não implementado: [detalhe]
⚠️ Critério parcial: [o que falta]
```
**Se houver ❌:** reportar como 🔴 BLOCKER no review.

---

## CHECKLIST

**🎯 Correção**
- [ ] Faz o que a spec diz? Critérios de aceite atendidos?
- [ ] Casos de borda tratados? Erros/estados inválidos tratados?

**🔒 Segurança**
- [ ] Inputs externos validados? Sem dados sensíveis hardcoded?
- [ ] Operações destrutivas com confirmação? Permissões verificadas?

**🏗️ Qualidade**
- [ ] Funções com responsabilidade única? Nomes descritivos?
- [ ] Sem duplicação? Tipagem explícita? Sem `console.log`?

**📐 Consistência**
- [ ] Naming, imports e estilo iguais ao projeto?
- [ ] Usa utilitários existentes (sem reinventar)?

**🧪 Testes**
- [ ] Lógica crítica coberta? Testes existentes passam? Novos comportamentos testados?

**📝 Legibilidade**
- [ ] Alguém novo entenderia sem perguntar?
- [ ] Decisões não óbvias têm comentário explicando o porquê?

---

## SEVERIDADES

| | Significado | Ação |
|---|---|---|
| 🔴 BLOCKER | Bug, falha de segurança, viola spec | Corrigir antes do merge |
| 🟡 MELHORIA | Não impede merge, mas deve ser feito | Corrigir ou abrir spec |
| 🔵 SUGESTÃO | Opinião, nice-to-have | Discutir, sem obrigação |

---

## REPORT
```
🔍 REVIEW — [feature/branch]
Spec: .claude/sda/specs/[nome].md

🔴 BLOCKERS: [N]
1. [arquivo:linha] — [problema] — [como corrigir]

🟡 MELHORIAS: [N]
1. [arquivo:linha] — [desc] — [sugestão]

🔵 SUGESTÕES: [N]
1. [arquivo:linha] — [obs]

✅ VEREDICTO: APROVADO | APROVADO COM RESSALVAS | BLOQUEADO
```

---

## REGRAS
- Sem BLOCKER aberto, não aprove
- Sem spec encontrada → primeiro achado: 🔴 "Implementação sem spec aprovada"
- Review não é reescrita — aponte, sugira, deixe correção com quem implementou

---

## EXECUÇÃO

Delegar ao subagente `architect` com modelo explícito para revisões que exigem análise profunda:

```markdown
Agent({
  subagent_type: "architect",
  model: "sonnet",
  prompt: `Revise a implementação comparando com a spec em .claude/sda/specs/[nome].md seguindo o template da skill review.md.

Para isso:
1. Carregue a spec: ls .claude/sda/specs/*.md | head -5
2. Obtenha o diff: git diff main (ou HEAD~1)
3. Cruze cada critério da spec com o diff
4. Preencha o checklist completo (correção, segurança, qualidade, consistência, testes, legibilidade)
5. Classifique cada achado por severidade (🔴 BLOCKER / 🟡 MELHORIA / 🔵 SUGESTÃO)
6. Emita o veredicto: APROVADO | APROVADO COM RESSALVAS | BLOQUEADO

Regras:
- Sem BLOCKER aberto, não aprove
- BLOCKER = bug, falha de segurança, ou violação de spec
- Review não é reescrita — apenas aponte e sugira
- Retornar o report completo no formato do template`
})
```

> **Atenção:** Use explicitamente `model: "sonnet"` no Agent call. O frontmatter `model:` do subagente é ignorado pelo Claude Code (bug #44385). Para revisões simples (1-2 arquivos, mudança trivial), Samantha pode executar diretamente sem delegar ao architect.

