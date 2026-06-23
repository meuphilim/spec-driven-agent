# SKILL: socrates.md
> `/socrates` · quando `/context` encontra gaps não resolvíveis por código

## QUANDO EXECUTAR
`/context` com gaps · tarefa sem contexto suficiente · spec ambígua por falta de info · antes de decisão irreversível

---

## GAPS QUE CÓDIGO NÃO RESPONDE

| Categoria | Exemplos | Fonte esperada |
|---|---|---|
| Negócio | Objetivo, usuários-alvo, métrica de sucesso | README / perguntar |
| Técnico | Stack de deploy, integrações, restrições de infra | `.env`, configs / perguntar |
| Equipe | Decisor técnico, process de deploy, code review | perguntar |
| Operacional | Prazo, orçamento, ferramentas obrigatórias | perguntar |

**Sinais de gap:** informação não encontrada no código + essencial para a tarefa.

---

## PROTOCOLO

### 1-2. Identificar e classificar
| Impacto | Ação |
|---|---|
| 🔴 Impede tarefa | Perguntar OBRIGATORIAMENTE |
| 🟡 Reduz qualidade | Perguntar RECOMENDADO |
| 🟢 Informativo | Perguntar OPCIONAL |

### 3. Formular perguntas (máx 5 por vez, começar pelas 🔴)
```
📋 PERGUNTA [N]/[total]
Categoria: [Negócio|Técnico|Equipe|Operacional]
Por que preciso: [motivo] · Impacto se não souber: [risco]
Pergunta: [específica e acionável]
Opções: a) ... b) ... c) ... d) Outro: ___
```

### 4. Registrar em `.sessions/YYYY-MM-DD-[projeto].md`
```markdown
## Contexto Coletado (Socrates Gate)
### Negócio: Objetivo / Usuários / Problema
### Técnico: Deploy / Integrações / Restrições
### Equipe: Decisor / Processo
### Operacional: Prazo / Orçamento
```

### 5. Validar
```
✅ CONTEXTO COLETADO
Respondidas: [N]/[total] · Gaps restantes: [N]
Suficiente para prosseguir? SIM → continuar | NÃO → [quais gaps impedem]
```

---

## REPORT
```
🏛️ SOCRATES GATE — [projeto]
📊 GAPS: [N] (🔴[N] 🟡[N] 🟢[N]) · 📋 Perguntas: [N] · ✅ Respostas: [N]
📝 Contexto em: .sessions/YYYY-MM-DD-[projeto].md
➡️ Próximo: [continuar | criar spec | mais contexto]
```

---

## REGRAS
- Nunca pule se houver gaps 🔴
- Máx 5 perguntas por vez · ofereça opções quando possível
- Registre todas as respostas (mesmo "a definir")
- Use contexto coletado em TODAS as specs subsequentes
