#!/usr/bin/env bash
# encode-digits.sh
# Downloads digit sprite GIFs and regenerates supabase/functions/counter/digits.ts
#
# Usage:
#   bash scripts/encode-digits.sh
#
# Requirements: curl, base64 (macOS or GNU coreutils)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ASSETS_DIR="${REPO_ROOT}/supabase/functions/counter/assets"
OUTPUT="${REPO_ROOT}/supabase/functions/counter/digits.ts"
BASE_URL="http://sozai.akuseru-design.com/img_num/num018/white"

mkdir -p "${ASSETS_DIR}"

echo "Downloading digit GIFs..."
for i in $(seq 0 9); do
  curl -sSfL -o "${ASSETS_DIR}/${i}.gif" "${BASE_URL}/${i}.gif"
  echo "  Downloaded ${i}.gif"
done

echo "Generating ${OUTPUT}..."

cat > "${OUTPUT}" << 'HEADER'
// Digit sprite data URIs (16×23 px GIFs)
// Source: http://sozai.akuseru-design.com/img_num/num018/white/<digit>.gif
//
// Run scripts/encode-digits.sh to regenerate this file after downloading the GIFs:
//   bash scripts/encode-digits.sh
//
// This file is committed so the Edge Function bundle is self-contained.
export const DIGIT_DATA_URIS: Record<string, string> = {
HEADER

for i in $(seq 0 9); do
  # base64 flags differ between macOS and GNU
  if base64 --version 2>/dev/null | grep -q GNU; then
    B64=$(base64 -w 0 "${ASSETS_DIR}/${i}.gif")
  else
    B64=$(base64 -i "${ASSETS_DIR}/${i}.gif" | tr -d '\n')
  fi
  echo "  \"${i}\": \"data:image/gif;base64,${B64}\"," >> "${OUTPUT}"
done

cat >> "${OUTPUT}" << 'FOOTER'
};
FOOTER

echo "Done. Commit supabase/functions/counter/digits.ts"
