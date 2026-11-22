#!/bin/zsh
# Render the reel scenes to public/home/fx/<name>.jpg, .webp and -900.webp, and the phone version <name>-m.webp.
# Usage: scripts/scenes/render.sh [name ...]   (no names renders all nine)
# Needs gstack's browse binary (headless Chromium) and python3 with Pillow and cwebp (brew install webp).
set -e
HERE=${0:A:h}
ROOT=${HERE:h:h}
OUT=$ROOT/public/home/fx
TMP=/tmp/sparktech-scenes; mkdir -p $TMP
B=${B:-$HOME/.claude/skills/gstack/browse/dist/browse}
if (( $# )); then names=($@); else names=(seo aeo design build maintain features agents apps startups); fi
$B viewport 1600x1080 --scale 2 >/dev/null
for n in $names; do
  $B goto "file://$HERE/$n.html" >/dev/null
  $B js "await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); 1" >/dev/null
  $B screenshot --viewport "$TMP/$n.png" >/dev/null
  python3 -I "$HERE/export.py" "$TMP/$n.png" "$OUT/$n"
  echo "rendered $n"
done
# Portrait (4:5) for phones: <name>-m.webp
$B viewport 1080x1350 --scale 2 >/dev/null
for n in $names; do
  $B goto "file://$HERE/$n.html?p" >/dev/null
  $B js "await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); 1" >/dev/null
  $B screenshot --viewport "$TMP/$n-m.png" >/dev/null
  python3 -I "$HERE/export.py" "$TMP/$n-m.png" "$OUT/$n" portrait
  echo "rendered $n (portrait)"
done
$B viewport 1280x720 --scale 1 >/dev/null
