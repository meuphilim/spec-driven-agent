# Protocolo de Validação — Modo LITE + Knowledge Base

> 🌐 Read this documentation in [English](VALIDATION-PROTOCOL_en.md).

**Objetivo:** Validar eficácia do Modo LITE e da Knowledge Base em uso real.

---

## 1. Teste do Modo LITE (10 tarefas P)

### Critérios de Seleção
- Tarefa com effort `low` (documentação, typo, config simples)
- Escopo: 1 arquivo
- Duração esperada: <5 minutos

### Coleta de Dados

Para cada tarefa, registrar:

| Métrica | Como medir |
|---|---|
| **Tokens LITE** | Contar tokens no fluxo completo |
| **Tokens FULL** | Estimar o que seria no modo FULL |
| **Economia** | (FULL - LITE) / FULL × 100% |
| **Qualidade** | Resultado correto? (sim/não) |
| **Consistência** | Seguiu formato LITE? (sim/não) |

### Template de Registro

```markdown
## Tarefa LITE #[N]

**Descrição:** [o que foi feito]
**Data:** YYYY-MM-DD

### Métricas
- Tokens LITE: [N]
- Tokens estimados FULL: [N]
- Economia: [%]
- Qualidade: ✅/❌
- Consistência: ✅/❌

### Observações
[O que funcionou / o que melhorar]
```

### Meta
- Economia média: ≥50%
- Qualidade: 100% (todas corretas)
- Consistência: ≥90%

---

## 2. Validação da Knowledge Base (5 sessões)

### Critérios de Sessão
- Tarefa com effort `medium` ou `high`
- Duração: ≥10 turns
- Pelo menos 1 descoberta potencial

### Coleta de Dados

Para cada sessão, registrar:

| Métrica | Como medir |
|---|---|
| **Knowledge carregada** | Sim/não + linhas lidas |
| **Descobertas** | Padrão/Heurística/Antipadrão |
| **Consolidação** | Sim/não + resultado |
| **Reutilização** | Knowledge foi útil? (sim/não) |

### Template de Registro

```markdown
## Sessão KB #[N]

**Tarefa:** [descrição]
**Effort:** medium/high
**Data:** YYYY-MM-DD

### Knowledge
- Carregada: sim/não ([N] linhas)
- Arquivos lidos: [lista]

### Descobertas
- [tipo]: [descrição]
- [tipo]: [descrição]

### Consolidação
- Nova entrada criada: sim/não
- Entrada existente reforçada: sim/não
- Knowledge foi útil: sim/não

### Observações
[Qualidade das entries, gaps identificados]
```

### Meta
- Knowledge carregada: 100% das sessões
- Pelo menos 1 descoberta: ≥80% das sessões
- Reutilização: ≥60% das sessões

---

## 3. Análise e Relatório

### Após 10 tarefas LITE + 5 sessões KB

Gerar relatório com:

1. **Resumo quantitativo**
   - Economia média de tokens
   - Taxa de qualidade
   - Número de descobertas

2. **Análise qualitativa**
   - O que funcionou bem
   - O que precisa melhorar
   - Padrões identificados

3. **Ajustes necessários**
   - Modificações no CLAUDE.md
   - Atualizações nas skills
   - Otimizações de tokens

4. **Decisão**
   - Aprovar Modo LITE para produção
   - Reverter para modo anterior
   - Ajustar e re-testar

---

## 4. Cronograma

| Fase | Duração | Entregável |
|---|---|---|
| Tarefas LITE | 2-3 dias | 10 registros |
| Sessões KB | 3-5 dias | 5 registros |
| Análise | 1 dia | Relatório |
| Ajustes | 1-2 dias | Atualizações |
| **Total** | **7-11 dias** | **Decisão** |

---

## 5. Responsabilidades

| Atividade | Responsável |
|---|---|
| Executar tarefas LITE | Agente + Usuário |
| Registrar métricas | Agente |
| Executar sessões KB | Agente + Usuário |
| Analisar resultados | Agente |
| Decidir ajustes | Usuário |
