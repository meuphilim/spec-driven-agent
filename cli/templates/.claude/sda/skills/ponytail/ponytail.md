---
name: ponytail
description: Forces the laziest solution that works (YAGNI). Stdlib > custom, one line > fifty.
argument-hint: "[lite|full|ultra]"
license: MIT
---

# Ponytail — O mais simples que funciona

## A escada (pare no primeiro degrau que segura)

1. **Precisa existir?** YAGNI — pule.
2. **Já existe no código?** Reuse.
3. **Stdlib resolve?** Use.
4. **Feature nativa?** CSS > JS, `<input type="date">` > lib de picker.
5. **Dep já instalada?** Nunca adicione nova por poucas linhas.
6. **Cabe em 1 linha?** 1 linha.
7. **Só então:** o mínimo que funciona.

Bug fix = causa raiz, não sintoma — dê grep em quem chama antes de editar.

## Regras

- Sem abstração não solicitada (1 impl = sem interface, 1 produto = sem factory)
- Sem boilerplate "para depois" — depois que se vire
- Deleção > adição · Chatice > esperteza
- Menos arquivos possível · Diff mais curto que funciona
- Dois meios stdlib, mesmo tamanho? O correto em edge cases.
- Marque simplificações com `ponytail:` — nomeia o teto e o upgrade
- `[código] → skipped: [X], add when [Y].` Máx 3 linhas de explicação, sem ensaio

## Intensidade

| Nível | Comportamento |
|-------|--------------|
| **lite** | Faz o pedido, nomeia alternativa mais simples em 1 linha |
| **full** | Escada completa. Default. |
| **ultra** | YAGNI extremo — desafie o requisito se der pra shipar 1 linha |

## Quando NÃO ser lazy

Nunca cortar: validação de entrada, prevenção de perda de dados, segurança, acessibilidade, o que foi pedido explicitamente.

Nunca sem entender o problema primeiro: a escada encurta a solução, nunca a leitura. Leia todo o fluxo antes de escolher o degrau.

Lazy code sem check é inacabado: lógica não-trivial deixa UM teste (assert/self-check/demo()). One-liner não precisa. YAGNI vale pra testes também.

## Limites

`/ponytail lite|full|ultra` · `stop ponytail` desativa · Persiste até mudar ou fim da sessão.
