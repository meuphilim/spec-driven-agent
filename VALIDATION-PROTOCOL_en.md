# Validation Protocol — LITE Mode + Knowledge Base

> 🌐 Leia esta documentação em [Português](VALIDATION-PROTOCOL.md).

**Objective:** Validate the effectiveness of LITE Mode and Knowledge Base in real use cases.

---

## 1. LITE Mode Test (10 S tasks)

### Selection Criteria
- Task with `low` effort (documentation, typo, simple config)
- Scope: 1 file
- Expected duration: <5 minutes

### Data Collection

For each task, record:

| Metric | How to measure |
|---|---|
| **LITE Tokens** | Count tokens in the full flow |
| **FULL Tokens** | Estimate what it would be in FULL mode |
| **Savings** | (FULL - LITE) / FULL × 100% |
| **Quality** | Correct result? (yes/no) |
| **Consistency** | Followed LITE format? (yes/no) |

### Record Template

```markdown
## LITE Task #[N]

**Description:** [what was done]
**Date:** YYYY-MM-DD

### Metrics
- LITE Tokens: [N]
- Estimated FULL Tokens: [N]
- Savings: [%]
- Quality: ✅/❌
- Consistency: ✅/❌

### Observations
[What worked / what to improve]
```

### Goal
- Average savings: ≥50%
- Quality: 100% (all correct)
- Consistency: ≥90%

---

## 2. Knowledge Base Validation (5 sessions)

### Session Criteria
- Task with `medium` or `high` effort
- Duration: ≥10 turns
- At least 1 potential finding

### Data Collection

For each session, record:

| Metric | How to measure |
|---|---|
| **Knowledge loaded** | Yes/no + lines read |
| **Findings** | Pattern/Heuristic/Anti-pattern |
| **Consolidation** | Yes/no + result |
| **Replay/Reuse** | Was Knowledge useful? (yes/no) |

### Record Template

```markdown
## KB Session #[N]

**Task:** [description]
**Effort:** medium/high
**Date:** YYYY-MM-DD

### Knowledge
- Loaded: yes/no ([N] lines)
- Files read: [list]

### Findings
- [type]: [description]
- [type]: [description]

### Consolidation
- New entry created: yes/no
- Existing entry reinforced: yes/no
- Knowledge was useful: yes/no

### Observations
[Quality of entries, identified gaps]
```

### Goal
- Knowledge loaded: 100% of sessions
- At least 1 finding: ≥80% of sessions
- Reuse: ≥60% of sessions

---

## 3. Analysis and Report

### After 10 LITE tasks + 5 KB sessions

Generate a report including:

1. **Quantitative summary**
   - Average token savings
   - Quality rate
   - Number of findings

2. **Qualitative analysis**
   - What worked well
   - What needs improvement
   - Identified patterns

3. **Required adjustments**
   - Modifications in CLAUDE.md
   - Updates in skills
   - Token optimizations

4. **Decision**
   - Approve LITE Mode for production
   - Revert to previous mode
   - Adjust and re-test

---

## 4. Schedule

| Phase | Duration | Deliverable |
|---|---|---|
| LITE Tasks | 2-3 days | 10 records |
| KB Sessions | 3-5 days | 5 records |
| Analysis | 1 day | Report |
| Adjusts | 1-2 days | Updates |
| **Total** | **7-11 days** | **Decision** |

---

## 5. Responsibilities

| Activity | Owner |
|---|---|
| Execute LITE tasks | Agent + User |
| Record metrics | Agent |
| Execute KB sessions | Agent + User |
| Analyze results | Agent |
| Decide adjustments | User |
