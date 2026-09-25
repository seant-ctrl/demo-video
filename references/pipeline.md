# Pipeline Remotion — géométrie, primitives, scripts

Le scaffold (`scaffold/`) est le pipeline qui a produit les deux premières démos produit Zeliq (130,8 s en 19 plans,
puis 210,4 s en 32 plans). On le **copie tel quel** dans le dossier de sortie, on remplit 4 fichiers, on ne réinvente rien :

| À remplir | Depuis |
|---|---|
| `demo.config.json` | l'intake (nom, langue, fenêtre, VO, curseur, zooms, Framewave) |
| `capture/capture.mjs` | la section « Captures à produire » du breakdown |
| `voiceover/script-<lang>.json` | la colonne « Texte » du script VO |
| `src/texts.mjs` + `src/scenes/beats.mjs` | la section « Plan par plan » du breakdown |
| `src/theme.ts` (si marque ≠ Zeliq) | la section « Marque » du storyboard |

Skills Remotion à charger quand on touche au TSX : `/remotion-best-practices` puis `/remotion-markup` (composants), `/remotion-render`
(scripts de rendu), `/remotion-studio` (preview). Installation : voir README (4 skills, un `-s` par skill). Ils couvrent `interpolate`, `Sequence`, `@remotion/media`, les polices, le rendu. Le scaffold les respecte déjà.

## Géométrie (ne pas changer sans raison écrite dans le breakdown)

| Brique | Valeur | Pourquoi |
|---|---|---|
| Capture | **1600 × N css @ dpr 2** (PNG 3200 px de large) | K = 1920/1600 = **1,2** : un zoom 1,7× consomme 0,98 px réel par px écran, aucun flou |
| Plateau | le PNG posé à 1920 × (N × 1,2) px vidéo | toutes les coordonnées de `beats.mjs` sont en px vidéo : `d.R(shot, key)` fait la conversion |
| Plan large | **z = 0,90** → 1728 × 972 | exactement la zone de sécurité 5 % ; coins arrondis 18 px + ombre à z < 0,985 |
| Zone de sécurité | `SAFE = {96, 54, 1824, 1026}` | tout sujet, highlight et pastille doit y rester à **chaque frame** (`check-safe`) |
| Clamp caméra | `MARGIN = 340` à droite et en bas **seulement** | l'app a son fond page de ces côtés (= fond de la compo) ; en haut (topbar) et à gauche (sidebar) le bord est blanc, déborder ferait une couture. Pour une source dont le fond diffère : changer `C.pageBg` |
| Hauteur de capture | 900 par défaut ; 1000–1200 quand deux blocs cités doivent tenir ensemble | un plateau plus haut que 1080 n'a pas de « page entière » à 0,90 : le haut ou le bas est coupé, le dire |
| Zoom sur texte cité | **≥ 1,5×** | lisibilité à 1080p ; exceptions déclarées `text:false` et listées dans `tasks.md` |
| Zoom max | 1,8× | au-delà on voit les pixels de la capture |

## Primitives (`src/ui/`)

| Composant | Rôle | Paramètres clés |
|---|---|---|
| `Beat` | un plan : VO + SFX + caméra + shots + highlights + curseur + pastilles + légendes | `BeatSpec` (voir squelette dans `beats.mjs`) |
| `Camera` | scale + pan bornés du plateau, keyframes `{f, cx, cy, z}` interpolées en `cubic-bezier(0.2,0,0,1)` | 600 ms (18 f) par mouvement ; tenir ≥ 1 s entre deux mouvements |
| `Shot` | une capture posée sur le plateau, fade-in optionnel | `at` = frame d'entrée ; coupe franche par défaut |
| `Cursor` | curseur synthétique, easing, pression au clic + ripple, ombre | 450–650 ms par trajet ; `click:true` déclenche `sfx/click.wav` à −18 dB |
| `HighlightBox` | cadre accent + halo autour d'un rect, dans l'espace du plateau | `pad 6`, entrée 11 f, sortie 6 f |
| `LabelLayer` | pastilles 28 px Inter 600, **dans l'espace du cadre** (taille fixe, jamais zoomées), placées par `placeLabel` dans la zone de sécurité | `side: top/bottom/left/right`, bascule de côté si pas de place |
| `Caption` | légende basse 30 px (une phrase clé), fond grey1000 93 % | `from/to` |
| `TitleCard` / `OutroCard` / `RoleCard` | cartons (fond `C.cardBg`, glow, logo) | textes dans `texts.mjs` |

Personnalité de motion : **Corporate** (skill `/motion-design`) — easing `cubic-bezier(0.2,0,0,1)`, durées 200 / 350 / 600 ms,
entrées fade + 24 px, zéro overshoot. Une seule personnalité par film.

## Timing : l'audio est la source de vérité

