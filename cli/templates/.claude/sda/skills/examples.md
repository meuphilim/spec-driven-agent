# Examples — Exemplos Completos (consulta na primeira vez)

> Carregue este arquivo na primeira vez que o usuário usar um comando.
> Contém exemplos completos de cada skill para referência.
> Após a primeira leitura, não precisa recarregar.

---

## spec.md — Exemplo Completo

```markdown
# SPEC: Adicionar validação de email
**Data:** 2026-06-28  **Tipo:** FEAT  **Status:** APROVADA

## Contexto
O formulário de contato aceita emails inválidos, causando erros downstream.

## Objetivo
Validar email no frontend (formato) e backend (existência DNS) antes de salvar.

## Escopo
### Inclui
- Validação Zod no schema do formulário
- Validação DNS no endpoint POST /api/contact

### Exclui
- Validação de deliverability (SMTP check)
- Mudanças no design do formulário

## Comportamento Esperado
- Email inválido no frontend → mensagem de erro inline
- Email válido no frontend mas inválido no DNS → erro 422 na API
- Email válido → salvamento normal

## Critérios de Aceite
- [ ] `test@email.invalid` rejeitado no frontend
- [ ] `user@gmail.com` aceito no frontend e backend
- [ ] `nonexistent@fakedomain.xyz` rejeitado no backend (422)
- [ ] Mensagens de erro em português

## Riscos e Dependências
- DNS validation pode ter falsos negativos (servidores down)
- Timeout de 3s para não bloquear UI
```

---

## plan.md — Exemplo Completo

```
📐 PLAN GATE
┌─────────────────────────────────────────────────────────────────┐
│ Plano: Adicionar validação de email                             │
│ Passos: 4 · Arquivos: 3 · Risco: Baixo                        │
│                                                                 │
│ 1. Criar schema Zod em lib/validations.ts (+15 linhas)        │
│ 2. Adicionar validação DNS em services/email.ts (+20 linhas)  │
│ 3. Integrar no formulário ContactForm.tsx (+5 linhas)         │
│ 4. Adicionar testes unitários (+40 linhas)                    │
│                                                                 │
│ Riscos: DNS timeout → mock em testes                          │
│ Rollback: Reverter commits na ordem inversa                    │
│                                                                 │
│ ✋ Confirma? Responda "confirmar" para continuar.              │
└─────────────────────────────────────────────────────────────────┘
```

---

## reflect.md — Exemplo Completo

```
🪞 REFLECT GATE
┌─────────────────────────────────────────────────────────────────┐
│ Reflexão: Adicionar validação de email                          │
│                                                                 │
│ ✅ Funcionou:                                                  │
│ - Zod schema reutilizou regex existente do projeto              │
│ - Validação DNS isolada em service separado                     │
│                                                                 │
│ ⚠️  Atrito:                                                    │
│ - Teste de DNS timeout falhou em CI (rede) → mock necessário   │
│                                                                 │
│ 💡 Descobertas:                                                 │
│ - PADRÃO: Sempre mockar calls externos em testes unitários     │
│   → consolidar                                                │
│                                                                 │
│ Sessão: .claude/sda/sessions/2026-06-28-validacao-email.md     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Uso

- `/spec` → carregar spec.md + este arquivo na primeira vez
- `/plan` → carregar plan.md + este arquivo na primeira vez
- `/reflect` → carregar reflect.md + este arquivo na primeira vez
- Sessões subsequentes pular este arquivo — exemplos já vistos
