# SKILL: status.md
> `/status` · ao retomar sessão ou responder "onde estamos?"

---

## PROTOCOLO

### 1. Specs
```bash
ls .claude/sda/specs/ && cat .claude/sda/specs/*.md  # ler status de cada uma
```
Status: RASCUNHO · APROVADA · EM EXECUÇÃO · CONCLUÍDA · CANCELADA

### 2. Git
```bash
git status && git log --oneline -10 && git branch
```

### 3. Sessões recentes
```bash
ls -t .claude/sda/sessions/ | head -5
# Ler cada sessão e extrair:
# - Decisões ainda válidas
# - Bloqueios anteriores relevantes
# - Descobertas aguardando consolidação
```

### 4. Testes
```bash
# Rodar e capturar resultado resumido
```

---

## REPORT
```
📊 STATUS — [data]  Branch: [nome]

📄 SPECS:
  EM EXECUÇÃO: [nome] → Passo N/total
  APROVADAS: [nome]
  RASCUNHO: [nome]
  CONCLUÍDAS (sessão): [nome] ✅

📁 GIT: [N] modificados · Último commit: [hash] [msg] · Branch: [N à frente/atrás de main]

🧪 TESTES: [X/Y passando | não rodados]

📜 DECISÕES ATIVAS (sessões recentes):
  [decisão — sessão origem]
  Bloqueios: [se aplicável]
  Aguardando consolidação: [descoberta — sessão]

⚠️ PENDÊNCIAS: [itens fora de escopo identificados]

📊 Sessões sem descoberta: [N]
🔄 Turns sessão atual: [N] · Effort ativo: [level]

➡️ PRÓXIMO: [ação específica e acionável]
```

---

## REGRAS
- Só lê — não altera arquivos
- Sem specs → "Use /spec para iniciar"
- Testes falhando → sempre em destaque
- "Próximo passo" deve ser acionável, nunca genérico
