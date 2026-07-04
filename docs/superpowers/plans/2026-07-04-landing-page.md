# Landing Page — Spec-Driven Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated Astro-based landing page in `/site/` for the Spec-Driven Agent framework, with terminal animation, bento grid features, SDD cycle diagram, dark/light mode, and GitHub Pages deploy.

**Architecture:** Single-page Astro SSG site, Tailwind CSS for styling, zero-JS by default with progressive enhancement for animations. All code lives under `/site/` — no changes to existing framework code.

**Tech Stack:** Astro 5, Tailwind CSS 4, Inter + JetBrains Mono fonts, Lucide icons, GitHub Actions Pages deployment.

---

### Task 1: Scaffold project structure

**Files:**
- Create: `site/package.json`
- Create: `site/astro.config.mjs`
- Create: `site/tsconfig.json`
- Create: `site/tailwind.config.mjs`
- Create: `site/.gitignore`

- [ ] **Step 1: Create site/package.json**

```json
{
  "name": "spec-driven-agent-landing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Landing page for Spec-Driven Agent framework",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create site/astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves at /spec-driven-agent/ when not using custom domain
const base = process.env.BASE_PATH || '/spec-driven-agent/';

export default defineConfig({
  site: 'https://meuphilim.github.io',
  base,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create site/tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Create site/.gitignore**

```
node_modules/
dist/
.DS_Store
*.log
.env
.env.local
```

- [ ] **Step 5: Install dependencies**

Run: `cd site && npm install`

- [ ] **Step 6: Verify build works**

Run: `cd site && npm run build`
Expected: `site/dist/` directory created with `index.html`

- [ ] **Step 7: Commit**

```bash
git add site/package.json site/astro.config.mjs site/tsconfig.json site/.gitignore site/dist/
git commit -m "feat: scaffold Astro project for landing page under /site/"
```

---

### Task 2: Create layout and global styles

**Files:**
- Create: `site/src/layouts/BaseLayout.astro`
- Create: `site/src/styles/global.css`

- [ ] **Step 1: Create global.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-accent-50: #f7fee7;
  --color-accent-100: #ecfccb;
  --color-accent-200: #d9f99d;
  --color-accent-300: #bef264;
  --color-accent-400: #a3e635;
  --color-accent-500: #84cc16;
  --color-accent-600: #65a30d;
  --color-accent-700: #4d7c0f;
  --color-accent-800: #3f6212;
  --color-accent-900: #365314;
  --color-accent-950: #1a2e05;
}

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100;
    font-family: var(--font-sans);
  }

  ::selection {
    @apply bg-accent-500/30;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  .glass-card {
    @apply border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl;
  }

  .gradient-text {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-600;
  }
}
```

- [ ] **Step 2: Create BaseLayout.astro**

```astro
---
export interface Props {
  title: string;
  description: string;
  ogImage?: string;
}

const { title, description, ogImage = '/spec-driven-agent/og-image.svg' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/spec-driven-agent/favicon.svg" />

    <!-- Prevent FOUC on dark mode -->
    <script is:inline>
      (function() {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || (!stored && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.remove('dark');
        }
      })();
    </script>

    <!-- Primary Meta Tags -->
    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalURL} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={new URL(ogImage, Astro.site)} />

    <link rel="canonical" href={canonicalURL} />
    <link rel="sitemap" href="/spec-driven-agent/sitemap-index.xml" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add site/src/layouts/BaseLayout.astro site/src/styles/global.css
git commit -m "feat: add BaseLayout with SEO, dark mode, and global styles"
```

---

### Task 3: Build Nav component

**Files:**
- Create: `site/src/components/Nav.astro`
- Create: `site/src/pages/index.astro`

- [ ] **Step 1: Create Nav.astro**

