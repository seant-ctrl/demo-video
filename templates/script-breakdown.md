# {{Nom}} — script breakdown

Ce document dit, plan par plan, ce que la composition Remotion fait à l'image : captures, caméra, curseur, surlignages, textes ajoutés, raccords. Les libellés cités sont ceux de la source, relevés à l'écran le {{JJ/MM}}.

## Géométrie et pipeline

| Brique | Choix |
|---|---|
| Captures | `puppeteer-core` + Chrome headless sur {{copie locale du proto / URL live (profil connecté) / PDF rasterisé}}, **1600 × N css @ 2×** (N = 900 par défaut{{, 1200 pour …}}), K = 1,2 vers le plateau 1920 × (N·1,2). Rects relevés par `getBoundingClientRect` → `public/shots/manifest.json` |
| Plateau | Plan « page entière » à z = 0,90 → 1728 × 972 : exactement la zone de sécurité 5 % |
| Clamp caméra | Débordement interdit en haut et à gauche ({{bords blancs}}), toléré à droite et en bas (`MARGIN = 340`, fond {{#F2F5F4}} = fond de la compo) |
| Masquage au capture | `*{transition:none;animation:none}` · {{`.proto-bar{visibility:hidden}` · `.toast-zone{…}`}}. **Aucun texte injecté ni réécrit.** |
| Compo | Remotion {{4.0.524}}, composition `Demo` 1920×1080 @ 30 fps. Primitives `Beat`, `Camera`, `Cursor`, `HighlightBox`, `LabelLayer`, `Caption`, `TitleCard`/`OutroCard`{{/`RoleCard`}} |
| Motion | Corporate : easing `cubic-bezier(0.2,0,0,1)`, 200 / 350 / 600 ms, entrées fade + 24 px, zéro overshoot. Caméra 600 ms par mouvement, tenue ≥ 1 s. Curseur 450–650 ms par trajet, clic = pression 120 ms + ripple |
| Typo / couleurs | {{PPTelegraf Bold (cartons) + Inter ; brand900 #00402F, accent #4C8676, grey200 #F2F5F4, grey1000 #2D3331}} |
| Textes ajoutés | Pastilles 28 px Inter 600, blanc sur accent, rayon 12 ; légendes 30 px sur grey1000 93 % ; cartons 44 / 96–124 px. Contraste ≥ 4,5:1 |
| Audio | Un MP3 par plan, durée mesurée (`afinfo`). Durée(plan) = max(chorégraphie, VO + 20 f). SFX clic à −18 dB{{ / pas de SFX}} |
| Raccords | Coupe franche (8 f de recouvrement audio). Fondu 12 f uniquement {{…}} |
| Contrôle | `npm run check` : zone de sécurité à chaque frame, zoom ≥ 1,5 sur texte cité (`text:false` déclaré sinon), plans ≥ 45 f, VO ≤ plan, total dans la fenêtre |

## Captures à produire ({{n}} shots)

{{`R` = rôle. Setup = fonctions publiques de la source (ou `steps` du manifest). Rects = ceux que la chorégraphie consomme.}}

| Shot | R | Setup | Rects | Hauteur |
|---|---|---|---|---|
| `{{home}}` | {{C}} | `{{setRole('commercial'); gotoScene('home')}}` | {{sidebarItem, title, table, row1}} | 900 |

## Plan par plan

Notation : `z` échelle, `→` déplacement en 600 ms, `ancre` = rect centré. Frames @ 30 fps ; `+VO` = le plan s'étire si l'audio dépasse.

**P00 · Carton titre ({{6}} s)** — Fond {{cardBg}}. Logo fade-in 0→18 f, titre « {{…}} » rise 6→24 f, sous-titre 14→32 f, pills 24→42 f. Tenue jusqu'à VO + 60 f. Fondu 12 f vers P01.

**P01 · {{Titre du plan}} ({{7}} s)** — Shot `{{home}}`. 0–45 f : page entière z 0,90. 45 f → z 1,6 ancrée sur `{{row1}}`. Curseur : entre par {{la droite}} à 20 f, s'arrête sur `{{bouton}}` à 70 f, clic à 80 f → coupe sur `{{home-after}}` à 84 f. Highlight `{{row1}}` 90→160 f, pastille « {{texte}} » (bottom). Sortie : coupe franche.
{{Contrainte de la source : … → conséquence : …}}

**P{{n}} · Carton outro ({{8}} s)** — 3 lignes en cascade (22 f d'écart), logo à +18 f. Tenue jusqu'à VO + 15 f.

## Textes ajoutés à l'écran — liste exhaustive

Aucun de ces textes n'existe dans la source. Inter ≥ 28 px à 1080p, contraste ≥ 4,5:1.

`{{Titre}}` · `{{Sous-titre}}` · `{{pill 1}}` · `{{pastille P01}}` · … · `{{outro 1}}` · `{{outro 2}}` · `{{outro 3}}`

{{n}} de ces textes citent la source mot pour mot : {{lesquels, d'où}}.
