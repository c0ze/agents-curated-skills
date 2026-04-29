#!/usr/bin/env bash
# Sync a curated subset of skills into a local assistant skills directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_SKILLS="${SOURCE_SKILLS:-$REPO_ROOT/skills}"
HOME_DIR="${HOME:-${USERPROFILE:-}}"

usage() {
  cat <<'USAGE'
Usage: tools/scripts/sync_recommended_skills.sh [--target codex|gemini|claude|shared|PATH] [--source PATH] [--prune]

Defaults:
  --source  repo skills/ directory
  --target  shared Codex-friendly directory: ~/.agents/skills

Targets:
  codex|shared  ~/.agents/skills
  gemini        ~/.gemini/skills
  claude        ~/.claude/skills

Options:
  --prune       After backing up, remove non-recommended skill directories from the target.
USAGE
}

resolve_target() {
  case "$1" in
    codex|shared)
      printf '%s/.agents/skills\n' "$HOME_DIR"
      ;;
    gemini)
      printf '%s/.gemini/skills\n' "$HOME_DIR"
      ;;
    claude)
      printf '%s/.claude/skills\n' "$HOME_DIR"
      ;;
    *)
      printf '%s\n' "$1"
      ;;
  esac
}

TARGET_SPEC="${TARGET:-shared}"
PRUNE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_SPEC="${2:?Missing value for --target}"
      shift 2
      ;;
    --source)
      SOURCE_SKILLS="${2:?Missing value for --source}"
      shift 2
      ;;
    --prune)
      PRUNE=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$HOME_DIR" ]]; then
  echo "Could not resolve HOME. Pass an absolute path with --target." >&2
  exit 1
fi

SOURCE_SKILLS="$(cd "$SOURCE_SKILLS" && pwd)"
TARGET_DIR="$(resolve_target "$TARGET_SPEC")"
BACKUP_DIR="${BACKUP_DIR:-$TARGET_DIR.backup.$(date +%Y%m%d_%H%M%S)}"

RECOMMENDED_SKILLS=(
  "test-driven-development"
  "doc-coauthoring"
  "senior-fullstack"
  "javascript-mastery"
  "docx"
  "pdf"
  "pptx"
  "xlsx"
  "react-best-practices"
  "frontend-dev-guidelines"
  "webapp-testing"
  "playwright-skill"
  "mcp-builder"
  "ui-ux-pro-max"
  "llm-app-patterns"
  "prompt-library"
  "github-workflow-automation"
)

echo "Sync recommended skills"
echo "======================="
echo
echo "Source: $SOURCE_SKILLS"
echo "Target: $TARGET_DIR"
echo "Skills to sync: ${#RECOMMENDED_SKILLS[@]}"
echo

mkdir -p "$TARGET_DIR"

echo "Creating backup: $BACKUP_DIR"
cp -a "$TARGET_DIR" "$BACKUP_DIR"
echo "Backup complete"
echo

if [[ "$PRUNE" -eq 1 ]]; then
  echo "Pruning non-recommended skill directories..."
  keep_file="$(mktemp)"
  printf '%s\n' "${RECOMMENDED_SKILLS[@]}" > "$keep_file"
  find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d | while IFS= read -r item; do
    name="$(basename "$item")"
    if ! grep -Fxq "$name" "$keep_file"; then
      rm -rf "$item"
    fi
  done
  rm -f "$keep_file"
  echo "Prune complete"
  echo
fi

echo "Copying recommended skills..."
SUCCESS_COUNT=0
MISSING_COUNT=0

for skill in "${RECOMMENDED_SKILLS[@]}"; do
  if [[ -d "$SOURCE_SKILLS/$skill" ]]; then
    rm -rf "$TARGET_DIR/$skill"
    cp -a "$SOURCE_SKILLS/$skill" "$TARGET_DIR/"
    echo "  copied $skill"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "  missing $skill"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

FINAL_COUNT="$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"

echo
echo "Summary"
echo "======="
echo "Copied: $SUCCESS_COUNT skills"
echo "Missing: $MISSING_COUNT skills"
echo "Backup: $BACKUP_DIR"
echo "Final target skill directories: $FINAL_COUNT"
