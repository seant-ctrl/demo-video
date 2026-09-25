# Framewave — le projet qu'on livre

Framewave (https://github.com/seant-ctrl/framewave, Electron, local-first) est l'éditeur dans lequel la vidéo s'ouvre à la
fin. On ne rend **pas** le MP4 final nous-mêmes comme livrable principal : on livre un **projet Framewave** où chaque plan
est un clip, la VO un bloc audio, les sous-titres pré-remplis, un marqueur par plan. L'utilisateur relit, ajuste
(sous-titres, zooms, son, textes), exporte depuis Framewave.

## Ce que l'utilisateur doit avoir (README du skill)

- Framewave ≥ 0.1.4 installé dans `/Applications` (`.dmg` arm64 ou x64 depuis les Releases GitHub ; premier lancement
  clic droit → Ouvrir, ou `xattr -cr /Applications/Framewave.app`).
- Dossier de projets : `~/Movies/Framewave/` par défaut (`app.getPath('videos')` sur macOS), modifiable dans les
  réglages de l'app → lu par `framewave-project.mjs` via `~/Library/Application Support/Framewave/settings.json`,
  ou forcé par `FRAMEWAVE_PROJECTS`.

## Le modèle de données (source : `src/shared/types.ts` du repo)

Un projet = un dossier `<projectsDir>/<id>/` avec `project.json`, les médias, `thumb.jpg`. `id` =
`YYYY-MM-DD_HH-mm-ss_xxxxxx`. Temps en **ms**, positions normalisées 0..1.

```
Project { id, name, version:1, createdAt, updatedAt, dir, recording, timeline, render, thumbnail?, peaks?, flags? }
recording (montage) { mode:'montage', fps, durationMs, width, height, media: MediaAsset[], eventsOffsetMs:0, scaleFactor:1, recordedAt }
MediaAsset { id:'m-…', kind:'video'|'image'|'audio', name, file, width?, height?, durationMs, hasAudio, codec }
timeline {
  clips:      Clip[]          { id, sourceId, sourceStart, sourceEnd, speed:1, fit:'cover', volume?, muted?, transitionIn?:{type, durationMs} }
  zooms:      ZoomSegment[]   { id, start, end, focus:{x,y}, scale, origin:'manual', followCursor:false }
  camera:     []              (webcam : jamais en montage)
  texts:      TextOverlay[]   { id, start, end, text, position:{x,y}, anchor, fontSize (px @1080p), fontFamily, fontWeight, color, background, padding, radius, animation, align, shadow }
  captions:   CaptionSegment[]{ id, start, end, text }
  audioClips: AudioClip[]     { id, sourceId, sourceStart, sourceEnd, start, volume, muted, fadeIn, fadeOut, name }
  audio:      { mic, system, camera: {volume, muted, gate:null, fadeIn, fadeOut}, music: {file, volume, muted, offset, loop, durationMs}|null }
  markers:    { id, t, label }[]
}
render { aspect:'16:9', outputHeight:1080, background:{type:'color', color}, padding:0, cornerRadius:0, shadow, border, tilt, crop:null,
         cursor:{mode:'hidden',…}, camera:{enabled:false,…}, zoom:{autoEnabled:false, defaultScale, transitionMs, holdMs, easing, …},
         keystrokes:{enabled:false}, captions:{enabled, fontSize, fontFamily, color, background, position:'bottom', highlightColor, maxLines}, color, motionBlur }
```

Transitions disponibles : `cut | fade | dip-black | dip-white | slide-left | slide-right | slide-up | slide-down | wipe | zoom | blur`.
Un clip avec `transitionIn` **recouvre** le précédent de `durationMs` (`placeClips()` : `start = prevEnd − durationMs`).
C'est cette même math que `framewave-project.mjs` utilise pour placer les blocs VO, les sous-titres et les marqueurs.

Fichiers médias : nommés `<assetId>-<nom>` comme le fait `ingestMedia()` ; H.264 MP4 copiés tels quels (aucune
transcodification) ; MP3 copiés tels quels ; musique copiée en `<timestamp>-<nom>`.

## Ce que `scripts/framewave-project.mjs` produit

| Piste | Contenu | Réglé par `demo.config.json → framewave` |
|---|---|---|
| Clips | un MP4 par plan, dans l'ordre, `fit:'cover'` | `transitions`: `default` (cut), `afterTitle`, `beforeOutro`, `byPlan{}`, `durationMs` |
| Audio (blocs) | un bloc par plan avec VO, posé à `début du plan + 4 f`, volume 1 | `voTrack: 'separate'` (défaut). `'baked'` = VO dans les clips, pas de blocs |
| Captions | phrases du script VO, découpées à la ponctuation (≤ 12 mots), temps réparti au mot sur la durée mesurée du MP3 | `captions: true` |
| Zooms | vides en `zooms:'baked'` (la caméra est dans l'image). En `'framewave'` : un segment par run de keyframes z > 1, focus = centre / plateau | `zooms` (racine du config) |
| Marqueurs | un par plan, label = id du plan | `markers: true` |
| Musique | fichier copié, `loop:true`, `offset:0` | `music` (chemin), `musicVolume` (0,12 sous VO) |
| Render | défauts montage de Framewave : fond noir, pas de padding, curseur caché, auto-zoom off, webcam off, captions activées si présentes (Inter 36 px, fond noir 60 %, 2 lignes) | `--template <project.json>` pour reprendre le look d'un projet existant |
| Vignette | `out/sheets/still-title.png` → `thumb.jpg` 640 px | — |
| README.md | tableau plan / début / durée / VO + ce qui est sur chaque piste | — |

Pourquoi VO en blocs séparés par défaut : c'est ce qui rend le projet **éditable** — décaler une phrase de 300 ms,
la couper, la remplacer par un re-enregistrement, baisser un plan, sans re-rendre Remotion. Les clips gardent leurs SFX.

## Ouvrir le projet

Framewave n'a ni deep link ni argument CLI d'ouverture. `open -a Framewave` lance l'app ; le projet, le plus récent,
est **la première vignette de l'écran Home**. Le message final le dit explicitement, avec le nom et la durée du projet.
Si Framewave tourne déjà : il faut revenir à Home (bouton retour) pour voir la nouvelle vignette ; le dire aussi.

## Ce que l'utilisateur fera dans Framewave (à écrire dans le message final, 5 puces max)

1. Relire les sous-titres (onglet Captions) : ils viennent du script, découpés automatiquement ; Whisper local est
   disponible si on préfère une transcription mot à mot (SRT/VTT import/export aussi).
2. Décaler / raccourcir un bloc VO sur la piste Audio ; les clips ne bougent pas.
3. Ajouter un zoom manuel là où un détail mérite plus (mode `baked` : attention, la caméra est déjà dans l'image, un
   zoom Framewave par-dessus zoome une image déjà zoomée).
4. Texte : presets Title / Lower third / Badge / Note ; on peut ajouter une pastille oubliée sans re-rendre.
5. Exporter : MP4 H.264 1080p 30 fps, qualité High, via WebCodecs (plus rapide que le temps réel).

## Cas « vidéo déjà enregistrée » (sans Remotion)

Un seul `MediaAsset` vidéo, un clip `0 → durationMs`, blocs VO aux timecodes du storyboard, sous-titres, marqueurs,
`zooms` manuels aux moments cités (`focus` = position normalisée de l'élément, `scale` 1,5–2, `start/end` ≥ 1,8 s).
Écrire un script de 60 lignes sur le modèle de `framewave-project.mjs` (mêmes helpers, sans `clips.json`).

## Vérifications avant d'ouvrir

- `project.json` parse ; tous les `file` référencés existent dans le dossier ; `recording.durationMs` = fin du dernier clip.
- Aucun bloc audio ne dépasse la fin du dernier clip de plus de 500 ms (sinon la timeline s'allonge sur du noir).
- Les sous-titres ne se chevauchent pas ; aucun segment < 700 ms.
- Le nombre de clips = nombre de plans du storyboard.