```astro
---
const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#installation', label: 'Install' },
  { href: '#commands', label: 'Commands' },
];
const githubUrl = 'https://github.com/meuphilim/spec-driven-agent';
const npmUrl = 'https://www.npmjs.com/package/spec-driven-agent';
---

<nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <a href="#" class="flex items-center gap-2 group">
        <span class="text-accent-400 text-lg font-bold font-mono">&gt;_</span>
        <span class="font-semibold text-gray-100 group-hover:text-white transition-colors">
          spec-driven-agent
        </span>
      </a>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a href={link.href} class="text-sm text-gray-400 hover:text-gray-100 transition-colors">
            {link.label}
          </a>
        ))}

        <button id="theme-toggle" class="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors" aria-label="Toggle theme">
          <svg id="sun-icon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg id="moon-icon" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <div class="flex items-center gap-3">
          <a href={npmUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-400 text-gray-950 font-medium text-sm rounded-lg transition-colors">
            npm install
          </a>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/30 text-gray-300 hover:text-white text-sm rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </div>

      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-100" aria-label="Open menu">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>

  <div id="mobile-menu" class="hidden md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
    <div class="px-4 py-4 space-y-3">
      {navLinks.map((link) => (
        <a href={link.href} class="block text-sm text-gray-400 hover:text-gray-100 transition-colors">{link.label}</a>
      ))}
      <div class="flex gap-3 pt-2">
        <a href={npmUrl} target="_blank" rel="noopener noreferrer" class="flex-1 text-center px-4 py-2 bg-accent-500 text-gray-950 font-medium text-sm rounded-lg">npm install</a>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" class="flex-1 text-center px-4 py-2 border border-white/10 text-gray-300 text-sm rounded-lg">GitHub</a>
      </div>
    </div>
  </div>
</nav>

<script>
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  const html = document.documentElement;

  function setTheme(theme) {
    if (theme === 'light') {
      html.classList.remove('dark');
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
      localStorage.setItem('theme', 'dark');
    }
  }

  themeToggle?.addEventListener('click', () => {
    setTheme(html.classList.contains('dark') ? 'light' : 'dark');
  });

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  menuBtn?.addEventListener('click', () => {
    const isHidden = mobileMenu?.classList.contains('hidden');
    mobileMenu?.classList.toggle('hidden', !isHidden);
    menuBtn.setAttribute('aria-label', isHidden ? 'Close menu' : 'Open menu');
  });
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { mobileMenu.classList.add('hidden'); });
  });
</script>
```

- [ ] **Step 2: Create index.astro skeleton**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
---

<BaseLayout
  title="Spec-Driven Agent — Development Framework for Claude Code"
  description="SDD framework enforces disciplined development via GATEs (SPEC, DESIGN, PLAN, VALIDATE, REFLECT). Built for Claude Code. 53 tests. MIT license."
>
  <Nav />
  <main class="min-h-screen">
    <!-- Sections to be added incrementally -->
  </main>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Nav.astro site/src/pages/index.astro
git commit -m "feat: add Nav component with theme toggle and mobile menu"
```

---

### Task 4: Build Hero with terminal animation

**Files:**
- Create: `site/src/components/Hero.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
const terminalLines = [
  '$ npm install -g spec-driven-agent',
  '+ spec-driven-agent@5.1.6',
  'added 1 package in 2s',
  '',
  '$ npx sda init',
  '╭──────────────────────────────────────╮',
  '│  🎯 CLASSIFY: FEAT · Effort: medium  │',
  '│  📋 SPECIFY → Creating specification │',
  '│  🏗️  DESIGN → Architecture decisions  │',
  '│  📐 PLAN → Atomic steps             │',
  '│  ⚙️  EXECUTE → Implementing           │',
  '│  ✅ VALIDATE → Checking acceptance    │',
  '│  🪞 REFLECT → Learning consolidated   │',
  '╰──────────────────────────────────────╯',
  '✅ SDD cycle complete · Turns: 12/20',
];
---

