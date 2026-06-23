# patterns.md — Padrões Validados

> Abordagens que funcionaram consistentemente em múltiplas sessões.
> Consulte este arquivo ao iniciar qualquer tarefa.
> Atualize via `@skills/learn.md` após validação com o usuário.

---

## ÍNDICE

1. **Auditoria Sistemática de Framework** — 2026-06-22
2. **Socrates Gate para Contexto Ausente** — 2026-06-22
3. **Otimização de Tokens por Consolidação** — 2026-06-22

---

## PADRÃO: Auditoria Sistemática de Framework

**Contexto:** Quando precisar avaliar um framework, conjunto de skills, ou sistema de trabalho complexo

**Abordagem:** Seguir protocolo de 4 fases:
1. Audit Estrutural (verificar coerência, referências, naming)
2. Gaps de Integração (mapear fluxo de dados, identificar quebras)
3. Melhorias (propor automações, priorizar por impacto)
4. Consolidação (gerar relatório, criar specs de correção)

**Resultado:** Framework avaliado sistematicamente, gaps documentados com prioridade, correções prontas para execução

**Evidências:** Sessão 2026-06-22 (esta sessão)

**Adicionado em:** 2026-06-22

---

## PADRÃO: Socrates Gate para Contexto Ausente

**Contexto:** Quando o código não responde perguntas sobre objetivo, usuários, stack de deploy, ou decisões de negócio

**Abordagem:** Executar protocolo de 5 fases:
1. Identificar gaps (o que não sei)
2. Classificar por impacto (impede/reduz/informativo)
3. Formular perguntas (máx 5, com opções)
4. Registrar respostas em .sessions/
5. Validar contexto suficiente

**Resultado:** Decisões informadas, menos retrabalho, contexto preservado para sessões futuras

**Evidências:** Sessão 2026-06-22 (criação do Socrates Gate)

**Adicionado em:** 2026-06-22

---

## PADRÃO: Otimização de Tokens por Consolidação

**Contexto:** Framework com muitas skills verbosas e redundâncias entre arquivos

**Abordagem:**
1. Mapear redundâncias (frases duplicadas, templates repetidos, instruções verbosas)
2. Consolidar em local único de verdade
3. Delegar entre skills (evitar reimplementação)
4. Simplificar sem perder precisão

**Resultado:** 43% de redução em skills (2217 → 1270 linhas) sem alterar comportamento

**Evidências:** Sessão 2026-06-22 (otimização de tokens)

**Adicionado em:** 2026-06-22

---
