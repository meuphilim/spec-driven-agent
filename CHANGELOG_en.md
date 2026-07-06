# Changelog

> 🌐 Leia esta documentação em [Português](CHANGELOG.md).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.2.0] - 2026-07-05

### Added

- **Real-time metrics dashboard** — `sda dashboard` with 4 subcommands:
  - `live` — TUI using native readline (zero deps), polling state.json + snapshots
  - `summary` — Aggregated text summary (LITE/FULL, tokens, skills, gates)
  - `json` — Pure JSON output (pipe-friendly)
  - `build` — Rebuilds snapshots from scratch
- **Append-only event store** — `events-YYYY-MM-DD.jsonl` replaces `metrics.json`
- **6 rewritten hooks** — post-tool, post-task, pre-tool, init-session, stop, check-gate
- **Real token tracking** — extracts `tool_response.usage` from subagents via PostToolUse
- **Automatic compaction** — `events-compact.sh`: 90-day rotation + monthly snapshot
- **`json_build()` in `_utils.sh`** — secure function to build JSON via `jq --arg`
- **`tasksByMode`** — tracking of LITE vs FULL tasks in snapshots

### Fixed

- **JSON escaping in hooks** — `event_logger` now uses `jq --arg` instead of string interpolation. Commands containing quotes (e.g., `git commit -m "msg"`, `grep "pattern"`) no longer break JSONL. Fixes silent event loss.
- **Modewise economy breakdown** — `calculateEconomy()` tracks the active mode chronologically via `tagEventsWithMode()`. Separates LITE and FULL tokens into distinct pools.
- **Stale snapshot detection** — `isSnapshotFresh()` detects if JSONL is newer than the snapshot, triggering auto-rebuild on read.
- **Fixed locale** — `toLocaleString('pt-BR')` enforced on all displays (consistent testing across any Node environment).
- **TUI without delay** — `renderLive()` is called immediately without waiting for the first 1s tick of `setInterval`.
- **Silent parse error** — `readJsonlFile` previously discarded malformed lines without reporting. Now tracked in `parse_errors`.

### Changed

- **`event_logger` API** — new syntax `event_logger key="string" num=42@ raw='{"a":1}@'`
  - `@` suffix → RAW value (numbers, booleans, null, objects)
  - without `@` → string automatically escaped by `jq --arg`
- **`sda metrics`** — now an alias for `sda dashboard --summary` (backward compatibility preserved)
- **50 tests** — 24 integration + 15 event unit + 11 dashboard unit tests

### Performance

- **Append-only JSONL** — eliminates file rewrites on every event.
- **Snapshot cache** — optimized read path without reprocessing JSONL on every command.
- **Hybrid token tracking** — precise tracking for subagents via PostToolUse, generic tools report "unavailable" (never estimated).

---

## [5.1.7] - 2026-07-05

### Added

- **Official landing page** — Astro 5 + Tailwind CSS 4 site with 10 sections, dual-theme, animated terminal hero.
- **Vercel deploy** — `vercel.json` with environment auto-detection, zero-config deploy.
- **GitHub Pages deploy** — `site.yml` workflow for automated build + publish.
- **SDD Alignment** — Samantha as orchestrator, 7 phases (Constitution → Reflect), 5 GATEs.
- **`design.md` skill** — architecture, data flow, contracts, DESIGN GATE.
- **`review.md` skill** — automated code review with verification against spec.
- **`CREDITS.md`** — official attributions for skills, concepts, and tools.
- **Full SEO** — OG tags, Twitter cards, sitemap.xml, robots.txt, canonical URL.

### Fixed

- **Vercel build** — fixed `exit 127` (incorrect site path) and invalid `rootDirectory` schema.
- **SVG rendering** — fixed missing keyframes and blink animation in Tailwind v4.
- **`.gitignore`** — added backup and site build directories.

### Changed

- **CLAUDE.md** — aligned to the full SDD flow with Samantha as the orchestrator.
- **README.md** — updated badges and added website documentation.

### Performance / Token Optimization

- **Ponytail skill** — compressed from 117 to 52 lines (−70% tokens per invocation).
- **Samantha agent** — compacted from 379 to 67 lines (−75% tokens per session as primary agent).
- **Extracted checklists** — `samantha-audit-checklists.md` (+79 lines on-demand).
- **Extracted patterns** — `samantha-patterns.md` (+63 lines on-demand).
- **On-demand examples** — `examples.md` extracted to reference without a fixed token cost.

---

## [5.1.6] - 2026-07-04

### Added

- **Unit tests** — 26 tests for `sanitizePath` in `cli/test-unit.js` (53 total).
- **Cross-platform `mktemp_safe()`** — Node.js fallback for Windows environments lacking `mktemp`.
- **Matrix CI** — Node 18/20/22 × Ubuntu/Windows (6 jobs) + LITE mode tests.
- **`cli/lib/sanitize.js`** — shared module extracted for isolated unit testing.

### Fixed

