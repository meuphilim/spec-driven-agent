# Testing Patterns

> Carregue este guia ao criar testes, analisar cobertura, ou configurar infraestrutura de teste.

---

## Pirâmide de Testes

```
        ╱╲
       ╱  ╲      E2E (poucos, lentos, caros)
      ╱    ╲
     ╱──────╲    Integração (média quantidade)
    ╱        ╲
   ╱──────────╲  Unitários (muitos, rápidos, baratos)
  ╱────────────╲
```

**Regra:** Unitários > Integração > E2E em quantidade e velocidade.

---

## Unitários

### Quando criar
- Funções puras com lógica complexa
- Validações (Zod schemas, formatação)
- Utilitários (helpers, conversores)
- Regras de negócio isoladas

### Padrão AAA

```typescript
describe('sanitizePath', () => {
  it('should remove leading traversal', () => {
    // Arrange
    const input = '../../etc/passwd';
    
    // Act
    const result = sanitizePath(input);
    
    // Assert
    expect(result).toBe('etc/passwd');
  });
});
```

### Cobertura mínima
- Linhas: ≥80%
- Branches: ≥70%
- Funções: ≥90%

---

## Integração

### Quando criar
- API routes (request → response)
- Database queries (ORM + migrations)
- Auth flows (login → session → logout)
- File operations (upload → storage → download)

### Padrão

```typescript
describe('POST /api/news', () => {
  it('should create news with valid data', async () => {
    // Arrange
    const payload = { title: 'Test', content: 'Content' };
    
    // Act
    const res = await request(app)
      .post('/api/news')
      .send(payload)
      .set('Authorization', `Bearer ${token}`);
    
    // Assert
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test');
  });
});
```

### Mocks vs Real

| Tipo | Use mock | Use real |
|------|----------|----------|
| Database | ✅ Testes unitários | ✅ Integração |
| API externa | ✅ Sempre | ❌ Nunca |
| File system | ✅ Testes unitários | ✅ Integração |
| Auth provider | ✅ Testes unitários | ⚠️ Com cuidado |

---

## E2E (End-to-End)

### Quando criar
- Fluxos críticos de negócio
- Caminhos felizes principais
- Regressões de bugs anteriores

### Padrão (Playwright)

```typescript
test('user can create and publish news', async ({ page }) => {
  await page.goto('/admin/news');
  await page.click('button:has-text("New")');
  await page.fill('input[name="title"]', 'My News');
  await page.fill('textarea[name="content"]', 'Content');
  await page.click('button:has-text("Publish")');
  
  await expect(page.locator('.success')).toBeVisible();
});
```

### Regras
- Máximo 10 E2E por feature
- Rodar em CI, não local
- Screenshots em falha
- Timeouts explícitos

---

## Test Driven Development (TDD)

### Ciclo Red-Green-Refactor

```
1. RED    → Escrever teste que falha
2. GREEN  → Implementar código mínimo para passar
3. REFACTOR → Melhorar código sem quebrar testes
```

### Quando usar
- Nova feature complexa
- Bug com causa raiz clara
- Refatoração de lógica crítica

### Quando NÃO usar
- Prototipagem rápida
- Spikes de investigação
- Configuração simples

---

## Mocking

### Quando mockar
- Chamadas de rede (APIs externas)
- Sistema de arquivos
- Temporização (Date, setTimeout)
- Dependências pesadas (DB, cache)

### Quando NÃO mockar
- Funções puras
- Lógica de negócio simples
- Utilitários

### Padrão

```typescript
// Mock de fetch
jest.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mocked' }),
});

// Cleanup
afterEach(() => {
  jest.restoreAllMocks();
});
```

---

## Checklists

### Antes de criar testes
- [ ] Entender o comportamento esperado
- [ ] Identificar边界值 (boundary values)
- [ ] Listar casos de erro
- [ ] Decidir nível (unit/integration/e2e)

### Ao escrever testes
- [ ] Nome descritivo (o que testa + cenário)
- [ ] Arrange-Act-Assert claro
- [ ] Um assert por teste (idealmente)
- [ ] Dados de teste isolados

### Após implementar
- [ ] Todos os testes passam
- [ ] Cobertura mínima atingida
- [ ] Testes são rápidos (<100ms unit, <5s integration)
- [ ] Sem testes flaky
