# Contributing to Spec-Driven Development (SDD)

> 🌐 Leia esta documentação em [Português](CONTRIBUTING.md).

Thank you for considering contributing! This document outlines how to participate in the development of this framework.

---

## General Guidelines

### Code of Conduct

See [CODE_OF_CONDUCT_en.md](CODE_OF_CONDUCT_en.md) for details.

In short:
- Be respectful and professional
- Focus on what is best for the community
- Accept constructive criticism gracefully

### Security

See [SECURITY_en.md](SECURITY_en.md) to report vulnerabilities.

### Contribution Principles

1. **Follow the framework flow** — use the framework itself to develop
2. **Specify before implementing** — every change starts with a spec
3. **Test your changes** — validate in at least 1 real project
4. **Document** — update README, CHANGELOG, and impacted skills

---

## Contribution Flow

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/spec-driven-agent.git
cd spec-driven-agent
```

### 2. Create a Branch

```bash
git checkout -b feat/feature-name
# or
git checkout -b fix/fix-name
# or
git checkout -b docs/documentation-update
```

### 3. Follow the Framework

For any significant change:

```
1. /context    → Map what is being modified
2. /spec       → Create specification of the change
3. /design     → Architectural decisions
4. /plan       → Generate execution plan
5. /implement  → Execute changes
6. /review     → Review code + validate against spec
7. /reflect    → Self-assessment
8. /learn      → Consolidate learnings
```

### 4. Commit

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(spec): add validation for mandatory fields

- Added validation to the spec template
- "Context" field is now mandatory
- Acceptance criteria must be verifiable

Refs: #12
```

### 5. Push and PR

```bash
git push origin feat/feature-name
```

Create a Pull Request with:
- Descriptive title
- Description of what was changed and why
- Reference to issues (if applicable)
- Screenshots (if visual changes)

---

## Types of Contributions

### 🐛 Bug Fixes

- Report the bug first (Issue)
- Create a fix spec before correcting it
- Include tests if possible

### ✨ Features

- Open an Issue discussing the feature
- Create a complete spec before implementing
- Break it into smaller PRs if it's large

### 📚 Documentation

- Spelling/grammar corrections
- Additional practical examples
- Clarifications in confusing sections

### 🧪 Tests

- Tests for existing skills
- Documented use cases
- Identified edge cases

---

## Structure of a Skill

When creating or modifying a skill, follow the pattern:

```markdown
# SKILL: name.md
> `/command` · when to activate

## WHEN TO EXECUTE
[list of triggers]

---

## PROTOCOL
### 1. [Step]
[description]

---

## REPORT
[output format]

---

## RULES
- [rule 1]
- [rule 2]
```

---

## Structure of a Spec

```markdown
# SPEC: feature-name

**Date:** YYYY-MM-DD
**Type:** FEAT|FIX|REFACTOR|INFRA|DOCS
**Status:** DRAFT|APPROVED|CANCELLED

## Context
[why it exists]

## Objective
[what should be true when completed]

## Scope
### Includes
- [what goes in]
### Excludes
- [what does NOT go in]

## Acceptance Criteria
- [ ] [verifiable criterion]

## Risks
[what can go wrong]
```

---

## Issues

### Bug Report Template

```markdown
**Bug description**
[clear description]

**Steps to reproduce**
1. ...
2. ...

**Expected behavior**
[what should happen]

**Actual behavior**
[what happens]

**Environment**
- OS: [Windows/Mac/Linux]
- Claude Code: [version]
- Framework: [version]
```

### Feature Request Template

```markdown
**Description**
[feature description]

**Problem it solves**
[what problem the user faces]

**Proposed solution**
[how it would solve it]

**Alternatives considered**
[other options evaluated]

**Additional context**
[additional context]
```

---

## Pull Requests

### Checklist

- [ ] Branch created from `main`
- [ ] Commits follow Conventional Commits
- [ ] Spec created (if significant change)
- [ ] Impacted skills were updated
- [ ] README updated (if necessary)
- [ ] CHANGELOG updated
- [ ] Manual tests performed
- [ ] Code review completed

### Template

```markdown
## Description
[description of changes]

## Type of change
- [ ] 🐛 Bug fix
- [ ] ✨ Feature
- [ ] 📚 Documentation
- [ ] 🧪 Tests
- [ ] 🔧 Refactor

## Checklist
- [ ] Spec created and approved
- [ ] Skills updated
- [ ] README/CHANGELOG updated
- [ ] Tests performed

## Related issues
Closes #XX
```

---

## Questions?

Open a [Discussion](https://github.com/meuphilim/spec-driven-agent/discussions) for general questions or ideas.
