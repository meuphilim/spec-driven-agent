# Security Best Practices

> Carregue este guia ao revisar código, configurar autenticação, ou implementar APIs.

---

## OWASP Top 10 (Resumo)

| # | Vulnerabilidade | Prevenção |
|---|-----------------|-----------|
| A01 | Broken Access Control | Valide permissões no servidor |
| A02 | Cryptographic Failures | Use bcrypt/argon2, nunca MD5/SHA1 |
| A03 | Injection | Use prepared statements, input validation |
| A04 | Insecure Design | Threat modeling na fase de design |
| A05 | Security Misconfiguration | Minimal privileges, disable defaults |
| A06 | Vulnerable Components | `npm audit`, dependabot |
| A07 | Auth Failures | MFA, rate limiting, session management |
| A08 | Data Integrity Failures | Signed commits, verified builds |
| A09 | Logging Failures | Log audit events, não logue PII |
| A10 | SSRF | Valide URLs, whitelist de domínios |

---

## Autenticação

### Senhas

```typescript
// ✅ CORRETO: bcrypt com salt
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);

// ❌ INCORRETO: hash simples
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### Sessões

- Use HTTPOnly cookies (não localStorage)
- Defina expiry (max 7 dias)
- Regenere session ID após login
- Invalidade sessões no logout

### JWT

```typescript
// ✅ CORRETO: curto prazo + refresh token
const token = jwt.sign(payload, secret, { expiresIn: '15m' });

// ❌ INCORRETO: longo prazo
const token = jwt.sign(payload, secret, { expiresIn: '365d' });
```

---

## Validação de Input

### Regras

1. **Nunca confie no client** — valide tudo no servidor
2. **Whitelist > blacklist** — defina o que é permitido
3. **Type coercion** — não dependa de conversão automática
4. **Length limits** — defina máximo para todos os campos

### Padrão com Zod

```typescript
import { z } from 'zod';

const NewsSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  category: z.enum(['news', 'article', 'announcement']),
});

// Validação
const result = NewsSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
```

---

## Injeção SQL

### ❌ INCORRETO

```typescript
// Nunca concatene input do usuário
const query = `SELECT * FROM users WHERE id = '${userId}'`;
```

### ✅ CORRETO

```typescript
// Use prepared statements
const { rows } = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

---

## Injeção de Comandos

### ❌ INCORRETO

```typescript
// Nunca use execSync com input
execSync(`bash "${script}" "${userInput}"`);
```

### ✅ CORRETO

```typescript
// Use execFileSync com array
execFileSync('bash', [script, userInput]);
```

---

## Secrets

### Regras

1. **Nunca em código** — use variáveis de ambiente
2. **Nunca em commits** — use .gitignore
3. **Nunca em logs** — sanitize output
4. **Rotação** — mude secrets periodicamente

### .gitignore

```gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### GitHub Secrets

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

---

## Headers de Segurança

### Helmet.js (Express)

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### Headers essenciais

| Header | Valor | Proteção |
|--------|-------|----------|
| `Content-Security-Policy` | `default-src 'self'` | XSS |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Strict-Transport-Security` | `max-age=31536000` | MITM |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Info leak |

---

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Too many requests',
});

app.use('/api/', limiter);
```

### Limites por rota

| Rota | Limite | Razão |
|------|--------|-------|
| Login | 5/min | Brute force |
| API pública | 100/min | Abuso |
| Upload | 10/min | Storage abuse |
| Contato | 3/min | Spam |

---

## Checklist de Segurança

### Antes de deploy
- [ ] Todos os secrets em variáveis de ambiente
- [ ] .gitignore inclui .env e arquivos sensíveis
- [ ] Rate limiting configurado
- [ ] Input validation em todas as APIs
- [ ] HTTPS forçado
- [ ] Headers de segurança ativos

### Durante desenvolvimento
- [ ] Não logue PII (emails, senhas, CPFs)
- [ ] Valide permissões no servidor
- [ ] Use prepared queries
- [ ] Sanitize output (anti-XSS)
- [ ] Assine e valide webhooks

### Após deploy
- [ ] Rode `npm audit`
- [ ] Verifique dependências desatualizadas
- [ ] Teste com payload malicioso
- [ ] Revise logs de erro
