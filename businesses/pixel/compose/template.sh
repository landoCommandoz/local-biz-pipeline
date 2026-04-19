#!/usr/bin/env bash
# PIXEL slideshow compose — 9-slide 1080x1920 vertical MP4 for TikTok.
# Usage: template.sh --images <list.txt> --title <title> --price <price> --cta <cta> --out <out.mp4>
# Input: one image path per line in the images file (7 expected, slides 1-7).
# Output: 11-second 1080x1920 H.264 MP4 with title card + slides + CTA card.
#
# Dependencies: ffmpeg (on PATH), ImageMagick `convert` for the title/CTA cards.
# LGPL (ffmpeg) + Apache-2.0 (ImageMagick). No paid deps.

set -euo pipefail

IMAGES=""
TITLE=""
PRICE=""
CTA=""
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --images) IMAGES="$2"; shift 2;;
    --title)  TITLE="$2";  shift 2;;
    --price)  PRICE="$2";  shift 2;;
    --cta)    CTA="$2";    shift 2;;
    --out)    OUT="$2";    shift 2;;
    *) echo "unknown arg: $1" >&2; exit 1;;
  esac
done

for v in IMAGES TITLE PRICE CTA OUT; do
  if [[ -z "${!v}" ]]; then
    echo "missing required arg: --${v,,}" >&2; exit 1
  fi
done

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not on PATH" >&2; exit 1
fi
if ! command -v convert >/dev/null 2>&1; then
  echo "ImageMagick 'convert' not on PATH" >&2; exit 1
fi

TMP="$(mktemp -d)"
trap "rm -rf $TMP" EXIT

# Title card
convert -size 1080x1920 xc:black \
  -fill white -gravity center -font Helvetica-Bold -pointsize 64 \
  -annotate +0-100 "$TITLE" \
  -fill '#c9a84c' -pointsize 96 \
  -annotate +0+100 "$PRICE" \
  "$TMP/title.png"

# CTA card
convert -size 1080x1920 xc:black \
  -fill white -gravity center -font Helvetica-Bold -pointsize 72 \
  -annotate +0+0 "$CTA" \
  "$TMP/cta.png"

# Build concat list. Title 1.2s + 7 slides x 1.2s + CTA 1.4s = 11.0s.
{
  echo "file '$TMP/title.png'"
  echo "duration 1.2"
  i=0
  while IFS= read -r img && [[ $i -lt 7 ]]; do
    echo "file '$img'"
    echo "duration 1.2"
    i=$((i+1))
  done < "$IMAGES"
  # pad if fewer than 7 lines read
  while [[ $i -lt 7 ]]; do
    first=$(head -n1 "$IMAGES")
    echo "file '$first'"
    echo "duration 1.2"
    i=$((i+1))
  done
  echo "file '$TMP/cta.png'"
  echo "duration 1.4"
  # ffmpeg concat demuxer needs a trailing file without duration
  echo "file '$TMP/cta.png'"
} > "$TMP/list.txt"

ffmpeg -y -f concat -safe 0 -i "$TMP/list.txt" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p" \
  -r 30 -c:v libx264 -preset medium -crf 22 \
  -movflags +faststart \
  "$OUT"

echo "wrote $OUT"
