# SKILL: status.md
> `/status` · ao retomar sessão ou responder "onde estamos?"

---

## PROTOCOLO

### 1. Specs
```bash
# Só carrega specs ativas (não concluídas/canceladas)
for f in .claude/sda/specs/*.md; do
  [ -f "$f" ] || continue
  status=$(grep -m1 "Status:" "$f" 2>/dev/null || echo "")
  if [[ "$status" =~ (RASCUNHO|APROVADA|EM.EXECUÇÃO) ]]; then
    echo "=== $(basename "$f") ==="
    echo "$status"
    echo ""
  fi
done
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

**Modo LITE** (tarefas P):
```
📊 [data] · Branch: [nome] · Specs: [N] · Git: [N] mod · Turn: [N]
```

**Modo FULL** (tarefas M/G/XG):
```
📊 STATUS — [data]  Branch: [nome]

📄 SPECS:
  EM EXECUÇÃO: [nome] → Passo N/total
  APROVADAS: [nome]
  RASCUNHO: [nome]
  CONCLUÍDAS (sessão): [nome] ✅

📁 GIT: [N] modificados · Último commit: [hash] [msg]

🧪 TESTES: [X/Y passando]

📜 DECISÕES ATIVAS (sessões recentes):
  [decisão — sessão origem]

⚠️ PENDÊNCIAS: [itens fora de escopo]

📊 Sessões sem descoberta: [N]
🔄 Turns sessão atual: [N] · Effort: [level]

💡 MÉTRICAS:
  Tokens estimados: [N] · Overhead GATEs: [%]
  [Se overhead > 30%: "💡 Considere modo LITE para próximas tarefas similares"]

➡️ PRÓXIMO: [ação específica e acionável]
```

---

## REGRAS
- Só lê — não altera arquivos
- Sem specs → "Use /spec para iniciar"
- Testes falhando → sempre em destaque
- "Próximo passo" deve ser acionável, nunca genérico
