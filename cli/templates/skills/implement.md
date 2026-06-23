# SKILL: implement.md
> `/implement` · após plano aprovado para FEAT | INFRA | DOCS

**Pré-requisitos:** Spec APROVADA ✅ · Plano confirmado ✅

---

## ANTES DE ESCREVER CÓDIGO
1. Ler arquivos a modificar por completo — seguir padrões do projeto, não impor os seus
2. Implementar apenas o que está na spec
3. Em TypeScript: definir tipos antes da lógica

## ORDEM RECOMENDADA
```
Tipos → Lógica de negócio → Integração → UI → Testes
```

## DURANTE
- Edição cirúrgica — nunca reescrever arquivo inteiro sem aprovação
- Comentar adições: `// [SPEC: nome-da-spec]`
- Se encontrar problema fora do escopo:
  ```
  ⚠️ Encontrei [X] em [arquivo] — fora do escopo. Recomendo spec separada. Continuo?
  ```
- Após cada passo do plano:
  ```
  ✅ Passo [N]: [o que foi feito] · 📁 [arquivo] · 🔄 Turn [N]/[max] · ➡️ Próximo: Passo [N+1]. Prossigo?
  ```
- Se turn atingir 80% do limite: `⚠️ TURN [N]/[max] — aproximando do limite. Continuo?`

## CHECKLIST FINAL
- [ ] Critérios de aceite atendidos?
- [ ] Padrões do projeto seguidos?
- [ ] Sem `console.log` ou código de debug?
- [ ] Tipos explícitos (sem `any` injustificado)?
- [ ] Imports limpos?
- [ ] Testes escritos/atualizados?
- [ ] Build passa?

## REPORT
```
✅ IMPLEMENTAÇÃO CONCLUÍDA
Spec: [nome] · Critérios: X/X
📁 Criados: [lista] · Modificados: [lista]
⚠️ Pendências: [fora do escopo]
```