- **Paths `@skills/`** → `@.claude/sda/skills/` in 9+ files (35 fixes).
- **`sanitizePath()`** — expanded blocklist from 9 to 17 metacharacters + `path.resolve` validation.
- **All hooks** — migrated from `$(mktemp)` to `mktemp_safe()`.
- **`release.yml`** — updated `softprops/action-gh-release@v1` to `@v2`.

### Changed

- **README.md** — updated badges, test count (53), and cross-platform compatibility table.
- **CI workflow** — split into separate `lint` (validation) and `test` (matrix) jobs.

### Performance / Token Optimization

- **Ponytail skill** — compressed from 117 to 52 lines (−70% tokens per invocation).
- **Samantha agent** — compacted from 379 to 67 lines (−75% tokens per session as primary agent).
- **Extracted checklists** — created `samantha-audit-checklists.md` (+3.8KB on-demand).
- **Extracted patterns** — created `samantha-patterns.md` (+1.2KB on-demand).
- **Shared examples** — created `examples.md` (4.4KB on-demand); spec.md, plan.md, and reflect.md extracted (−2.5KB each).
- **Skills & references** — expanded from 13 to 14 skills (+1) and 8 to 10 references (+2).

---

## [5.1.4] - 2026-07-01

### Fixed

- **prepublishOnly** — reverted to cross-platform `node -e` command (compatible with Windows).
- **Version** — aligned to 5.1.4 (avoids naming conflict with existing 5.1.0 on npm).

### Changed

- **cli/bin/cli.js** — `makeScriptsExecutable()` now uses `fs.chmodSync` (anti-shell injection).
- **package.json (root)** — marked `private: true`, renamed workspace package to `spec-driven-agent-workspace`.
- **.gitignore** — excluded `cli/README.md` and `cli/LICENSE` (generated dynamically by prepublishOnly).
- **cli/package.json** — added `LICENSE` explicitly to the npm package `files` field.

---

## [5.1.3] - 2026-07-01

### Fixed

- **JSON injection** — `init-session.sh` fallback now uses `node -e` instead of heredoc with interpolation.
- **bin paths** — validated `./` prefix for npm publishing.
- **prepublishOnly** — cross-platform script via `node -e` (Windows/Unix compatible).

### Added

- **Matrix CI** — tests on Node 18/20/22 × Ubuntu/Windows (6 jobs).
- **Expanded tests** — increased test suite from 17 to 25 tests:
  - sanitizePath: semicolon, pipe, and backtick injection guards
  - bin paths validation
  - update command backup verification
  - index.js exports validation

### Changed

- **ci.yml** — restructured into validate and test matrix jobs.

---

## [5.1.0] - 2026-06-28

### Added

- **LITE tests** — 8 automated tests for LITE mode (`test-lite.js`):
  - CLAUDE.md contains the LITE definition
  - Dual-mode operation table exists
  - Status skill features LITE formatting
  - Context skill checks conditional loading
  - Reflect skill includes compact layout
  - Init creates complete directory structure
  - Version consistency verified across files
  - Ponytail integrated
- **Validation Protocol** — comprehensive protocol to validate LITE Mode and the Knowledge Base:
  - 10 S tasks with metrics collection
  - 5 KB sessions with consolidation
  - Standardized logging templates
  - Results analysis and reporting
- **Session Template** — template for collecting metrics during validation sessions.

### Changed

- **reflect.md** — added support for LITE Mode (1-line compact format).
- **README.md** — updated for v5.1.0 release with badges and complete documentation.

---

## [5.0.0] - 2026-06-28

### Added

- **Lite Mode** — optimized flow for S tasks (−60% tokens):
  - CLASSIFY:P → EXECUTE → REFLECT:1L
  - No formal GATEs, inline spec
  - Auto-detection: low effort = LITE mode
- **Few-shot examples** — complete examples included in spec.md, plan.md, and reflect.md.
- **Conditional Knowledge loading** — loaded only if content is ≥5 lines.
- **Lightweight observability** — metrics in `/status` + overhead alerting.
- **Ponytail integration** — YAGNI (lazy senior dev) philosophy.
- **SECURITY.md** — vulnerability disclosure policy.
- **CODE_OF_CONDUCT.md** — contributor code of conduct.

### Changed

- **CLAUDE.md** — compressed: hooks (reduced from 30 to 8 lines) and restrictions (reduced from 10 to 8 items).
- **Node.js** — updated engine requirement from >=14 to >=18.
- **README** — rewritten focusing on LITE/FULL modes.
- **Status skill** — LITE mode: 1 line · FULL mode: comprehensive.

### Fixed

- **Version mismatch** — CLI reads from package.json (single source of truth).
- **save-session.sh path** — corrected `.sessions` to `sessions`.
- **CI paths** — corrected `skills/*.md` matching pattern.
- **sanitizePath** — added character blocklist.
- **isInstalled()** — checks `.claude/sda/skills/` instead of `skills/`.

### Removed

- **collect-metrics.sh** — consolidated directly into `post-task.sh`.
- **update-turn.sh** — dead code cleanup.
- **Duplicate skills/hooks/knowledge** — removed ~3,500 lines of redundant files.

---

## [4.4.0] - 2026-06-26

