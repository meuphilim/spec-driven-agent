# SKILL: context.md
> `/context` · automático ao iniciar projeto sem contexto carregado

## QUANDO EXECUTAR
Primeiro acesso · retorno após pausa longa · projeto de terceiros · código desconhecido

---

## PROTOCOLO

### 1. Estrutura
```bash
ls -la && ls src/ app/ lib/ 2>/dev/null
```
Documente: componentes, utilitários, tipos, testes, assets, configs.

### 2. Configurações
Ler na ordem (se existirem):
`package.json` → `tsconfig.json` → `.env.example` → `next.config.*` → `vite.config.*` → `eslint.config.*`

### 3. Convenções
Ler ≥3 arquivos centrais. Observar: naming, imports, barrel exports, estilo de componentes, tratamento de erros.

### 4. Testes
```bash
# Identificar framework e rodar testes
```

### 5. Specs
```bash
ls .claude/sda/specs/ 2>/dev/null
```

### 6. Socrates Gate
Se gaps de contexto não resolvíveis por código → `@skills/socrates.md`

---

## CARREGAMENTO DE MEMÓRIA (otimizado)

**Modo LITE** (tarefas P): Pular carregamento completo
```bash
ls .claude/sda/sessions/ | sort -r | head -1
```

**Modo FULL** (tarefas M/G/XG): Carregar knowledge condicionalmente
```bash
# Só carrega se ≥5 linhas de conteúdo útil
[ $(wc -l < .claude/sda/knowledge/patterns.md 2>/dev/null || echo 0) -gt 5 ] && head -20 .claude/sda/knowledge/patterns.md
[ $(wc -l < .claude/sda/knowledge/heuristics.md 2>/dev/null || echo 0) -gt 5 ] && head -20 .claude/sda/knowledge/heuristics.md
ls .claude/sda/sessions/ | sort -r | head -3
```

---

## PROJETOS LEGADOS
**Ativar se:** sem `package.json`, testes falhando, README ausente, ou >3 alertas.

1. **Mapear dívida:** Testes / Docs / Estrutura / CI-CD / Deps / TS → 🟢 Saudável · 🟡 Atenção · 🔴 Crítico
2. **Zonas de risco:** arquivos 400+ linhas, sem testes, efeitos colaterais → nunca refatore sem testes
3. **Estratégia:** estabilizar antes de evoluir · escopo mínimo · comunicar risco antes de cada tarefa

Regra: código vence documentação.

---

## RELATÓRIO

```
📦 PROJETO: [nome]
🛠️  STACK: [linguagens + frameworks]
📁 ESTRUTURA: Componentes: [path] · Utils: [path] · Tipos: [path] · Testes: [path]
⚙️  SCRIPTS: dev · build · test · lint
🔐 ENV: [lista ou "não documentadas"]
📋 CONVENÇÕES: [observadas]
🧪 TESTES: [N testes | framework | passando/falhando]
📄 SPECS ATIVAS: [nome → status]
⚠️  ALERTAS: [dependências, testes falhando, etc.]
✅ Contexto carregado. Pronto para receber tarefas.
```

---

## REGRAS
- Não sugira mudanças durante mapeamento — apenas observe
- Alertas vão no campo ⚠️, não geram ação imediata
- Verifique "LIÇÕES APRENDIDAS" do `CLAUDE.md` antes — pode dispensar mapeamento completo
