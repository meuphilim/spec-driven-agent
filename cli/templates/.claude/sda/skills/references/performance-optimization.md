# Performance Optimization

> Carregue este guia ao otimizar builds, investigar lentidão, ou configurar caching.

---

## Métricas de Performance

### Core Web Vitals

| Métrica | Bom | Médio | Ruim |
|---------|-----|-------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | <4s | >4s |
| **FID** (First Input Delay) | <100ms | <300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | <0.25 | >0.25 |
| **INP** (Interaction to Next Paint) | <200ms | <500ms | >500ms |

---

## Bundle Optimization

### Análise

```bash
# Next.js
npx @next/bundle-analyzer

# Webpack
ANALYZE=true npm run build

# Vite
npx vite-bundle-visualizer
```

### Estratégias

1. **Code splitting** — carregue código sob demanda
2. **Tree shaking** — elimine código não utilizado
3. **Lazy loading** — carregue componentes sob demanda
3. **Dynamic imports** — importe módulos condicionalmente

### Next.js

```typescript
// Lazy load de componente pesado
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

---

## Caching

### Estratégias

| Tipo | TTL | Quando usar |
|------|-----|-------------|
| **Browser** | 1 hora - 1 semana | Assets estáticos |
| **CDN** | 1 hora - 1 dia | API pública |
| **Application** | 5 min - 1 hora | Dados que mudam pouco |
| **Database** | 1 min - 5 min | Queries lentas |

### Next.js (ISR)

```typescript
// Revalidate a cada 60 segundos
export const revalidate = 60;

export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}
```

### Redis (Upstash)

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function getCached(key: string, ttl: number, fetcher: () => Promise<any>) {
  const cached = await redis.get(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

---

## Database Optimization

### Índices

```sql
-- Índice para queries frequentes
CREATE INDEX idx_news_created ON news(created_at DESC);
CREATE INDEX idx_news_category ON news(category);

-- Índice composto
CREATE INDEX idx_news_category_created ON news(category, created_at DESC);
```

### Query Optimization

```typescript
// ❌ INCORRETO: N+1 query
const news = await db.query('SELECT * FROM news');
for (const item of news) {
  item.author = await db.query('SELECT * FROM users WHERE id = $1', [item.authorId]);
}

// ✅ CORRETO: JOIN
const news = await db.query(`
  SELECT n.*, u.name as author_name
  FROM news n
  JOIN users u ON n.author_id = u.id
  ORDER BY n.created_at DESC
`);
```

### Conexões

```typescript
// Usar pool de conexões
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // máximo de conexões
  idleTimeoutMillis: 30000,
});
```

---

## Imagens

### Formatos

| Formato | Quando usar | Compression |
|---------|-------------|-------------|
| **WebP** | Web geral | 25-35% menor que JPEG |
| **AVIF** | Chrome/Edge | 50% menor que JPEG |
| **JPEG** | Fotos | Compatibilidade |
| **PNG** | Transparência | Sem perda |

### Next.js Image

```typescript
import Image from 'next/image';

<Image
  src="/photo.jpg"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataUrl}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Lazy Loading

```html
<!-- Nativo -->
<img src="photo.jpg" loading="lazy" alt="..." />

<!-- Intersection Observer -->
<img data-src="photo.jpg" class="lazy" alt="..." />
```

---

## API Optimization

### Pagination

```typescript
// Cursor-based (recomendado)
const news = await db.query(`
  SELECT * FROM news
  WHERE id > $1
  ORDER BY id ASC
  LIMIT 20
`, [lastId]);

// Offset-based (evite para dados grandes)
const news = await db.query(`
  SELECT * FROM news
  ORDER BY created_at DESC
  LIMIT 20 OFFSET $1
`, [page * 20]);
```

### Compression

```typescript
import compression from 'compression';
app.use(compression());
```

### Response Caching

```typescript
// Cache por rota
app.get('/api/news', cache('5 minutes'), async (req, res) => {
  const news = await getNews();
  res.json(news);
});
```

---

## Node.js Optimization

### Event Loop

```typescript
// ❌ INCORRETO: bloqueia event loop
const data = fs.readFileSync('large-file.txt');

// ✅ CORRETO: assíncrono
const data = await fs.promises.readFile('large-file.txt');
```

### Worker Threads

```typescript
// Para CPU-intensive tasks
import { Worker } from 'worker_threads';

const worker = new Worker('./heavy-task.js', {
  workerData: { input: largeDataset },
});
```

---

## Monitoramento

### Ferramentas

| Ferramenta | Uso | Gratuito |
|------------|-----|----------|
| **Lighthouse** | Performance web | ✅ |
| **New Relic** | APM | ✅ (limitado)
| **Sentry** | Error tracking | ✅ (limitado)
| **Vercel Analytics** | Core Web Vitals | ✅ |

### Logs de Performance

```typescript
console.time('query');
const result = await db.query('SELECT ...');
console.timeEnd('query'); // query: 45.234ms
```

---

## Checklist

### Build
- [ ] Bundle size < 200KB (gzipped)
- [ ] Code splitting configurado
- [ ] Tree shaking habilitado
- [ ] Imagens otimizadas (WebP/AVIF)

### Runtime
- [ ] Lazy loading ativo
- [ ] Caching configurado (Redis/ISR)
- [ ] Database indexado
- [ ] Connection pooling

### Monitoramento
- [ ] Core Web Vitals < "Bom"
- [ ] Error tracking ativo
- [ ] Performance logging
- [ ] Alerts configurados
