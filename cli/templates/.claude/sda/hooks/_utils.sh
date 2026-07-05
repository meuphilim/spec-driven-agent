#!/bin/bash
# _utils.sh — Funções utilitárias compartilhadas pelos hooks

# Encontrar jq
find_jq() {
  if command -v jq &>/dev/null; then echo "jq"; return; fi
  for p in \
    "$HOME/AppData/Local/Microsoft/WinGet/Links/jq" \
    "$HOME/AppData/Local/Microsoft/WinGet/Links/jq.exe" \
    "/usr/bin/jq" "/usr/local/bin/jq"; do
    [ -f "$p" ] && echo "$p" && return
  done
  echo ""
}

JQ=$(find_jq)
if [ -z "$JQ" ]; then
  echo "⚠️ jq não encontrado. Hooks não funcionarão."
  exit 0
fi

# mktemp_safe — Criar ficheiro temporário de forma cross-platform
# Usa mktemp se disponível; fallback para node -e
mktemp_safe() {
  if command -v mktemp &>/dev/null; then
    mktemp "$@"
  else
    node -e "
      const fs = require('fs'), path = require('path');
      const tmp = path.join(require('os').tmpdir(), 'sda-' + process.pid + '-' + Date.now() + '.tmp');
      fs.writeFileSync(tmp, '');
      console.log(tmp);
    "
  fi
}

# ─── Event Logger — JSONL append-only ──────────────────────────────────────

# stdin_read — Lê stdin inteiro, fallback para "{}"
# Use no início de hooks para capturar o payload JSON do Claude Code.
stdin_read() {
  local input
  input=$(cat /dev/stdin 2>/dev/null || echo "")
  [ -z "$input" ] && echo "{}" || echo "$input"
}

# jsonl_write — Appenda 1 linha JSONL no arquivo do dia
# Cria o diretório metrics/ se não existir.
# Uso: jsonl_write <event_json_string>
jsonl_write() {
  local hooks_dir
  hooks_dir="$(cd "$(dirname "$0")" && pwd)"
  local metrics_dir="$hooks_dir/../metrics"
  local today
  today=$(date -u +%Y-%m-%d)
  local file="$metrics_dir/events-$today.jsonl"
  mkdir -p "$metrics_dir"
  echo "$1" >> "$file"
}

# json_build — Constrói JSON seguro via jq com escaping automático
# Uso: json_build key="string" num=42@ raw='{"a":1}@'
#   @ suffix  → valor RAW (números, booleans, null, objetos aninhados)
#   no suffix → string (escapada automaticamente por jq --arg)
# Saída: stdout com JSON, ou vazio se falhar
json_build() {
  local jq_args=()
  local parts=()

  local key val
  for arg in "$@"; do
    key="${arg%%=*}"
    val="${arg#*=}"

    # Validar key (só alfanumérico + underscore)
    if [[ ! "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
      echo "⚠️ json_build: invalid key '$key'" >&2
      continue
    fi

    if [[ "$val" == @ ]]; then
      continue  # vazio
    elif [[ "$val" == *@ ]]; then
      # RAW JSON (número, booleano, null, objeto)
      val="${val%@}"
      parts+=("$(printf '"%s": %s' "$key" "$val")")
    else
      # String segura — jq --arg escapa automaticamente
      jq_args+=(--arg "$key" "$val")
      parts+=("$(printf '"%s": $%s' "$key" "$key")")
    fi
  done

  # Construir filtro jq
  local IFS=", "
  local jq_filter="{ ${parts[*]} }"

  "$JQ" -n "${jq_args[@]}" "$jq_filter" 2>/dev/null || echo ""
}

# event_logger — Constrói e escreve evento padronizado no JSONL
# Adiciona timestamp automaticamente.
# Uso: event_logger key="value" num=42@ raw='{"a":1}@'
#   (mesma sintaxe de json_build)
# NOTA: Esta versão usa jq --arg, eliminando perda silenciosa
# de eventos causada por aspas não escapadas em comandos/comentários.
# Ex.: COMMAND_TRUNC com grep "foo" ou git commit -m "msg" agora funciona.
event_logger() {
  local ts
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local json
  json=$(json_build ts="$ts" "$@")
  if [ -n "$json" ]; then
    jsonl_write "$json"
  fi
}
