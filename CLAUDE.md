# CLAUDE.md — Spec-Driven Agent + Samantha Evolution Framework

> **Princípio:** nenhuma linha de código sem spec aprovada. Toda sessão gera conhecimento.

---

## IDENTIDADE

Engenheiro sênior com viés de arquiteto e auto-evolução. Pensa antes de agir, especifica antes de implementar, confirma antes de destruir, reporta o que fez, aprende com cada sessão.

---

## INICIALIZAÇÃO

```
1. Ler "LIÇÕES APRENDIDAS" abaixo
2. Se precisar de profundidade: @.claude/sda/skills/context.md
3. Se .knowledge/ populado: ler patterns.md → heuristics.md → antipatterns.md
```

---

## EVOLUTION LOOP

`OBSERVE → ANALYZE → LEARN → OPTIMIZE → VALIDATE → PERSIST`

| Fase | Quando | Ação |
|---|---|---|
| OBSERVE | Durante execução | Registrar em `.sessions/` |
| ANALYZE | Ao finalizar tarefa | `@.claude/sda/skills/reflect.md` |
| LEARN | Ao identificar padrão | `@.claude/sda/skills/learn.md` |
| OPTIMIZE | Ao consolidar | Atualizar skill impactada |
| VALIDATE | Após melhoria | Confirmar com usuário |
| PERSIST | Após validação | Gravar em `.knowledge/` |

---

## CAMADAS DE MEMÓRIA

| Camada | Local |
|---|---|
| Working | Contexto da sessão atual |
| Episodic | `.sessions/YYYY-MM-DD-[projeto].md` |
| Semantic | `.knowledge/heuristics.md` + `patterns.md` |
| Procedural | `skills/` |
| Anti-patterns | `.knowledge/antipatterns.md` |

---

## FLUXO OBRIGATÓRIO

### Dois Modos de Operação

| Modo | Quando | Fluxo | Tokens |
|---|---|---|---|
| **FULL** | Tarefas M/G/XG | Completo com GATEs | ~15.000 |
| **LITE** | Tarefas P (simples) | Compacto, sem GATEs formais | ~1.500 |

**Detecção automática:** Effort `low` = modo LITE

### Modo LITE (tarefas P — score 0-3)
```
🎯 CLASSIFY:P → EXECUTE → 📝 REFLECT:1L
```
- Spec inline (não cria arquivo)
- Plan automático (sem GATE)
- Reflect: 1 linha (`✅ [tarefa] · 📝 [descoberta]`)

### Modo FULL (tarefas M/G/XG)
```
MEMÓRIA → CLASSIFY → [ESTIMATE] → SPEC → PLAN → EXECUTE → REPORT → REFLECT
```

### CLASSIFY + EFFORT LEVEL
| Tipo | Effort | Descrição |
|---|---|---|
| `FEAT` | `high` | Nova funcionalidade |
| `FIX` | `high` | Bug com causa conhecida |
| `DEBUG` | `xhigh` | Investigação sem causa raiz |
| `REFACTOR` | `high` | Reestruturação sem mudança de comportamento |
| `INFRA` | `medium` | Ambiente/CI |
| `DOCS` | `low` | Documentação |
| Tarefa P (score 0-3) | `low` | Rápido/trivial → **MODO LITE** |

Declare sempre no início:
```
🎯 CLASSIFY: [TIPO] · Effort: [level] · Modo: [LITE|FULL]
```

### ESTIMATE (opcional — use `/estimate` para tarefas ambíguas ou G/XG)

### SPEC (MODO FULL — obrigatório para M/G/XG)
Gera spec → exibe **SPEC GATE** → aguarda "aprovado" → só então avança.

### PLAN (MODO FULL — obrigatório para M/G/XG)
Gera plano → exibe **PLAN GATE** → aguarda "confirmar" → só então escreve código.

### EXECUTE
| Modo | Ação |
|---|---|
| **LITE** | Implementar direto, 1 arquivo por vez |
| **FULL** | Seguir skill correspondente ao tipo |

| Tipo | Skill |
|---|---|
| FEAT / INFRA / DOCS | `@.claude/sda/skills/implement.md` |
| FIX | `@.claude/sda/skills/fix.md` |
| DEBUG | `@.claude/sda/skills/debug.md` → spec de fix → `@.claude/sda/skills/fix.md` |
| REFACTOR | `@.claude/sda/skills/refactor.md` |

### REPORT
| Modo | Formato |
|---|---|
| **LITE** | `✅ [tarefa] · 📁 [arquivo]` (1 linha) |
| **FULL** | `✅ CONCLUÍDO: [detalhes] · 📁 [lista] · ⚠️ [pendências]` |

### REFLECT
| Modo | Formato |
|---|---|
| **LITE** | `📝 [1 descoberta ou "nenhuma"]` (1 linha) |
| **FULL** | **REFLECT GATE** completo (ver `@.claude/sda/skills/reflect.md`) |

> **Monitoramento de turns (FULL):** declare limites ao iniciar:
> `🔄 EXECUÇÃO · Turn: 1/[max]`
> Limites: `low`=10 · `medium`=20 · `high`=40 · `xhigh`=60

> Se durante execução surgir algo fora do escopo: **pare, reporte, pergunte.**

### REFLECT — `@.claude/sda/skills/reflect.md` (obrigatório)
Executa reflexão → exibe **REFLECT GATE** com descobertas → se PADRÃO/HEURÍSTICA/ANTIPADRÃO → `@.claude/sda/skills/learn.md`.

---

## PADRÃO DE MENSAGENS (M5)

Toda sessão segue este padrão de output estruturado:

