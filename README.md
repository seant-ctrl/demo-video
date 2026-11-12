# /demo-video — installation et premier lancement

Un skill Claude Code qui transforme une source produit (prototype HTML, URL live, slides, vidéo) en vidéo de démo
motion design, et l'ouvre dans **Framewave** prête à relire et exporter. Tout tourne en local sur le Mac.

## 1. Installer le skill

```bash
git clone https://github.com/seant-ctrl/demo-video.git ~/.claude/commands/demo-video
```
Claude Code le découvre au prochain démarrage : `/demo-video <source>`.

## 2. Installer Framewave (obligatoire pour l'ouverture finale)

1. Télécharger la dernière release : <https://github.com/seant-ctrl/framewave/releases/latest>
   - Apple Silicon : `Framewave-<version>-arm64.dmg` · Intel : `Framewave-<version>-x64.dmg` · Windows : `Framewave.Setup.<version>.exe`
2. Glisser dans `/Applications`. Premier lancement : **clic droit → Ouvrir** (build signé ad hoc). Si macOS dit que
   l'app est endommagée : `xattr -cr /Applications/Framewave.app`.
3. Lancer une fois : ça crée `~/Movies/Framewave/`, le dossier où le skill dépose les projets.

Version minimale : 0.1.4 (montage multi-clips, piste audio indépendante, sous-titres, marqueurs).
Doc et code : <https://github.com/seant-ctrl/framewave> (README = fonctionnalités, `CLAUDE.md` = architecture,
`src/shared/types.ts` = modèle de projet).

## 3. Prérequis machine

| Quoi | Pourquoi | Installer |
|---|---|---|
| Node ≥ 20 | Remotion, scripts | `brew install node` |
| Google Chrome | captures headless des états | <https://www.google.com/chrome/> |
| ElevenLabs (clé API, Text to Speech) | voix off en **Eleven v4** (`eleven_v4`), un MP3 par plan. Réglages et doc : `references/voiceover.md` | `mkdir -p ~/.demo-video && printf 'ELEVENLABS_API_KEY=…\n' > ~/.demo-video/.env && chmod 600 ~/.demo-video/.env` |
| Skills Remotion (conseillé) | bonnes pratiques quand Claude touche au TSX | `npx skills add remotion-dev/skills -g -a claude-code -s remotion-best-practices -s remotion-markup -s remotion-render -s remotion-studio -y` (4 skills suffisent : un `-s` par skill, la liste à virgules n'est pas lue) — <https://www.remotion.dev/docs/ai/skills> |
| Police Zeliq PP Telegraf (optionnel) | cartons titre et fin à la marque. Police sous licence, jamais dans ce repo : sans elle, les cartons sont en Inter | demande le fichier à Sean, puis `mkdir -p ~/.demo-video/fonts` et place `PPTelegraf-Bold.ttf` dedans |
| PyMuPDF (slides seulement) | rasteriser un PDF en PNG | `pip3 install pymupdf` |

Vérifier d'un coup :
```bash
bash ~/.claude/commands/demo-video/scripts/preflight.sh
```

La clé ElevenLabs ne se colle **jamais** dans la conversation. Plan Free : voix du catalogue par défaut uniquement
(George est celle qu'on utilise, elle lit bien le français) ; les voix de bibliothèque partagée renvoient 402.

## 4. Lancer

```bash
/demo-video ~/protos/ma-feature.html --guide ~/protos/ma-feature-guide.md
/demo-video https://app.zeliq.com/leads
/demo-video ~/Downloads/pitch.pdf --lang en --window 60-90
/demo-video ~/Movies/capture.mp4 --no-vo
```

Ce qui se passe ensuite, dans l'ordre :

1. **Preflight** silencieux, puis **questionnaire** en 2–3 tours : public, durée, langue, storyboard proposé ou dicté,
   voix off, musique, curseur, zooms, et les questions propres à la source (rôles à couvrir, connexion, masques).
2. **Brief** à valider (Gate 1).
3. Si la source n'a pas de guide de lecture : Claude en écrit un et te le fait compléter (point d'entrée, flows, règles).
4. **4 documents** dans `<source>/motion/` : `storyboard.md`, `script-breakdown.md`, `voiceover-script.md`, `tasks.md`.
   Tu les relis, tu les modifies, tu dis **go** (Gate 2).
5. **Production** sans autre question : captures, VO ElevenLabs, chorégraphie Remotion, contrôle automatique
   (zone de sécurité à chaque frame, zoom ≥ 1,5× sur le texte cité, durée dans la fenêtre), planches-contact, rendu
   d'un clip par plan, mise à jour des documents avec les durées réelles.
6. **Framewave s'ouvre** : le projet est la première vignette de Home. Un clip par plan sur la timeline, la voix en
   blocs audio déplaçables, les sous-titres pré-remplis depuis le script, un marqueur par plan, la musique si tu en as
   donné une. Tu ajustes, tu exportes (MP4 H.264 1080p).

## 5. Ce que contient le skill

```
SKILL.md              le déroulé et les règles
README.md             ce fichier
references/           intake · sources · deliverables · pipeline · voiceover · framewave · quality
templates/            storyboard · script-breakdown · voiceover-script · tasks · guide-de-lecture
scaffold/             le pipeline Remotion copié dans chaque projet (src/, scripts/, capture/, voiceover/, polices, SFX)
scripts/preflight.sh  vérification des prérequis
```

## 6. Reprendre un projet existant

Dans le dossier `motion/` d'une démo :
```bash
npm run clips -- --only=P04-what,P05-perms   # re-rendre deux plans après correction de beats.mjs
npm run framewave && npm run open            # nouveau projet Framewave avec tous les clips
npm run vo -- --only=p04                     # régénérer une seule piste VO (le texte a changé)
```
`npm run ship` enchaîne `check → clips → framewave → open`.

## 7. Limites connues

- Framewave n'ouvre pas un projet par argument : l'app se lance, le projet est en tête de la liste, un clic.
- En mode zooms « dans l'image » (défaut), un zoom ajouté dans Framewave zoome une image déjà zoomée : préférer le
  mode « éditables dans Framewave » à l'intake si tu veux retoucher la caméra après coup.
- Les captures d'une app live exigent une session : `npm run login` ouvre Chrome, tu te connectes, c'est tout.
  Aucun identifiant ne transite par Claude.
- Pas de génération de musique : tu fournis un fichier, le skill le place et règle le volume.

## 8. Pages d'accompagnement pour l'équipe

- Site public : <https://demo-video-zeliq-skill.vercel.app> (projet Vercel `demo-video-zeliq-skill`, équipe `seant-zeliq`, statique : `index.html`, `framewave.html`, `media/`, `vercel.json` avec `cleanUrls`)
- Guide d'installation et d'usage, version artifact : <https://claude.ai/artifact/Dx5jid3X5HBWRPBA8sfYSt>
- Guide Framewave (installation, autorisation macOS, panneaux, export) : <https://claude.ai/artifact/Se4nBDv36GZrrwSkx1C9MX>

Sources des deux pages dans `docs/` (la police PP Telegraf y est référencée par un placeholder `@@PPTELEGRAF@@`, remplacé au build par le base64 de `~/.demo-video/fonts/PPTelegraf-Bold.ttf`).
