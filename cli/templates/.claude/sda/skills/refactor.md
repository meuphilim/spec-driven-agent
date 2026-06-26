# SKILL: refactor.md
> `/refactor` · reestruturação sem mudança de comportamento

**Regra de ouro:** sem testes cobrindo o código → escreva os testes primeiro.

## QUANDO REFATORAR
✅ Legibilidade comprometida · duplicação em 3+ lugares · dificulta extensão · performance mensurável
❌ "Ficar mais bonito" · código estável sem necessidade · escopo indefinido ("limpar tudo")

---

## FLUXO
```
ESCOPO → TESTES ANTES → SPEC → PASSOS PEQUENOS → TESTES DEPOIS → REPORT
```

### 1. Escopo — seja cirúrgico
Bom: "Extrair validação de `UserForm.tsx` para `validators/user.ts`"
Ruim: "refatorar o módulo de usuários"

### 2. Testes Antes
```
Rodar testes → passando? ✅
Escrever testes para comportamentos críticos sem cobertura
Rodar novamente → passando? ✅
```
Se impossível escrever testes: documentar risco e obter aprovação explícita.

### 3. Spec (`.claude/sda/specs/refactor-[desc].md`)
```markdown
# SPEC: refactor-[desc]  Tipo: REFACTOR
## Problema Atual [estrutura atual, concretamente]
## Estrutura Proposta
## Comportamento Preservado [o que NÃO deve mudar]
## Arquivos Impactados
## Critério de Conclusão
- [ ] Todos os testes passam
- [ ] Comportamento externo idêntico
```

### 4. Passos Pequenos — cada passo deixa o código funcional
- Extrair função: criar nova → substituir chamadas → deletar antiga
- Renomear: Find & Replace com atenção a imports
- Mover arquivo: atualizar imports antes de deletar
- Simplificar: manter original comentado até confirmar

### 5. Testes Depois
```
Testes → passando? ✅  Build → sem erros? ✅  Teste manual do fluxo principal ✅
```

---

## REPORT
```
♻️ REFACTOR CONCLUÍDO
Escopo: [desc] · Melhoria: [o que mudou concretamente]
📁 Modificados / Criados / Removidos: [listas]
✅ Testes: X/X · Build: ok · Comportamento: idêntico ✅
⚠️ Observações: [monitorar / próximas oportunidades]
```