`durée(plan) = max(min, VO + tail)` avec `tail = 20 f` (0,67 s) par défaut. Conséquences :
- la chorégraphie (`min`) est un **plancher**, pas la durée ; si la VO est plus longue, le plan s'étire et les derniers
  keyframes tiennent (la caméra reste sur la dernière position) ;
- un plan « audio-driven » (VO + tail > min) doit garder une image stable à la fin : pas de highlight qui se termine avant la fin de la phrase ;
- sans VO (`voiceover:false`), `voFrames = 0` et chaque plan dure `min` : mettre des `min` lisibles (≥ 4 s par écran neuf).
- Plans de titre/outro : `VO + 60 f` / `VO + 15 f` (ou 3,5 s / 4 s sans VO).

Raccords : **coupe franche** entre deux états du même écran (un fondu superpose deux textes : « Actif » et « En pause »
lisibles ensemble, leçon de la démo 1). Fondu 12 f uniquement carton ↔ écrans et entre deux parties (changement de rôle).
`OVERLAP = 8 f` = recouvrement **audio** entre plans (l'image coupe).

## Scripts (`package.json`)

| Commande | Fait | Sortie |
|---|---|---|
| `npm run login` | ouvre Chrome visible sur l'URL live pour que l'utilisateur se connecte (profil persistant) | `capture.profileDir` |
| `npm run capture` | pilote la source, écrit les PNG + `manifest.json`, puis `gen-data` | `public/shots/` |
| `npm run slides` | rasterise le PDF en `slide-NN.png` + manifest | `public/shots/` |
| `npm run vo` / `vo:force` | ElevenLabs, un MP3 par plan, mesure `afinfo`, puis `gen-data` | `public/vo/` |
| `npm run data` | bake `demo.config.json` + manifests dans `src/demo.mjs` et `src/generated.mjs` | — |
| `npm run timeline` | timeline réelle en JSON (source des timecodes des livrables) | stdout |
| `npm run check` | QA automatique, exit 1 à la première violation | stdout |
| `npm run sheets` | 3 planches-contact (une vignette / 3 s) | `out/sheets/sheetN.png` |
| `npm run still` | still du carton titre (vignette Framewave) | `out/sheets/still-title.png` |
| `npm run preview` | rendu ½ échelle rapide | `out/preview.mp4` |
| `npm run render` | film complet H.264 CRF 18 + AAC | `out/demo.mp4` |
| `npm run clips` | **un MP4 par plan** (l'unité Framewave) + `clips.json` ; `--only=P03-x,P04-y` pour re-rendre 2 plans | `out/clips/` |
| `npm run framewave` | construit le projet Framewave depuis les clips | `~/Movies/Framewave/<id>/` |
| `npm run open` | lance Framewave | — |
| `npm run ship` | `check` → `clips` → `framewave` → `open` | tout |

ffmpeg/ffprobe : embarqués par Remotion, à appeler via le CLI : `npx remotion ffmpeg …` / `npx remotion ffprobe …` (le binaire de `node_modules` ne se lance pas seul). Pas besoin de brew.

## Ordre de production (étape 2, après le go)

```
2.1 cp -R scaffold/ <out>/ && npm install          # 1–2 min
2.2 capture.mjs → npm run capture                  # vérifier : 0 rect NULL, relire 3 PNG au hasard (Read)
2.3 script-<lang>.json → npm run vo                # jamais avant le go : ça coûte des crédits
2.4 (inclus dans vo) durées mesurées
2.5 npm run data                                   # recalage : les plans s'étirent sur la VO
2.6 texts.mjs + beats.mjs                          # depuis le breakdown, plan par plan
2.7 npm run check                                  # itérer jusqu'à 0 violation ; chaque text:false justifié
2.8 npm run sheets && npm run still                # relire les planches à l'œil (Read) : texte coupé, curseur hors cible, deux états superposés
2.9 npm run render (optionnel) && npm run clips    # le MP4 complet sert de preuve ; les clips servent Framewave
2.10 npm run timeline → mettre à jour storyboard / VO script / tasks avec les durées réelles ; ffprobe sur le rendu
2.11 npm run framewave && npm run open             # puis message final
```

## Pièges connus

- `Config.setConcurrency(4)` : suffisant sur un MacBook M-series ; monter à 8 seulement si RAM ≥ 32 Go.
- Les emoji des captures dépendent de la police du Chrome headless : vérifier un PNG avec un emoji avant la série.
- `page.evaluate` avec `eval(expr)` pour les rects : les expressions sont des chaînes JS, une virgule mal placée donne `null` → `check` échoue sur « rects manquants », c'est voulu.
- Toast qui coupe au bord : reculer la caméra (z 0,9) au moment où le toast entre, ou capturer l'état sans toast (leçon P12).
- Un rect plus large que 1728 px (bandeau pleine largeur) n'a **aucun** zoom valide : plan large + `text:false`, légende basse pour porter le message.
- Ne jamais `Read` un PNG 3200 px en boucle : une planche-contact (`sheets`) montre 24 instants d'un coup.
