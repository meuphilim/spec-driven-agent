# spec-driven-agent landing page

Official landing page for the [Spec-Driven Development Framework](https://github.com/meuphilim/spec-driven-agent).

Built with **Astro 5** + **Tailwind CSS 4**, deployed via GitHub Pages.

## Development

```bash
npm install
npm run dev       # local dev server at localhost:4321
npm run build     # static build to dist/
npm run preview   # preview the built site
```

## Deployment

Automatically deployed via `.github/workflows/site.yml` on pushes to `master` that touch `site/**`. Manual trigger available via GitHub Actions → "Deploy Landing Page" → "Run workflow".

## Structure

```
site/
├── public/           # Static assets (favicon, OG image, robots.txt)
├── src/
│   ├── components/   # Astro components
│   ├── layouts/      # Page layouts
│   ├── pages/        # Route pages
│   └── styles/       # Global CSS
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