<section class="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-transparent to-transparent pointer-events-none" />

  <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-accent-500/20 bg-accent-500/10 rounded-full">
        <span class="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
        <span class="text-xs font-mono text-accent-300 font-medium">v5.1.6 · Production Ready</span>
      </div>

      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
        <span class="text-gray-100">Write specs.<br/>Let the agent</span>
        <br/>
        <span class="gradient-text">execute.</span>
      </h1>

      <p class="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Spec-Driven Development enforces discipline via <strong class="text-gray-200">5 GATEs</strong>,
        cutting token waste by <strong class="text-gray-200">60%</strong> on simple tasks.
        Built for Claude Code. Orchestrated by <strong class="text-gray-200">Samantha</strong>.
      </p>

      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="https://www.npmjs.com/package/spec-driven-agent" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-400 text-gray-950 font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-accent-400/40">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          Install via npm
        </a>
        <a href="https://github.com/meuphilim/spec-driven-agent" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/30 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          View on GitHub
        </a>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          53/53 tests
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">MIT License</span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">Node ≥ 18</span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">Claude Code</span>
      </div>
    </div>

    <!-- Terminal -->
    <div class="mt-12 max-w-2xl mx-auto">
      <div class="rounded-xl border border-white/10 bg-[#0d0d10] shadow-2xl shadow-black/50 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <span class="w-3 h-3 rounded-full bg-red-500/80" />
          <span class="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span class="w-3 h-3 rounded-full bg-green-500/80" />
          <span class="ml-2 text-xs text-gray-500 font-mono">sda-demo — bash</span>
        </div>
        <div class="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
          {terminalLines.map((line, i) => (
            <div class={`whitespace-pre ${line.startsWith('$') ? 'text-accent-300' : line.startsWith('│') ? 'text-gray-400' : line.startsWith('+') ? 'text-green-400' : line.startsWith('✅') ? 'text-accent-400' : 'text-gray-500'}`}
                 style={`animation: fadeIn 0.3s ease-out ${i * 0.15}s forwards; opacity: 0;`}>
              {line}
              {line.startsWith('$') && i === 0 && (
                <span class="inline-block w-2 h-4 ml-0.5 bg-accent-400 animate-blink align-middle" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Update index.astro to include Hero**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---

<BaseLayout
  title="Spec-Driven Agent — Development Framework for Claude Code"
  description="SDD framework enforces disciplined development via GATEs (SPEC, DESIGN, PLAN, VALIDATE, REFLECT). Built for Claude Code. 53 tests. MIT license."
>
  <Nav />
  <main class="min-h-screen">
    <Hero />
    <!-- More sections to follow -->
  </main>
</BaseLayout>
```

- [ ] **Step 3: Build and verify**

Run: `cd site && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add site/src/components/Hero.astro site/src/pages/index.astro
git commit -m "feat: add Hero with terminal animation and badges"
```

---

### Task 5: Build Problem → Solution section

**Files:**
- Create: `site/src/components/ProblemSolution.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create ProblemSolution.astro**

```astro
---
const problems = [
  {
    icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>',
    problem: 'Agents skip steps, produce code without specs.',
    solution: 'GATEs force every phase: Specify → Design → Plan → Execute → Validate.',
  },
  {
    icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>',
    problem: 'Context lost between sessions. No learning curve.',
    solution: '5-layer memory: working, episodic, semantic, procedural, antipatterns.',
  },
  {
    icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    problem: 'Token waste on trivial tasks.',
    solution: 'LITE mode cuts 60% tokens — 1,500 instead of 15,000 for small tasks.',
  },
  {
    icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>',
    problem: 'No quality guarantees on agent output.',
    solution: '53 automated tests, validation protocol, lint checks built in.',
  },
];

const solutionHighlights = [
  { value: '5', label: 'GATEs' },
  { value: '60%', label: 'Token savings (LITE)' },
  { value: '53', label: 'Tests passing' },
  { value: '5', label: 'Memory layers' },
];
---

<section id="problem-solution" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div>
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">
          The problem with<br />
          <span class="gradient-text">AI agents</span>
        </h2>
        <p class="mt-4 text-gray-400 leading-relaxed">
          LLM agents are powerful but undisciplined. They jump to code without specs,
          lose context between sessions, and waste tokens on trivial tasks.
          <strong class="text-gray-200">SDD brings engineering rigor to agentic development.</strong>
        </p>

        <div class="mt-10 space-y-6">
          {problems.map((item) => (
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
                {item.icon}
              </div>
              <div>
                <div class="text-sm text-red-400/80 font-mono">✗ {item.problem}</div>
                <div class="text-sm text-green-400/80 font-mono mt-1">✓ {item.solution}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-transparent rounded-2xl" />
        <div class="relative glass-card p-8 sm:p-10 border-accent-500/10">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-accent-400 mb-8 font-mono">By the numbers</h3>
          <div class="grid grid-cols-2 gap-8">
            {solutionHighlights.map((stat) => (
              <div>
                <div class="text-3xl sm:text-4xl font-extrabold text-gray-100">{stat.value}</div>
                <div class="mt-1 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
          <div class="mt-8 pt-6 border-t border-white/10">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="w-2 h-2 rounded-full bg-accent-400" />
              And growing — v5.2 planned with visual metrics dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add ProblemSolution to index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ProblemSolution from '../components/ProblemSolution.astro';
---

<BaseLayout ...>
  <Nav />
  <main class="min-h-screen">
    <Hero />
    <ProblemSolution />
  </main>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ProblemSolution.astro site/src/pages/index.astro
git commit -m "feat: add ProblemSolution section with stats"
```

---

### Task 6: Build SDD Cycle diagram (How it works)

**Files:**
- Create: `site/src/components/SDDCycle.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create SDDCycle.astro**

```astro
---
const phases = [
  { step: '1', icon: '🏛️', label: 'Constitution', desc: 'Load project guardrails, stack, conventions.', color: 'text-accent-400', gate: false },
  { step: '2', icon: '📋', label: 'Specify', desc: 'Generate spec with acceptance criteria.', color: 'text-blue-400', gate: true, gateLabel: 'SPEC GATE' },
  { step: '3', icon: '🏗️', label: 'Design', desc: 'Architecture decisions, data flow, contracts.', color: 'text-purple-400', gate: true, gateLabel: 'DESIGN GATE' },
  { step: '4', icon: '📐', label: 'Plan', desc: 'Atomic steps per file, rollback strategy.', color: 'text-yellow-400', gate: true, gateLabel: 'PLAN GATE' },
  { step: '5', icon: '⚙️', label: 'Execute', desc: 'Implement each plan step, validate per pass.', color: 'text-green-400', gate: false },
  { step: '6', icon: '✅', label: 'Validate', desc: 'Code review against spec criteria.', color: 'text-emerald-400', gate: true, gateLabel: 'VALIDATE' },
  { step: '7', icon: '🪞', label: 'Reflect', desc: 'Auto-evaluation. Consolidate into knowledge base.', color: 'text-rose-400', gate: true, gateLabel: 'REFLECT GATE' },
];
---

<section id="how-it-works" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">The SDD Cycle</h2>
      <p class="mt-4 text-gray-400 max-w-2xl mx-auto">
        Seven phases. Five GATEs. One orchestrated flow by <strong class="text-gray-200">Samantha Agent</strong>.
      </p>
    </div>

    <!-- Desktop: horizontal flow -->
    <div class="hidden lg:block">
      <div class="relative flex items-start justify-between">
        <div class="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500/40 via-white/10 to-accent-500/40" />
        {phases.map((phase) => (
          <div class="relative flex flex-col items-center text-center" style="flex: 0 0 auto; width: 13%;">
            <div class="relative z-10 w-14 h-14 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 hover:border-accent-500/50 group cursor-default">
              <span>{phase.icon}</span>
            </div>
            <div class={`mt-3 text-xs font-semibold ${phase.color}`}>{phase.label}</div>
            <div class="mt-1 text-[10px] text-gray-500 leading-relaxed px-1">{phase.desc}</div>
            {phase.gate && (
              <div class="mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-gray-500">{phase.gateLabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>

    <!-- Mobile/tablet: vertical list -->
    <div class="lg:hidden space-y-4">
      {phases.map((phase) => (
        <div class="flex items-start gap-4 p-4 rounded-xl glass-card group hover:border-accent-500/20 transition-colors">
          <div class="flex-shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-lg">{phase.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class={`text-sm font-semibold ${phase.color}`}>{phase.label}</span>
              {phase.gate && <span class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-500">{phase.gateLabel}</span>}
            </div>
            <p class="mt-0.5 text-xs text-gray-500">{phase.desc}</p>
          </div>
          <div class="flex-shrink-0 text-xs text-gray-600 font-mono">{phase.step}/7</div>
        </div>
      ))}
    </div>

    <!-- Flow description -->
    <div class="mt-12 p-6 rounded-xl glass-card text-center">
      <div class="inline-flex items-center gap-2 text-sm font-mono text-gray-400">
        <span class="text-accent-400">CONSTITUTION</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span>SPECIFY</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span>DESIGN</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span>PLAN</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span>EXECUTE</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span>VALIDATE</span>
        <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        <span class="text-rose-400">REFLECT</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add SDDCycle to index.astro**

Add `<SDDCycle />` after `<ProblemSolution />`.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/SDDCycle.astro
git commit -m "feat: add SDD Cycle diagram component"
```

---

### Task 7: Build Features bento grid

**Files:**
- Create: `site/src/components/Features.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create Features.astro**

```astro
---
const features = [
  {
    icon: '🔒', title: '5 GATEs',
    description: 'SPEC, DESIGN, PLAN, VALIDATE, REFLECT — each phase requires explicit approval before proceeding. No code without spec.',
    highlight: 'Discipline forced, not optional',
    color: 'from-accent-500/20',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    icon: '⚡', title: 'FULL & LITE Modes',
    description: 'Auto-detects task complexity. LITE mode cuts 60% token cost for simple tasks.',
    highlight: '~15K vs ~1.5K tokens',
    color: 'from-blue-500/20',
    span: 'lg:col-span-1 lg:row-span-2',
  },
  {
    icon: '🧠', title: '5-Layer Memory',
    description: 'Working context → episodic sessions → semantic patterns → procedural skills → antipatterns.',
    highlight: 'Sessions don\'t start from zero',
    color: 'from-purple-500/20',
    span: '',
  },
  {
    icon: '🎯', title: 'Ponytail Philosophy',
    description: 'YAGNI integrated. Build what\'s needed, nothing more.',
    highlight: 'Minimal complexity, maximum impact',
    color: 'from-amber-500/20',
    span: '',
  },
  {
    icon: '🤖', title: 'Samantha Agent',
    description: 'AI orchestrator managing SDD transitions, detecting mode, invoking skills, verifying GATEs.',
    highlight: 'Your PM in the terminal',
    color: 'from-emerald-500/20',
    span: 'lg:col-span-2',
  },
  {
    icon: '📚', title: '10 Reference Guides',
    description: 'Bash, CI/CD, docs, git, project structure, testing, security, performance — baked in.',
    highlight: 'Production patterns, ready',
    color: 'from-rose-500/20',
    span: '',
  },
];
---

<section id="features" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">
        Everything you need to <span class="gradient-text">ship with confidence</span>
      </h2>
      <p class="mt-4 text-gray-400">53 tests. 14 skills. One orchestrated flow.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f) => (
        <div class={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${f.color} to-transparent p-6 group hover:border-accent-500/30 transition-all duration-300 ${f.span}`}>
          <div class="text-2xl mb-3">{f.icon}</div>
          <h3 class="text-lg font-semibold text-gray-100 mb-2">{f.title}</h3>
          <p class="text-sm text-gray-400 leading-relaxed mb-4">{f.description}</p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs font-mono text-accent-300">
            {f.highlight}
          </div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-accent-500/5 to-transparent pointer-events-none" />
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add Features to index.astro after SDDCycle**

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Features.astro
git commit -m "feat: add Features bento grid component"
```

---

### Task 8: Build Mode Comparison (FULL vs LITE)

**Files:**
- Create: `site/src/components/ModeComparison.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create ModeComparison.astro**

```astro
---
const modes = [
  {
    name: 'LITE', tagline: 'Quick tasks, no ceremony',
    tokens: '~1,500', badge: 'Tasks P (score 0-3)', icon: '⚡',
    color: 'text-green-400', borderColor: 'border-green-500/30', gradient: 'from-green-500/10',
    when: 'Documentation, config, simple fixes', limit: '10 turns',
    gates: false,
    flow: 'CLASSIFY:P → EXECUTE → REFLECT:1L',
    points: [
      'Spec inline, no file created',
      'Plan auto-generated, no GATE',
      'Reflect in 1 line',
      '~1,500 tokens per task',
    ],
  },
  {
    name: 'FULL', tagline: 'Full SDD discipline',
    tokens: '~15,000', badge: 'Tasks M/G/XG', icon: '🔒',
    color: 'text-accent-400', borderColor: 'border-accent-500/30', gradient: 'from-accent-500/10',
    when: 'Features, bugs, refactors, debug', limit: '20-60 turns (by effort)',
    gates: true,
    flow: 'CONSTITUTION → SPECIFY → DESIGN → PLAN → EXECUTE → VALIDATE → REFLECT',
    points: [
      'Full spec with acceptance criteria',
      '5 GATEs: SPEC, DESIGN, PLAN, VALIDATE, REFLECT',
      'Architecture design phase',
      '~15,000 tokens per task',
    ],
  },
];
---

<section id="modes" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">Two modes. <span class="gradient-text">One framework.</span></h2>
      <p class="mt-4 text-gray-400">SDD automatically detects task complexity and chooses the right mode.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6 lg:gap-8">
      {modes.map((mode) => (
        <div class={`relative overflow-hidden rounded-xl border ${mode.borderColor} bg-gradient-to-br ${mode.gradient} to-transparent p-6 sm:p-8`}>
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">{mode.icon}</span>
                <h3 class={`text-2xl font-bold ${mode.color}`}>{mode.name}</h3>
              </div>
              <p class="mt-1 text-sm text-gray-400">{mode.tagline}</p>
            </div>
            <div class="text-right">
              <div class={`text-2xl font-bold font-mono ${mode.color}`}>{mode.tokens}</div>
              <div class="text-[10px] text-gray-500 font-mono">per task</div>
            </div>
          </div>

          <div class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono ${mode.gates ? 'bg-accent-500/10 text-accent-300 border border-accent-500/20' : 'bg-green-500/10 text-green-300 border border-green-500/20'}`}>
            {mode.badge}
          </div>

          <div class="mt-6 space-y-3">
            {mode.points.map((point) => (
              <div class="flex items-start gap-2 text-sm">
                <svg class={`w-4 h-4 mt-0.5 flex-shrink-0 ${mode.gates ? 'text-accent-400' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-300">{point}</span>
              </div>
            ))}
          </div>

          <div class="mt-6 pt-6 border-t border-white/10">
            <div class="text-xs text-gray-500 mb-2 font-mono">Flow:</div>
            <div class="text-xs font-mono text-gray-400 leading-relaxed break-all">
              {mode.gates ? (
                <><span class="text-gray-500">CONSTITUTION</span> → <span class="text-gray-500">SPECIFY</span> → <span class="text-gray-500">DESIGN</span> → <span class="text-gray-500">PLAN</span> → <span class="text-gray-500">EXECUTE</span> → <span class="text-gray-500">VALIDATE</span> → <span class="text-rose-400">REFLECT</span></>
              ) : (
                <><span class="text-green-400">CLASSIFY:P</span> → EXECUTE → <span class="text-rose-400">REFLECT:1L</span></>
              )}
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4 text-center">
            <div><div class="text-xs text-gray-500">Effort</div><div class="text-sm font-mono text-gray-300">{mode.when}</div></div>
            <div><div class="text-xs text-gray-500">Max turns</div><div class="text-sm font-mono text-gray-300">{mode.limit}</div></div>
          </div>
        </div>
      ))}
    </div>

    <div class="mt-8 p-6 rounded-xl glass-card text-center">
      <div class="inline-flex items-center gap-2 text-sm text-gray-400">
        <span class="text-accent-400 font-semibold">-60%</span> tokens on LITE tasks
        <span class="text-gray-600">·</span>
        <span class="text-accent-400 font-semibold">-36%</span> average session savings
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add ModeComparison to index.astro after Features**

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ModeComparison.astro
git commit -m "feat: add FULL vs LITE mode comparison"
```

---

### Task 9: Build Installation section

**Files:**
- Create: `site/src/components/Installation.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create Installation.astro**

```astro
---
const installCmd = 'npm install -g spec-driven-agent';
const initCmd = 'npx sda init';
---

<section id="installation" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">
          Get started in <span class="gradient-text">two commands</span>
        </h2>
        <p class="mt-4 text-gray-400">Install globally via npm, then init in any Claude Code project.</p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Node >= 18
        </span>
        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Claude Code CLI
        </span>
        <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Linux, macOS, or Windows
        </span>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl border border-white/10 bg-[#0d0d10] overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <span class="text-xs text-gray-500 font-mono">npm</span>
            <button class="copy-btn text-xs text-gray-500 hover:text-gray-300 font-mono" data-copy={installCmd}>Copy</button>
          </div>
          <pre class="px-4 py-3 font-mono text-sm text-accent-300"><span class="text-gray-500">$ </span>{installCmd}</pre>
        </div>

        <div class="rounded-xl border border-white/10 bg-[#0d0d10] overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <span class="text-xs text-gray-500 font-mono">bash</span>
            <button class="copy-btn text-xs text-gray-500 hover:text-gray-300 font-mono" data-copy={initCmd}>Copy</button>
          </div>
          <pre class="px-4 py-3 font-mono text-sm text-accent-300"><span class="text-gray-500">$ </span>{initCmd}</pre>
        </div>
      </div>

      <div class="mt-10 p-6 rounded-xl glass-card border-green-500/20">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-sm font-semibold text-gray-200">Verify your installation</h4>
            <pre class="mt-2 font-mono text-xs text-gray-400 leading-relaxed">$ sda --version
5.1.6

$ sda status
✅ SDD Framework initialized</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      try { await navigator.clipboard.writeText(text); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('text-accent-400');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('text-accent-400'); }, 2000);
    });
  });
</script>
```

- [ ] **Step 2: Add Installation to index.astro after ModeComparison**

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Installation.astro
git commit -m "feat: add Installation section with copy buttons"
```

---

### Task 10: Build Commands table, CTA, and Footer

**Files:**
- Create: `site/src/components/Commands.astro`
- Create: `site/src/components/CTA.astro`
- Create: `site/src/components/Footer.astro`
- Assemble: `site/src/pages/index.astro` (final)

- [ ] **Step 1: Create Commands.astro**

```astro
---
const cliCommands = [
  { cmd: 'sda init', desc: 'Initialize the SDD framework in a project' },
  { cmd: 'sda update', desc: 'Update to the latest framework version' },
  { cmd: 'sda status', desc: 'Check installation status and version' },
  { cmd: 'sda metrics', desc: 'View token usage dashboard' },
  { cmd: 'sda --version', desc: 'Display installed version' },
];

const sddCommands = [
  { cmd: '/spec', phase: 'Specify', desc: 'Generate specification' },
  { cmd: '/design', phase: 'Design', desc: 'Architecture decisions' },
  { cmd: '/plan', phase: 'Plan', desc: 'Generate atomic plan' },
  { cmd: '/implement', phase: 'Execute', desc: 'Execute implementation' },
  { cmd: '/fix', phase: 'Execute', desc: 'Fix a bug' },
  { cmd: '/debug', phase: 'Execute', desc: 'Investigate root cause' },
  { cmd: '/refactor', phase: 'Execute', desc: 'Restructure code' },
  { cmd: '/review', phase: 'Validate', desc: 'Code review vs spec' },
  { cmd: '/reflect', phase: 'Reflect', desc: 'Auto-evaluation' },
  { cmd: '/learn', phase: 'Reflect', desc: 'Consolidate knowledge' },
  { cmd: '/context', phase: 'Constitution', desc: 'Map project / guardrails' },
  { cmd: '/socrates', phase: 'Constitution', desc: 'Collect missing context' },
  { cmd: '/status', phase: '—', desc: 'Current session state' },
  { cmd: '/estimate', phase: 'Specify', desc: 'Estimate task effort' },
];
---

<section id="commands" class="py-20 md:py-28">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">14 commands. <span class="gradient-text">One workflow.</span></h2>
      <p class="mt-4 text-gray-400">CLI for project setup + slash commands inside Claude Code.</p>
    </div>

    <div class="rounded-xl border border-white/10 overflow-hidden mb-8">
      <div class="px-4 py-3 bg-white/[0.02] border-b border-white/5">
        <h3 class="text-sm font-semibold text-gray-300 font-mono">CLI Commands</h3>
      </div>
      <div class="divide-y divide-white/5">
        {cliCommands.map((c) => (
          <div class="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <code class="flex-shrink-0 font-mono text-sm text-accent-400 w-32">{c.cmd}</code>
            <span class="text-sm text-gray-400">{c.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div class="rounded-xl border border-white/10 overflow-hidden">
      <div class="px-4 py-3 bg-white/[0.02] border-b border-white/5">
        <h3 class="text-sm font-semibold text-gray-300 font-mono">SDD Slash Commands (Claude Code)</h3>
      </div>
      <div class="divide-y divide-white/5">
        {sddCommands.map((c) => (
          <div class="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <code class="flex-shrink-0 font-mono text-sm text-accent-400 w-24">{c.cmd}</code>
            <span class="text-xs font-mono text-gray-500 w-24">{c.phase}</span>
            <span class="text-sm text-gray-400">{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create CTA.astro**

```astro
---
const githubUrl = 'https://github.com/meuphilim/spec-driven-agent';
const npmUrl = 'https://www.npmjs.com/package/spec-driven-agent';
const changelogUrl = githubUrl + '/blob/main/CHANGELOG.md';
---

<section class="py-20 md:py-28 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-b from-accent-500/10 via-transparent to-transparent pointer-events-none" />
  <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">
      Ready to ship with <span class="gradient-text">discipline?</span>
    </h2>
    <p class="mt-4 text-lg text-gray-400">Join developers using Spec-Driven Agent to bring engineering rigor to AI workflows.</p>
    <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href={npmUrl} target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-400 text-gray-950 font-semibold rounded-lg shadow-lg shadow-accent-500/25 hover:shadow-accent-400/40 transition-all">
        npm install -g spec-driven-agent
      </a>
      <a href={githubUrl} target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/30 text-gray-300 hover:text-white rounded-lg transition-colors">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        View on GitHub
      </a>
    </div>
    <div class="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
      <a href={changelogUrl} target="_blank" class="hover:text-gray-300 transition-colors">Changelog</a>
      <span class="text-gray-700">·</span>
      <a href={githubUrl + '/blob/main/CONTRIBUTING.md'} target="_blank" class="hover:text-gray-300 transition-colors">Contributing</a>
      <span class="text-gray-700">·</span>
      <a href={githubUrl + '/blob/main/SECURITY.md'} target="_blank" class="hover:text-gray-300 transition-colors">Security</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create Footer.astro**

```astro
---
const githubUrl = 'https://github.com/meuphilim/spec-driven-agent';
const npmUrl = 'https://www.npmjs.com/package/spec-driven-agent';
---

<footer class="border-t border-white/10 py-12">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-4 gap-8">
      <div class="md:col-span-2">
        <a href="#" class="flex items-center gap-2">
          <span class="text-accent-400 text-lg font-bold font-mono">&gt;_</span>
          <span class="font-semibold text-gray-100">spec-driven-agent</span>
        </a>
        <p class="mt-3 text-sm text-gray-500 max-w-sm leading-relaxed">
          Spec-Driven Development framework for Claude Code. Enforce discipline, reduce token waste, learn continuously.
        </p>
        <div class="mt-4 flex items-center gap-3">
          <a href={githubUrl} target="_blank" class="text-gray-500 hover:text-gray-300 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href={npmUrl} target="_blank" class="text-gray-500 hover:text-gray-300 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </a>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-gray-300 mb-4">Product</h4>
        <ul class="space-y-2">
          <li><a href="#features" class="text-sm text-gray-500 hover:text-gray-300">Features</a></li>
          <li><a href="#how-it-works" class="text-sm text-gray-500 hover:text-gray-300">How it works</a></li>
          <li><a href="#installation" class="text-sm text-gray-500 hover:text-gray-300">Installation</a></li>
          <li><a href={npmUrl} target="_blank" class="text-sm text-gray-500 hover:text-gray-300">npm</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-gray-300 mb-4">Resources</h4>
        <ul class="space-y-2">
          <li><a href={githubUrl} target="_blank" class="text-sm text-gray-500 hover:text-gray-300">GitHub</a></li>
          <li><a href={githubUrl + '/blob/main/CHANGELOG.md'} target="_blank" class="text-sm text-gray-500 hover:text-gray-300">Changelog</a></li>
          <li><a href={githubUrl + '/blob/main/CONTRIBUTING.md'} target="_blank" class="text-sm text-gray-500 hover:text-gray-300">Contributing</a></li>
          <li><a href={githubUrl + '/blob/main/LICENSE'} target="_blank" class="text-sm text-gray-500 hover:text-gray-300">License</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-xs text-gray-600">MIT License &copy; 2026 <a href="https://github.com/meuphilim" target="_blank" class="hover:text-gray-400">Meuphilim</a></p>
      <div class="flex items-center gap-4 text-xs text-gray-600">
        <span>v5.1.6</span>
        <span class="w-1 h-1 rounded-full bg-gray-700" />
        <span>53 tests</span>
        <span class="w-1 h-1 rounded-full bg-gray-700" />
        <span>MIT</span>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Assemble final index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ProblemSolution from '../components/ProblemSolution.astro';
import SDDCycle from '../components/SDDCycle.astro';
import Features from '../components/Features.astro';
import ModeComparison from '../components/ModeComparison.astro';
import Installation from '../components/Installation.astro';
import Commands from '../components/Commands.astro';
import CTA from '../components/CTA.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="Spec-Driven Agent — Development Framework for Claude Code"
  description="SDD framework enforces disciplined development via GATEs (SPEC, DESIGN, PLAN, VALIDATE, REFLECT). Built for Claude Code. 53 tests. MIT license."
>
  <Nav />
  <main class="min-h-screen">
    <Hero />
    <ProblemSolution />
    <SDDCycle />
    <Features />
    <ModeComparison />
    <Installation />
    <Commands />
    <CTA />
    <Footer />
  </main>
</BaseLayout>
```

- [ ] **Step 5: Build and verify**

Run: `cd site && npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add site/src/components/Commands.astro site/src/components/CTA.astro site/src/components/Footer.astro site/src/pages/index.astro
git commit -m "feat: add Commands, CTA, Footer and assemble final page"
```

---

### Task 11: Create SEO assets (robots.txt, favicon, OG image)

**Files:**
- Create: `site/src/pages/robots.txt.ts`
- Create: `site/public/favicon.svg`
- Create: `site/public/og-image.svg`

- [ ] **Step 1: Create robots.txt.ts**

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${sitemapURL.href}\n\n# Disallow private paths\nDisallow: /dist/\nDisallow: /node_modules/\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
```

- [ ] **Step 2: Create favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <text x="16" y="22" font-family="monospace" font-size="18" font-weight="bold" fill="#84cc16" text-anchor="middle">&gt;_</text>
</svg>
```

- [ ] **Step 3: Create OG image**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <text x="60" y="240" font-family="monospace" font-size="64" font-weight="bold" fill="#84cc16">&gt;_ spec-driven-agent</text>
  <text x="60" y="320" font-family="sans-serif" font-size="36" fill="#e5e7eb">SDD Framework for Claude Code</text>
  <text x="60" y="380" font-family="sans-serif" font-size="24" fill="#9ca3af">5 GATEs · 2 modes · 53 tests · MIT</text>
  <text x="60" y="520" font-family="sans-serif" font-size="18" fill="#6b7280">github.com/meuphilim/spec-driven-agent</text>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add site/src/pages/robots.txt.ts site/public/favicon.svg site/public/og-image.svg
git commit -m "feat: add SEO assets — robots.txt, favicon, OG image"
```

---

### Task 12: Create GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/site.yml`
- Create: `site/README.md`
- Modify: `.gitignore` (root)

- [ ] **Step 1: Create .github/workflows/site.yml**

```yaml
name: Deploy Landing Page

on:
  push:
    branches: [main, master]
    paths:
      - 'site/**'
  workflow_dispatch:

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    name: Build landing page
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: site
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create site/README.md**

```markdown
# Landing Page — Spec-Driven Agent

Landing page for the [Spec-Driven Agent](https://github.com/meuphilim/spec-driven-agent) framework.

## Quick Start

```bash
cd site
npm install
npm run dev        # http://localhost:4321
npm run build      # → site/dist/
npm run preview    # preview production build
```

## Configuration

Configured for GitHub Pages at `https://meuphilim.github.io/spec-driven-agent/`.

Change base path via `astro.config.mjs`:
```js
const base = '/your-custom-path/';
```
Or env var: `BASE_PATH=/your-path/ npm run build`

## Deploy

Automatic via GitHub Actions on pushes modifying `site/**`. Manual trigger: Actions → "Deploy Landing Page" → "Run workflow".

## License

MIT
```

- [ ] **Step 3: Update root .gitignore**

Add these lines to the root `.gitignore`:
```gitignore
# Landing page (site/)
site/node_modules/
site/dist/
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/site.yml site/README.md .gitignore
git commit -m "feat: add GitHub Actions deploy workflow and site README"
```

---

### Task 13: Final build verification

**Files:** None — verification only

- [ ] **Step 1: Full build**

Run: `cd site && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Verify output**

Run: `ls site/dist/`
Expected: `index.html`, `robots.txt`, `sitemap-index.xml`, `og-image.svg`, `favicon.svg`

- [ ] **Step 3: Verify no root leaks**

Run: `ls node_modules/ 2>/dev/null && echo "LEAK" || echo "OK"`
Expected: `OK` (root has no node_modules)

- [ ] **Step 4: Verify existing workflows untouched**

Run: `git diff HEAD -- .github/workflows/ci.yml .github/workflows/release.yml`
Expected: No output

- [ ] **Step 5: Quick content check**

Run: `grep -c 'Spec-Driven Agent' site/dist/index.html`
Expected: ≥ 1

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final build verification"
```
