# {{Nom}} — plan de production

État : **étape 1** — les 4 livrables sont écrits, en attente de ta relecture. Dis **go** pour lancer l'étape 2 (la génération VO consomme des crédits ElevenLabs).

## Ordre et dépendances

| # | Tâche | Dépend de | Sortie |
|---|---|---|---|
| ☐ 2.0 | {{Guide de lecture / repérage : n états capturés, libellés relevés}} | go | `{{guide-de-lecture.md}}`, `probe/` |
| ☐ 2.1 | Scaffold : copie du pipeline `demo-video`, `demo.config.json`, `npm install` | go | `src/`, `package.json` |
| ☐ 2.2 | Harnais de capture : {{source}}, masques {{…}}, pilotage des {{n}} états, rects, hauteurs | 2.1 | `capture/capture.mjs`, `public/shots/*.png`, `manifest.json` |
| ☐ 2.3 | **Génération VO ElevenLabs**, un MP3 par plan, {{fr}}, {{George}} | go + clé | `voiceover/script-{{fr}}.json`, `public/vo/*.mp3` |
| ☐ 2.4 | Mesure de la durée réelle de chaque MP3 | 2.3 | `public/vo/manifest.json` |
| ☐ 2.5 | Recalage : durée(plan) = max(chorégraphie, VO + 20 f). **L'audio est la source de vérité.** | 2.4 | `npm run data` |
| ☐ 2.6 | Chorégraphie des {{n}} plans (`src/scenes/beats.mjs`), textes (`src/texts.mjs`), cartons | 2.2, 2.5 | composition `Demo` |
| ☐ 2.7 | Contrôle automatique `npm run check` : 0 violation, exceptions `text:false` justifiées | 2.6 | stdout |
| ☐ 2.8 | Planches-contact QA (`npm run sheets`), relecture : texte coupé, curseur hors cible, états superposés | 2.6 | `out/sheets/*.png` |
| ☐ 2.9 | Rendu : `npm run render` (preuve MP4) + `npm run clips` (un MP4 par plan) ; ffprobe | 2.7, 2.8 | `out/{{slug}}.mp4`, `out/clips/` |
| ☐ 2.10 | Mise à jour des 3 livrables avec les durées réelles ; critères C1 → C12 | 2.9 | ce fichier, `storyboard.md`, `voiceover-script.md` |
| ☐ 2.11 | **Projet Framewave** (`npm run framewave`) : {{n}} clips, blocs VO, sous-titres, marqueurs{{, musique}} → `npm run open` | 2.9 | `~/Movies/Framewave/<id>/` |

Scripts : `npm run capture` · `vo` (`vo:force`) · `data` · `timeline` · `check` · `sheets` · `still` · `preview` · `render` · `clips` · `framewave` · `open` · `ship`.

## Ce que la production a changé par rapport au cadrage

| Point | Cadrage | Réalité, et pourquoi |
|---|---|---|
| {{à remplir en 2.10}} | | |

Exceptions `text:false` (texte à l'écran sous 1,5× parce que l'élément est plus large que la zone de sécurité, jamais parce que la VO le cite) : {{à remplir en 2.7}}.

## Critères de réussite

| # | Critère | Résultat |
|---|---|---|
| C1 | 1920 × 1080, 30 fps, H.264, AAC | ☐ ffprobe |
| C2 | Durée dans {{60–120}} s | ☐ |
| C3 | Zone de sécurité 5 % à chaque frame | ☐ `npm run check` |
| C4 | Aucun écran tronqué par accident | ☐ recadrages déclarés dans le breakdown |
| C5 | Texte ajouté ≥ 24 px, contraste ≥ 4,5:1 | ☐ |
| C6 | Aucun plan sous 1,5 s | ☐ |
| C7 | ≤ 3 informations neuves par plan | ☐ |
| C8 | La VO ne décrit jamais une action absente de l'image | ☐ colonne « visible » relue après recalage |
| C9 | Texte cité par la VO à un zoom ≥ 1,5× | ☐ `MIN_TEXT_Z`, exceptions listées |
| C10 | Zéro écran, libellé ou fonctionnalité inventé ; zéro texte réécrit | ☐ |
| C11 | L'audio est la source de vérité du timing | ☐ `durée(plan) − VO` ∈ [0,5 ; 3] s |
| C12 | Compréhensible en une lecture | à ton jugement : (1) {{…}} (2) {{…}} (3) {{…}} (4) {{…}} (5) {{…}} |

## Tranché ({{JJ/MM}}, intake et Gate 1)

| Point | Réponse |
|---|---|
| Public | {{…}} |
| Fenêtre | {{…}} |
| Langue | {{…}} |
| Storyboard | {{proposé par Claude / dicté / mix}} |
| Voix off · musique · curseur · zooms | {{…}} |
| Nom de la feature | {{…, vérifié dans …}} |

## À trancher avant le go (réponse par défaut si tu ne dis rien)

1. {{Question}} → par défaut : {{…}}
2. {{Question}} → par défaut : {{…}}
