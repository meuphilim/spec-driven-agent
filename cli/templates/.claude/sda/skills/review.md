# SKILL: review.md
> `/review` · antes de merge/PR ou após implementação complexa

---

## OBTER DIFF
```bash
git diff main                    # branch vs main
git diff HEAD~1                  # último commit
git diff main -- path/arquivo.ts # arquivo específico
```

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
