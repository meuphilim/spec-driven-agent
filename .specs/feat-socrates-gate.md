# SPEC: feat-socrates-gate

**Data:** 2026-06-22
**Tipo:** FEAT
**Status:** RASCUNHO

---

## Contexto

O framework tem a regra "nunca assuma nada sobre um projeto", mas não há mecanismo formal para detectar quando o contexto é insuficiente e coletar informações do usuário de forma estruturada. Quando `/context` não consegue descobrir algo (objetivo do projeto, stack de deploy, usuários-alvo, etc.), o agente pode prosseguir com suposições ou parar indefinidamente.

## Objetivo

Criar um **Socrates Gate** — mecanismo que detecta gaps de contexto e coleta informações do usuário através de perguntas estruturadas por categoria, registrando as respostas para uso futuro.

## Escopo

### Inclui
- Nova skill `skills/socrates.md` com protocolo completo
- Integração com `/context` (detectar gaps)
- Categorias de perguntas: Negócio, Técnico, Equipe, Operacional
- Formato de registro das respostas em `.sessions/`
- Validação das respostas antes de prosseguir

### Exclui
- Mudanças no CLAUDE.md (será atualizado depois se necessário)
- Integração com outras skills além de `/context`
- Automação de perguntas (mantido manual para controlar qualidade)

## Comportamento Esperado

Quando `/context` identificar gaps de contexto:

1. **Detectar gaps:** Identificar que informações estão faltando
2. **Classificar:** Categorizar os gaps (Negócio, Técnico, Equipe, Operacional)
3. **Perguntar:** Apresentar perguntas estruturadas ao usuário
4. **Registrar:** Salvar respostas em `.sessions/`
5. **Validar:** Confirmar que contexto suficiente foi coletado
6. **Prosseguir:** Continuar com a tarefa usando contexto coletado

## Critérios de Aceite

- [ ] Skill `skills/socrates.md` criada com protocolo completo
- [ ] Categorias de perguntas definidas (mínimo 4)
- [ ] Perguntas são específicas e acionáveis (não genéricas)
- [ ] Respostas são registradas em `.sessions/`
- [ ] Integração com `/context` documentada
- [ ] Fluxo completo testável mentalmente

## Riscos e Dependências

- **Risco:** Perguntas podem ser muitas ou irrelevantes (mitigado por categorização)
- **Dependência:** Nenhuma — skill independente

## Fora do Escopo / Próximas Specs

- Integração com `/spec` (usar contexto coletado)
- Integração com `/plan` (usar contexto coletado)
- Automação de detecção de gaps (futuro)