### Added

- **Metrics Dashboard** — `sda metrics` command providing visualization of:
  - Total tasks and success rate
  - Top used skills (bar chart)
  - Daily usage (last 7 days)
  - GATE execution statistics
- **collect-metrics.sh** — hook for automatic metrics collection.
- **Ponytail Plugin** — YAGNI (lazy senior dev) integration.

### Changed

- Removed ~3,500 lines of duplication (skills, hooks, knowledge).
- Simplified hooks using shared `_utils.sh`.
- `status.md` now filters specs by status rather than loading everything.

### Fixed

- JSON injection in `init-session.sh` (resolved using jq).
- Shell injection in `cli.js` (resolved using execFileSync).
- Path inconsistency between skills and CLAUDE.md.
- `update()` crash on partial installations (resolved with existsSync guards).
- Invalid model designation in `Samantha.md`.

---

## [4.3.0] - 2026-06-26

### Added

- **Automated npm publish** — Release workflow publishes to npm on tag creation.
- **3 new Reference Guides:**
  - `testing-patterns.md` — testing pyramid, TDD, mocking, coverage
  - `security-best-practices.md` — OWASP, authentication, validation, secrets
  - `performance-optimization.md` — caching, bundling, database, Core Web Vitals
- **publishConfig** — public access configuration for npm publishing.

### Changed

- **cli/package.json** — version bumped to 4.3.0, added publishConfig.
- **README.md** — 8 reference guides documented.

---

## [4.2.0] - 2026-06-25

### Added

- **Samantha Agent** — agent specialized in productivity, workflows, automation, and documentation.
- **References/** — 5 reference guides for best practices:
  - `bash-best-practices.md` — strict mode, error handling, cross-platform
  - `ci-cd-patterns.md` — GitHub Actions, Turborepo, caching, matrix builds
  - `documentation-templates.md` — README, ADRs, CHANGELOG, PR templates
  - `git-workflows.md` — Conventional Commits, branch strategy, hooks
  - `project-structure.md` — monorepo layouts, folder conventions

### Changed

- **CLI init** — automatically copies `agents/` and `skills/references/`.
- **CLI update** — updates `agents/` and `skills/references/` alongside skills.
- **CLI status** — displays `agents/` in the status checklist.
- **README.md** — updated directory structure showing the new components.

---

## [4.0.0] - 2026-06-22

### Added

- **Effort Level** — adaptive depth based on task type (low/medium/high/xhigh/max).
- **Validation Hooks** — pre-tool, post-tool, pre-execute, post-task, stop.
- **Turn Monitoring** — turn limits based on effort level (10/20/40/60).
- **Message Pattern** — standardized messaging layout for Init/Turn/Result/Block.
- **Subagents** — protocol for long research, parallel analysis, and isolated tasks.
- **Socrates Gate** — mechanism to gather missing context via structured inquiries.
- **Mandatory GATEs** — SPEC GATE, PLAN GATE, REFLECT GATE.

### Changed

- **CLAUDE.md** — updated to reflect Agent Loop (v4.0) features.
- **estimate.md** — integrated effort levels into the complexity scoring.
- **implement.md** — added turn limits monitoring during execution.
- **All skills** — optimized for reduced token consumption.

### Fixed

- **GAP 1** — `/context` now records findings in `.sessions/`.
- **GAP 5** — `/reflect` always checks for consolidation via `/learn`.
- **GAP 6** — `/learn` now verifies evidence automatically.

---

## [3.1.0] - 2026-06-22

### Added

- **SPEC GATE** — blocks work until a spec is approved.
- **PLAN GATE** — blocks code generation until a plan is confirmed.
- **REFLECT GATE** — forces self-reflection before concluding a task.
- **Violation restrictions** — `⛔ VIOLAÇÃO` warning for skipped steps.

### Changed

- **CLAUDE.md** — simplified from 276 to 138 lines (−50%).
- **All skills** — compacted using `·` as a separator.

---

## [3.0.0] - 2026-06-22

### Added

- **Token optimization** — 48% reduction in skills (from 1270 to 662 lines).
- **Compact layout** — condensed tables and inline templates.
- **Redundancy consolidation** — removed duplicate instructions.

---

## [2.0.0] - 2026-06-22

### Added

- **Socrates Gate** — context gathering via guided questions.
- **Integration fixes** — context, reflect, and learn properly synced.
- **Knowledge base seeding** — populated 3 patterns, 1 heuristic, and 1 anti-pattern.

### Fixed

- **GAP 1** — `/context` populates `.sessions/`.
- **GAP 5** — `/reflect` triggers `/learn` automatically.
- **GAP 6** — `/learn` verifies evidence before consolidating.

---

## [1.0.0] - 2026-06-21

### Added

- **Base framework** — 12 initial skills.
- **CLAUDE.md** — orchestrator with mandatory execution flow.
- **Knowledge base** — folder structure for patterns, heuristics, and anti-patterns.
- **Sessions** — execution logs history.
- **Skills**: context, spec, estimate, plan, implement, fix, debug, refactor, review, status, reflect, learn.
