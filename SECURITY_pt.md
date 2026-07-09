# Política de Segurança

> 🌐 Read this documentation in [English](SECURITY.md).

## Versões Suportadas

| Versão | Suportada |
|---------|-----------|
| 5.x | ✅ |
| 4.3.x | ✅ (EOL 2026-09) |
| 4.2.x | ✅ (EOL 2026-09) |
| < 4.2 | ❌ |

## Reportando uma Vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança neste projeto, envie um e-mail para o Meuphilim. Todas as vulnerabilidades serão tratadas prontamente.

**Por favor, não reporte vulnerabilidades de segurança por meio de issues públicas do GitHub.**

### O que incluir

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Correção sugerida (se houver)

### Linha do tempo de resposta

- **Confirmação de recebimento:** Em até 48 horas
- **Avaliação inicial:** Em até 1 semana
- **Correção ou mitigação:** Em até 2 semanas (crítica), 1 mês (alta)

## Medidas de Segurança

### Validação de Entrada

- Todas as entradas do usuário são sanitizadas via `sanitizePath()` na CLI
- Caracteres proibidos: `;&|`$(){}!<>`
- Comandos shell usam `execFileSync` com arrays de argumentos (nunca interpolação de strings)

### Proteção de Dados

- Nenhum dado sensível é registrado em log
- O estado da sessão (`state.json`) está no gitignore
- Variáveis de ambiente nunca são commitadas

### Dependências

- Zero dependências de execução (a CLI usa apenas recursos nativos do Node.js)
- Recomenda-se checagens regulares com `npm audit`

## Boas Práticas

Ao utilizar este framework:

1. **Mantenha as dependências atualizadas** — execute `npm audit` regularmente
2. **Use variáveis de ambiente** — nunca exponha segredos no código
3. **Valide entradas** — especialmente em skills ou hooks personalizados
4. **Revise hooks** — garanta que scripts shell não exponham dados sensíveis
5. **Limite permissões** — use o sistema de permissões do Claude Code

## Escopo

Esta política de segurança aplica-se a:

- O pacote npm `spec-driven-agent`
- A ferramenta de CLI (`sda`)
- Os templates e skills do framework
- Os scripts de hook

Ela **não** se aplica a:

- Integrações de terceiros
- Skills personalizadas criadas por usuários
- Projetos que utilizam este framework
