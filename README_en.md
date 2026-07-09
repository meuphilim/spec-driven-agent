# Spec-Driven Development Framework (SDD)

> 🌐 Leia esta documentação em [Português](README.md).

> **Version:** 5.2.1 | **Status:** Production Ready | **Last update:** 2026-07-09
>
> **Orchestrator:** [Samantha Agent](CLAUDE_en.md) — manages the full SDD cycle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-5.2.1-blue.svg)](https://github.com/meuphilim/spec-driven-agent)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-87%2F87-brightgreen.svg)](https://github.com/meuphilim/spec-driven-agent)

---

## Overview

The **Spec-Driven Development Framework (SDD)** implements the complete specification-driven development cycle, orchestrated by the **Samantha** agent:
`Constitution → Specify → Design → Plan → Execute → Validate → Reflect`.

### Why use it?

- **Forced discipline** — GATEs prevent skipping critical phases
- **Continuous learning** — knowledge base evolves with every session
- **Execution control** — monitoring turns and costs
- **Efficiency** — Lite Mode reduces up to 60% of tokens in simple tasks
- **Reproducible** — identical workflow for any task
- **Samantha Agent** — SDD Orchestrator, manages transitions between phases
- **Architect Agent** — Sonnet subagent for Design/Plan/Review (model escalation)
- **15 Skills** — 14 skills + 1 orchestrator agent
- **6 ADRs** — Architecture Decision Records documented
- **Ponytail** — integrated YAGNI philosophy
- **87 Tests** — automated coverage (24 integration + 15 events + 11 dashboard + 26 unit + 8 LITE)

---

## Core Concepts

### Two Modes of Operation

| Mode | When | Flow | Tokens |
|---|---|---|---|
| **FULL** | M/L/XL Tasks | Full SDD with GATEs | ~15,000 |
| **LITE** | S Tasks (simple) | Compact, without GATEs | ~1,500 |

**Auto-detection:** Effort `low` = LITE mode

### LITE Mode

```
🎯 CLASSIFY:P → EXECUTE → 📝 REFLECT:1L
```

- Inline spec (does not create file)
- Automatic plan (no GATE)
- Reflect: 1 line

### FULL Mode — SDD

```
CONSTITUTION → SPECIFY → DESIGN → PLAN → EXECUTE → VALIDATE → REFLECT
```

### GATEs (FULL Mode — SDD)

| GATE | Phase | Trigger | What it blocks |
|------|------|---------|--------------|
| **SPEC GATE** | Specify | "approved" | Code without approved spec |
| **DESIGN GATE** | Design | "design ok" | Plan without approved design |
| **PLAN GATE** | Plan | "confirm" | Code without confirmed plan |
| **VALIDATE** | Validate | automatic | Merge without verifying spec |
| **REFLECT GATE** | Reflect | automatic | Task without reflection |

### Effort Level

| Effort | When | Max Turns | Mode |
|--------|--------|-----------|------|
| `low` | Documentation, simple tasks | 10 | **LITE** |
| `medium` | Configuration, routines | 20 | FULL |
| `high` | Implementation, fixes | 40 | FULL |
| `xhigh` | Debug, investigation | 60 | FULL |

---

## Installation

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js >= 18.0.0

### npm (Recommended)

```bash
npm install -g spec-driven-agent
npx sda init
```

### Local CLI

```bash
npm install
node cli/bin/cli.js init /path/to/project
```

---

## Commands

### CLI

| Command | Function |
|---------|--------|
| `sda init` | Initialize framework |
| `sda update` | Update framework |
| `sda status` | View installation status |
| `sda dashboard` | Metrics dashboard (live, summary, json, build) |
| `sda metrics` | Alias for `sda dashboard --summary` |
| `sda --version` | View version |

### Framework (Claude Code) — SDD Cycle

| Command | SDD Phase | Function |
|---------|----------|--------|
| `/context` | Constitution | Map project + feed guardrails |
| `/spec` | Specify | Create specification |
| `/design` | Design | Architectural decisions |
| `/plan` | Plan | Generate atomic plan |
| `/implement` | Execute | Execute implementation |
| `/fix` | Execute | Fix bug |
| `/debug` | Execute | Investigate issue |
| `/refactor` | Execute | Restructure code |
| `/review` | Validate | Code review + validation against spec |
| `/status` | — | View current state |
| `/reflect` | Reflect | Self-assessment |
| `/learn` | Reflect | Consolidate knowledge |
| `/socrates` | Constitution | Collect missing context |

---

## Reference Guides (10)

| Guide | When to use |
|------|-------------|
| `bash-best-practices.md` | Bash scripting, error handling |
| `ci-cd-patterns.md` | GitHub Actions, Turborepo, caching |
| `documentation-templates.md` | README, ADRs, CHANGELOG |
| `git-workflows.md` | Conventional Commits, branch strategy |
| `project-structure.md` | Monorepo layouts, conventions |
| `testing-patterns.md` | TDD, mocking, coverage |
| `security-best-practices.md` | OWASP, auth, validation |
| `performance-optimization.md` | Caching, bundle, Core Web Vitals |

---

## Validation

### Validation Protocol (v5.1+)

The framework includes a complete protocol to validate:

1. **LITE Mode** — 10 S tasks with metrics collection
2. **Knowledge Base** — 5 sessions with consolidation

See `VALIDATION-PROTOCOL_en.md` for details.

### Automated Tests

```bash
node cli/test.js                          # 24 integration tests
node cli/lib/__tests__/dashboard.test.js  # 11 dashboard tests
node cli/lib/__tests__/events.test.js     # 18 events module tests
node cli/test-unit.js                     # 26 unit tests (sanitizePath)
node cli/test-lite.js                     # 8 LITE mode tests
```

**Total: 87 tests — all passing ✅**

---

## Security

| Measure | Status |
|---|---|
| Shell injection fix | ✅ execFileSync |
| Path sanitization | ✅ Blocklist + `path.resolve` + 26 tests |
| JSON injection (hooks) | ✅ `json_build()` with `jq --arg` — 12 calls, 7 hooks |
| Cross-platform | ✅ `mktemp_safe` + `find_jq` + CRLF-safe |
| SECURITY.md | ✅ Policy defined |
| CODE_OF_CONDUCT.md | ✅ Contributor Covenant |

---

## Token Economy

| Scenario | Before | After | Savings |
|---|---|---|---|
| S Task | 3,000 | 1,200 | **-60%** |
| M Task | 15,000 | 10,500 | **-30%** |
| Session (5 tasks) | 75,000 | 48,000 | **-36%** |

---

## Roadmap

### v5.1 (Legacy) ✅

- [x] Lite Mode (-60% tokens)
- [x] Few-shot examples
- [x] Conditional Knowledge loading
- [x] Lightweight observability
- [x] 8 reference guides
- [x] Ponytail integration
- [x] Automatic npm publish
- [x] 53 automated tests (19 int + 8 LITE + 26 unit)
- [x] SECURITY.md + CODE_OF_CONDUCT.md
- [x] Validation protocol
- [x] Session templates

### v5.2 (Current) ✅

- [x] Metrics dashboard (JSONL, snapshots, TUI live)
- [x] Append-only event store (`events-YYYY-MM-DD.jsonl`)
- [x] Real subagent token tracking via PostToolUse
- [x] 6 hooks rewritten in Node.js (post-tool, post-task, pre-tool, init-session, stop, check-gate)
- [x] Safe JSON in hooks (`json_build()` with `jq --arg`)
- [x] Per-mode economy LITE vs FULL (tagEventsWithMode)
- [x] Auto compaction (90d + monthly snapshot)
- [x] Architect Agent (Sonnet model escalation)
- [x] 6 documented ADRs
- [x] 87 automated tests (24 int + 15 events + 11 dash + 26 unit + 8 LITE)

### v5.3 (Planned)

- [ ] Web-based visual metrics dashboard
- [ ] Multi-model LLM support
- [ ] Plugin system for custom skills

---

## Credits

See [CREDITS_en.md](CREDITS_en.md) for detailed attributions of skills, conceptual inspirations (YAGNI, KISS), and third-party tools.

---

## Contributing

See [CONTRIBUTING_en.md](CONTRIBUTING_en.md) for a complete guide.

---

## License

MIT License. See [LICENSE](LICENSE).

Copyright (c) 2026 Meuphilim

---

## Contact

- **Author:** Meuphilim
- **GitHub:** [@meuphilim](https://github.com/meuphilim)
- **Issues:** [GitHub Issues](https://github.com/meuphilim/spec-driven-agent/issues)
