# SKILL: learn.md
> `/learn` · quando `reflect.md` identifica padrão consolidável

---

## VERIFICAR EVIDÊNCIAS PRIMEIRO
```bash
ls .claude/sda/sessions/ | sort -r | head -5
```
- [ ] Aparece em ≥2 sessões?
- [ ] É generalizável (não específico de uma tarefa)?
- [ ] Usuário concorda?

Se não passou → registre na sessão e aguarde.

---

## TIPOS E DESTINOS
| Tipo | Pergunta-chave | Destino |
|---|---|---|
| PADRÃO | "Qual abordagem funcionou consistentemente?" | `.claude/sda/knowledge/patterns.md` |
| HEURÍSTICA | "Qual regra prática melhora decisões futuras?" | `.claude/sda/knowledge/heuristics.md` |
| ANTIPADRÃO | "O que não deve ser repetido?" | `.claude/sda/knowledge/antipatterns.md` |

---

## TEMPLATES

**patterns.md:**
```markdown
## PADRÃO: [nome]
**Contexto:** [quando aplica] · **Abordagem:** [o que fazer]
**Resultado:** [por que funciona] · **Evidências:** [sessões] · **Adicionado:** YYYY-MM-DD
```

**heuristics.md:**
```markdown
## HEURÍSTICA: [enunciado]
**Quando:** [contexto] · **Fundamento:** [por que útil]
**Exceções:** [quando não aplica] · **Evidências:** [sessões] · **Adicionado:** YYYY-MM-DD
```

**antipatterns.md:**
```markdown
## ANTIPADRÃO: [nome]
**Sintoma:** [como se manifesta] · **Causa:** [por que acontece]
**Consequência:** [o que quebra] · **Alternativa:** [o que fazer] · **Adicionado:** YYYY-MM-DD
```

---

## ANTES DE GRAVAR — validar com usuário
```
💡 CONSOLIDAR
Tipo: [PADRÃO|HEURÍSTICA|ANTIPADRÃO] · Destino: .claude/sda/knowledge/[arquivo].md
[conteúdo redigido]
Posso gravar?
```
**Não grave sem confirmação.**

Após gravar: atualizar índice do arquivo + registrar em `.claude/sda/knowledge/changelog.md`

---

## INVALIDAÇÃO
1. Identificar conhecimento em `.claude/sda/knowledge/`
2. Obter aprovação
3. Mover para seção "Obsoleto" (NÃO deletar)
4. Registrar em `changelog.md`

---

## REGRAS
- Nunca consolide de 1 sessão — aguarde repetição
- Invalidação nunca deleta — move para "Obsoleto"
- Skills só são atualizadas com aprovação explícita
