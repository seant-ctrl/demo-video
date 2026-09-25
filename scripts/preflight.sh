#!/usr/bin/env bash
# Preflight /demo-video : dit ce qui est là, ce qui manque, et comment l'installer. Ne modifie rien.
# Usage : bash ~/.claude/commands/demo-video/scripts/preflight.sh [--json]
set -u
JSON=0; [ "${1:-}" = "--json" ] && JSON=1
ok=(); ko=(); warn=()
add() { case "$1" in ok) ok+=("$2");; ko) ko+=("$2");; warn) warn+=("$2");; esac; }

# macOS
[ "$(uname)" = "Darwin" ] && add ok "macOS $(sw_vers -productVersion 2>/dev/null)" || add warn "OS non macOS : afinfo/open -a indisponibles, Framewave .exe côté Windows"
# Node ≥ 20
if command -v node >/dev/null; then v=$(node -v | sed 's/v//'); maj=${v%%.*}; [ "$maj" -ge 20 ] && add ok "node $v" || add ko "node $v trop vieux (≥ 20) : brew install node"; else add ko "node absent : brew install node"; fi
# Chrome
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; [ -x "$CH" ] && add ok "Google Chrome (captures headless)" || add ko "Google Chrome absent : https://www.google.com/chrome/ (ou renseigner capture.chrome dans demo.config.json)"
# Framewave
FW=""; for p in /Applications/Framewave.app "$HOME/Applications/Framewave.app"; do [ -d "$p" ] && FW="$p"; done
if [ -n "$FW" ]; then fv=$(defaults read "$FW/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null); add ok "Framewave $fv ($FW)"; else add ko "Framewave absent : https://github.com/seant-ctrl/framewave/releases/latest → Framewave-<v>-arm64.dmg (Apple Silicon) ou -x64.dmg ; 1er lancement : clic droit → Ouvrir, ou xattr -cr /Applications/Framewave.app"; fi
PD="$HOME/Movies/Framewave"; S="$HOME/Library/Application Support/Framewave/settings.json"; [ -f "$S" ] && PD=$(python3 -c "import json;print(json.load(open('$S')).get('projectsDir','$PD'))" 2>/dev/null || echo "$PD"); [ -d "$PD" ] && add ok "Dossier de projets Framewave : $PD" || add warn "Dossier de projets Framewave pas encore créé ($PD) : lance Framewave une fois"
# ElevenLabs
KEY=""; [ -n "${ELEVENLABS_API_KEY:-}" ] && KEY=env; [ -z "$KEY" ] && [ -f "$HOME/.demo-video/.env" ] && grep -q '^ELEVENLABS_API_KEY=.\+' "$HOME/.demo-video/.env" && KEY="~/.demo-video/.env"
[ -n "$KEY" ] && add ok "Clé ElevenLabs trouvée ($KEY)" || add warn "Pas de clé ElevenLabs : mkdir -p ~/.demo-video && printf 'ELEVENLABS_API_KEY=…\n' > ~/.demo-video/.env && chmod 600 ~/.demo-video/.env (sinon : script VO sans génération)"
# afinfo
command -v afinfo >/dev/null && add ok "afinfo (mesure des MP3)" || add warn "afinfo absent : ffprobe via npx remotion ffprobe"
# Remotion skills
if ls "$HOME/.claude/skills"/remotion* >/dev/null 2>&1 || ls "$HOME/.agents/skills"/remotion* >/dev/null 2>&1 || ls ./.claude/skills/remotion* >/dev/null 2>&1; then add ok "Skills Remotion installés"; else add warn "Skills Remotion absents (conseillés pour toucher au TSX) : npx skills add remotion-dev/skills -g -a claude-code -s remotion-best-practices -s remotion-markup -s remotion-render -s remotion-studio -y"; fi
# Police de marque Zeliq (optionnelle, jamais dans le repo)
if [ -f "$HOME/.demo-video/fonts/PPTelegraf-Bold.ttf" ] || ls "$HOME/Library/Fonts"/PPTelegraf-Bold.* >/dev/null 2>&1; then add ok "Police Zeliq PP Telegraf (cartons à la marque)"; else add warn "Police PP Telegraf absente : cartons en Inter. Pour la police Zeliq, demande le fichier à Sean et place-le dans ~/.demo-video/fonts/PPTelegraf-Bold.ttf"; fi
# PDF rasterizer (slides seulement)
python3 -c "import fitz" 2>/dev/null && add ok "PyMuPDF (slides → PNG)" || { command -v pdftoppm >/dev/null && add ok "pdftoppm (slides → PNG)" || add warn "Ni PyMuPDF ni pdftoppm (utile seulement pour une source slides) : pip3 install pymupdf"; }
# skills motion-design / design-like-zeliq
[ -d "$HOME/.claude/commands/motion-design" ] && add ok "/motion-design présent" || add warn "/motion-design absent (le scaffold embarque déjà la personnalité Corporate)"

if [ $JSON = 1 ]; then python3 - "$@" <<PY
import json; print(json.dumps({"ok": $(printf '%s\n' "${ok[@]:-}" | python3 -c 'import sys,json;print(json.dumps([l for l in sys.stdin.read().split("\n") if l]))'), "ko": $(printf '%s\n' "${ko[@]:-}" | python3 -c 'import sys,json;print(json.dumps([l for l in sys.stdin.read().split("\n") if l]))'), "warn": $(printf '%s\n' "${warn[@]:-}" | python3 -c 'import sys,json;print(json.dumps([l for l in sys.stdin.read().split("\n") if l]))')}, ensure_ascii=False))
PY
else
  for l in "${ok[@]:-}"; do [ -n "$l" ] && echo "✅ $l"; done
  for l in "${warn[@]:-}"; do [ -n "$l" ] && echo "⚠️  $l"; done
  for l in "${ko[@]:-}"; do [ -n "$l" ] && echo "❌ $l"; done
fi
[ ${#ko[@]} -eq 0 ]
