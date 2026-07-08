# SKILL: adr.md
> `/adr` — Architecture Decision Records · captura e consulta de decisões arquiteturais
> **Fase SDD:** Design → pós-Validate (persistência)
> **Dependências:** DESIGN GATE (para captura automática)

---

## Propósito

Transformar decisões arquiteturais tomadas durante o fluxo SDD em **registros persistentes, buscáveis e referenciáveis**. Impede que o "porquê" das decisões se perca entre sessões e fornece consulta rápida para evitar re-debater decisões já tomadas.

---

## Modos de Uso

| Comando | Ação |
|---|---|
| `/adr create "Título"` | Criar novo ADR (interativo: contexto → decisão → consequências → alternativas → status) |
| `/adr list` | Listar todos ADRs com status e título |
| `/adr list --status accepted` | Listar ADRs por status |
| `/adr list --since YYYY-MM-DD` | Listar ADRs criados após data |
| `/adr NNNN` | Ler ADR específico pelo número |
| `/adr search <termo>` | Busca textual em todos ADRs |
| `/adr status NNNN <novo-status>` | Atualizar status: `proposed` → `accepted` / `deprecated` / `superseded` |
| `/adr link NNNN` | Mostrar decisões relacionadas (via ligações `Superseded by` / `Related to`) |

---

## Formato do ADR

Cada ADR é um arquivo em `docs/adr/NNNN-title-com-hifens.md`:

```markdown
# NNNN — Título da Decisão Arquitetural

## Status
`accepted` | `proposed` | `deprecated` | `superseded`

*Se `superseded`, incluir:* **Superseded by:** [NNNN](./NNNN-title.md)

## Contexto
Por que essa decisão foi necessária. Qual problema estava sendo resolvido.
Quais forças (técnicas, de negócio, de processo) estavam em jogo.

## Decisão
O que foi decidido. Qual caminho foi escolhido. Em termos concretos.

## Consequências
- (+) Benefício: ...
- (+) Trade-off: ...
- (!) Rastro: referência no código, commit, ou documentação

## Alternativas Consideradas
- **Alternativa A:** — por que foi rejeitada
- **Alternativa B:** — por que foi rejeitada

## Metadados
- **Data:** YYYY-MM-DD
- **Autor:** Samantha (via /adr) | Usuário
- **Fase SDD de origem:** Design | Validate | Reflect
- **Spec relacionada:** [link para spec]
```

---

## Protocolo de Criação

### 1. Detectar gatilho
Criar ADR quando QUALQUER destes ocorrer:
- Fim da fase `/design` com decisão arquitetural significativa
- Decisão hard-to-reverse durante `/plan` ou `/implement`
- Mudança de direção durante `/reflect`
- Usuário explicitamente chama `/adr create`

### 2. Coletar informações
Para cada campo, perguntar ao usuário OU extrair do contexto da sessão:

```
1. 🎯 Título (curto, descritivo)
2. 📖 Contexto (2-5 frases: qual problema, quais forças)
3. ⚡ Decisão (o que foi decidido, objetivamente)
4. 📋 Consequências (+ e -)
5. 🔄 Alternativas consideradas (mínimo 1, ideal 2+)
6. 🏷️ Status (proposed | accepted)
7. 🔗 Spec relacionada (opcional)
```

> **Modo rápido:** Se todas as informações já estão disponíveis no contexto, perguntar apenas "Confirmar ADR?" em vez de campo por campo.

### 3. Gerar número sequencial
Ler diretório `docs/adr/`, encontrar maior prefixo `NNNN`, incrementar.

### 4. Escrever arquivo
`docs/adr/NNNN-title-com-hifens.md`

---

## Protocolo de Consulta

### lookup automático no DESIGN

Quando uma nova requisição chega e envolve decisão arquitetural (fase DESIGN), Samantha DEVE:

1. Extrair termos-chave da requisição
2. Executar `/adr search <termos>`
3. Se encontrar ADR relevante: citar no DESIGN GATE:
   ```
   📜 Decisão anterior relevante: ADR-NNNN — Título
   Status: accepted | deprecated | superseded
   Contexto: [resumo de 1 linha]
   ```
4. Usuário pode optar por seguir decisão anterior ou reabrir

### listagem compacta

```
📜 ADRs registrados (N total):
━━━━━━━━━━━━━━━━━━━━━━━━━
NNNN │ status │ Título
NNNN │ status │ Título
```

---

## Integração com o Fluxo SDD

| Momento | Ação |
|---|---|
| Fim do DESIGN | "A decisão [X] parece candidata a ADR. Deseja registrar?" |
| Fim do VALIDATE | "Identificamos decisão arquitetural [Y]. Deseja registrar como ADR?" |
| CONSTITUTION (início) | "📜 ADRs existentes: [N] — Consulte com /adr list" |

---

## GATE OBRIGATÓRIO

Ao finalizar qualquer criação de ADR:

```
┌─ ADR GATE ───────────────────────────────────────────┐
│ 📜 ADR-NNNN: Título                                  │
│                                                       │
│ Criado em: YYYY-MM-DD                                │
│ Status: accepted                                      │
│                                                       │
│ 🔗 Referencie em consultas futuras: /adr NNNN        │
└───────────────────────────────────────────────────────┘
```

---

## Convenções

- **Numeração:** Sequencial, 4 dígitos (0001, 0002...). Nunca reutilizar.
- **Título:** capitalize, máximo 60 chars, hífens entre palavras no filename
- **Nunca deletar ADRs** — marcar `deprecated` ou `superseded` com `Superseded by:` apontando o substituto
- **Cross-reference:** ADR que substitui outro inclui `Supersedes: NNNN` nos Metadados
- **Commits:** Ao criar ADR, sugerir: `docs: adr-NNNN title`