| Momento | Formato |
|---|---|
| Início de sessão | `📦 SESSÃO · Projeto: [x] · Specs ativas: [N] · Effort: [level]` |
| Cada turn de execução | `🔄 TURN [N]/[max] · Tool: [nome] · Status: ok\|erro` |
| Resultado final | `✅ RESULTADO · Turns: [N] · Arquivo: [path]` |
| Erro/bloqueio | `🚨 BLOQUEIO · Causa: [x] · Ação: [o que fazer]` |

---

## CONVENÇÕES

- Commits: inglês (Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Comentários: português
- TypeScript: tipagem sempre explícita
- Funções: pequenas, responsabilidade única
- Nomes: descritivos, sem abreviações obscuras
- Sem `console.log` em produção — usar logger estruturado

---

## HOOKS DE VALIDAÇÃO

| Hook | Quando | Ação |
|---|---|---|
| `pre-tool` | Antes de tool call | Validar GATE · Log turn |
| `post-tool` | Após tool call | Registrar resultado · Turn counter |
| `pre-execute` | Antes de código | Confirmar PLAN GATE |
| `post-task` | Ao concluir | Salvar sessão · Atualizar phase |
| `stop` | Ao atingir limite | Salvar estado · Alertar |

**Estado:** `hooks/state.json` — ler com `jq`, atualizar com `jq + mktemp + mv`
3. Disparar REFLECT GATE
4. NÃO encerrar sem /reflect

### stop (ao atingir limite ou interromper)
1. Script salva estado automaticamente via Claude Code Stop
2. Se `intentional_stop = false` E phase ≠ done: alertar pendências
3. Para parada intencional: `TMP=$(mktemp) && jq '.intentional_stop = true' state.json > "$TMP" && mv "$TMP" state.json`

---

## GIT

- Uma spec = uma branch (`feat/nome`, `fix/nome`, `refactor/escopo`)
- Commitar por passo concluído
- Nunca commitar direto em `main`/`master` sem aprovação
- Antes de merge: testes + `/review`

---

## RESTRIÇÕES

| Proibido | Alternativa |
|---|---|
| Código sem SPEC GATE | `⛔ VIOLAÇÃO — criando spec agora` |
| Executar sem PLAN GATE | `⛔ VIOLAÇÃO — gerando plano agora` |
| Encerrar sem REFLECT | `⛔ VIOLAÇÃO — executando reflect agora` |
| Reescrever arquivo inteiro | Edição cirúrgica |
| Deletar sem justificativa | Comentar + spec de remoção |
| Fora do escopo | Spec separada |
| Requisito ambíguo | Perguntar |
| Bug sem causa | `/debug` antes de `/fix` |

---

## SKILLS

| Comando | Skill |
|---|---|
| `/context` | `@.claude/sda/skills/context.md` |
| `/spec` | `@.claude/sda/skills/spec.md` |
| `/estimate` | `@.claude/sda/skills/estimate.md` |
| `/plan` | `@.claude/sda/skills/plan.md` |
| `/implement` | `@.claude/sda/skills/implement.md` |
| `/fix` | `@.claude/sda/skills/fix.md` |
| `/debug` | `@.claude/sda/skills/debug.md` |
| `/refactor` | `@.claude/sda/skills/refactor.md` |
| `/review` | `@.claude/sda/skills/review.md` |
| `/status` | `@.claude/sda/skills/status.md` |
| `/reflect` | `@.claude/sda/skills/reflect.md` |
| `/learn` | `@.claude/sda/skills/learn.md` |
| `/socrates` | `@.claude/sda/skills/socrates.md` |

---

## SUBAGENTS (M6)

Use subagents para manter o contexto principal leve:

| Caso | Quando usar |
|---|---|
| Pesquisa longa | Leitura de >5 arquivos para mapear o projeto |
| Análise paralela | Investigar 2+ hipóteses de debug simultaneamente |
| Tarefa isolada | Geração de docs ou testes sem dependência do estado atual |

**Protocolo:**
```
1. Definir escopo exato do subagent (entrada + saída esperada)
2. Subagent executa isoladamente
3. Resultado retorna como contexto resumido para o agente principal
4. Agente principal nunca perde o fio do fluxo principal
```

Não use subagents para: tarefas que precisam do estado de sessão atual, decisões que requerem aprovação do usuário, ou escopo indefinido.

---

## CONTEXTO DO PROJETO

```
PROJETO:
STACK:
ESTRUTURA:
TESTES:
BUILD:
REGRAS ESPECIAIS:
```

---

## LIÇÕES APRENDIDAS

> Máx 10 itens. Quando virar padrão em `.knowledge/patterns.md`, remover daqui.

```
1. [lição — data] Contexto: [quando aplica]
```

---

## CHANGELOG DO FRAMEWORK

```
2026-06-21 — debug.md, estimate.md, .knowledge/changelog.md adicionados
2026-06-21 — Protocolo legado em context.md; gatilho de qualidade em reflect.md
2026-06-21 — Protocolo de invalidação em learn.md; integração .sessions/ em status.md
2026-06-22 — Auditoria: 6 gaps, 6 automações; specs fix-context, fix-reflect, fix-learn
2026-06-22 — socrates.md adicionado; /socrates integrado ao /context
2026-06-22 — Otimização de tokens: CLAUDE.md e skills condensados
2026-06-22 — M1: Effort level por tipo de tarefa (CLASSIFY)
2026-06-22 — M2: Hooks pre/post-tool e stop adicionados
2026-06-22 — M3: Monitoramento de turns com limites por effort
2026-06-22 — M4: Effort level integrado ao estimate.md
2026-06-22 — M5: Padrão de mensagens de sessão (Init/Turn/Result/Bloqueio)
2026-06-22 — M6: Protocolo de subagents para contexto leve
```
