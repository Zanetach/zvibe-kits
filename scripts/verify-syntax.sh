#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "verify:syntax failed: node is required."
  exit 1
fi

while IFS= read -r file; do
  node --check "$file" >/dev/null
done < <(rg --files -g '*.js' src bin)

echo "verify:syntax passed"
