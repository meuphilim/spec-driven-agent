# Bash Best Practices

Reference for writing reliable, cross-platform, fail-fast bash scripts.

---

## 1. Strict Mode (always)

Every script starts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `set -e` — exit immediately if a command fails.
- `set -u` — error on unset variables instead of silently using empty strings.
- `set -o pipefail` — a pipeline fails if *any* command in it fails, not just the last one.
- `IFS=$'\n\t'` — avoids word-splitting surprises with spaces in filenames.

If a command is *expected* to fail (e.g. a check), wrap it explicitly so `set -e` doesn't kill the script:

```bash
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed." >&2
  exit 1
fi
```

---

## 2. Error Handling

### Trap errors with context

```bash
trap 'echo "❌ Error on line $LINENO. Exit code: $?" >&2' ERR
```

### Cleanup on exit (success or failure)

```bash
TMP_DIR=$(mktemp -d)
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT
```

### Fail loud, not silent

```bash
# Bad — swallows errors
some_command 2>/dev/null || true

# Good — fails with a clear message
some_command || { echo "❌ some_command failed" >&2; exit 1; }
```

---

## 3. Argument Parsing

Minimal, dependency-free pattern for scripts with flags:

```bash
#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: $(basename "$0") [-e environment] [-f] [--help]

  -e, --env       Target environment (default: development)
  -f, --force     Skip confirmation prompts
  -h, --help      Show this help message
EOF
  exit 0
}

ENV="development"
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--env) ENV="$2"; shift 2 ;;
    -f|--force) FORCE=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
done

echo "Running in $ENV (force=$FORCE)"
```

---

## 4. Cross-Platform Considerations

OpenCode/Samantha runs in environments that may be Linux, macOS, or WSL on Windows. When a script can't be made portable, say so explicitly at the top:

```bash
#!/usr/bin/env bash
# REQUIRES: Linux or macOS (uses GNU coreutils-specific flags). Not WSL/Git-Bash safe.
```

Common gotchas:

| Issue | Safer alternative |
|---|---|
| `sed -i ''` (macOS) vs `sed -i` (GNU) | `sed -i.bak '...' file && rm file.bak` works on both |
| `readlink -f` not on macOS by default | Use `python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))"` or require `coreutils` via brew |
| `date -d` (GNU) vs `date -v` (BSD) | Prefer doing date math in Node/Python if the script already touches them |
| Case-sensitive paths on Linux, not always on macOS | Never rely on filename casing to disambiguate |

If the project is mixed Windows/Mac/Linux (common with Next.js/NestJS teams), prefer Node.js scripts (`scripts/*.mjs`) over bash for anything that must run identically everywhere, and reserve bash for git hooks / CI-only steps.

---

## 5. Logging Conventions

Keep output scannable. Suggested prefix convention:

```bash
log()  { echo "ℹ️  $*"; }
ok()   { echo "✅ $*"; }
warn() { echo "⚠️  $*" >&2; }
err()  { echo "❌ $*" >&2; }

log "Starting database reset..."
ok "Migrations applied"
warn "No seed file found, skipping"
err "Connection refused"
```

---

## 6. Script Header Template

Every non-trivial script should start with a header block explaining purpose, usage, and requirements — this is the bash equivalent of a docstring:

```bash
#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# db-reset.sh
# Resets the local database and re-seeds it with dummy data.
#
# Usage:   ./scripts/db-reset.sh [-f]
# Requires: Docker running, .env present
# ─────────────────────────────────────────────
```

---

## 7. Making Scripts Executable & Discoverable

```bash
chmod +x scripts/*.sh
```

Then expose them through `package.json` so nobody needs to remember the path:

```json
{
  "scripts": {
    "db:reset": "bash scripts/db-reset.sh"
  }
}
```

This also means `pnpm db:reset` works identically whether the underlying implementation is bash, Node, or eventually rewritten — the interface doesn't change.
