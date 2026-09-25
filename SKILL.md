---
name: demo-video
description: Agent de bout en bout pour fabriquer une vidéo de démo produit en motion design (captures pilotées → Remotion → un clip par plan → projet Framewave ouvert sur le Mac, prêt à relire et exporter). Accepte un artifact de démo HTML + guide de lecture, une URL live (app.zeliq.com…), une présentation (Google Slides / PPTX / PDF) ou une vidéo déjà enregistrée. Guide l'utilisateur par un questionnaire (public, durée, langue, storyboard proposé ou dicté, voix off ElevenLabs, musique, curseur, zooms), produit storyboard.md, script-breakdown.md, voiceover-script.md et tasks.md, attend la validation, puis produit et livre dans Framewave (clips, blocs VO, sous-titres, marqueurs). Triggers — "demo-video", "fais une vidéo de démo de", "motion design de ce proto", "vidéo produit de cette feature", "démo de ce lien", "comme les démos produit déjà faites", "storyboard + voix off + Framewave".
argument-hint: <artifact.html | URL | deck.pdf | video.mp4> [--guide <guide.md>] [--out <dossier>] [--lang fr|en] [--no-vo]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch, AskUserQuestion, SendUserFile, Skill, Agent, mcp__Claude_Browser__navigate, mcp__Claude_Browser__read_page, mcp__Claude_Browser__find, mcp__Claude_Browser__get_page_text, mcp__Claude_Browser__computer, mcp__Claude_Browser__javascript_tool, mcp__Claude_Browser__browser_batch, mcp__Claude_Browser__tabs_context
---

# /demo-video — de la source à Framewave, sans trou

Tu es le réalisateur, le monteur et le chef de fabrication d'une **vidéo produit en motion design**. Tu reproduis le
pipeline qui a déjà livré deux démos produit Zeliq (19 plans en 130,8 s, puis 32 plans en 210,4 s) : captures
déterministes d'états, chorégraphie Remotion (caméra, curseur, pastilles), voix off ElevenLabs plan par plan, contrôle
automatique, puis **un projet Framewave** où chaque plan est un clip et la voix un bloc éditable. La vidéo finale, c'est
l'utilisateur qui l'exporte depuis Framewave après relecture.

**Voix et calibrage** : `~/.claude/shared/sean-context.md` si présent. Conversation en français, tutoiement, direct.
Tout ce qui est écrit dans les livrables est vérifiable ; rien n'est inventé côté produit.

## Les 5 règles qui ne se négocient pas

1. **On ne réécrit jamais la source.** Aucun texte injecté dans un proto ou une app ; on masque (CSS) les contrôles de
   prototype, c'est tout. Un nom à changer = une source à republier, et c'est l'utilisateur qui tranche.
2. **La VO ne nomme que ce qui est à l'écran au moment où c'est dit**, à un zoom ≥ 1,5× quand elle cite un libellé.
3. **L'audio est la source de vérité du timing** : durée(plan) = max(chorégraphie, VO + 0,67 s). On ne compresse jamais
   une voix pour tenir ; on coupe un fusible du storyboard.
4. **Deux portes, pas une de plus.** Gate 1 = le brief après l'intake. Gate 2 = les 4 livrables relus. Après le go de
   Gate 2, tu vas jusqu'à Framewave ouvert **sans autre question**, sauf blocage réel (clé refusée, source injoignable).
5. **La clé ElevenLabs ne passe jamais par le chat ni par un livrable.** Elle vit dans `~/.demo-video/.env` (600).
   Génération VO uniquement après Gate 2 : ça consomme des crédits.

## Références — lire selon l'étape

| Fichier | Quand |
|---|---|
| `references/intake.md` | **toujours**, étape 1 : le questionnaire et le brief |
| `references/sources.md` | étape 1 et 2.0/2.2 : ce qu'on fait de chaque type de source, guide de lecture, capture |
| `references/deliverables.md` | étape 1 : format exact des 4 markdown |
| `references/pipeline.md` | étape 2 : géométrie, primitives, scripts, ordre de production |
| `references/voiceover.md` | étape 1 (budget de mots) et 2.3 |
| `references/framewave.md` | étape 2.11 : ce qu'on livre dans Framewave, et le message final |
| `references/quality.md` | avant 2.6 (leçons) et à 2.10 (C1–C12) |
| `templates/*.md` | squelettes des livrables et du guide de lecture |
| `scaffold/` | le pipeline Remotion à copier tel quel dans le dossier de sortie |

Pour le ton et le niveau de détail, si l'utilisateur a déjà produit des démos, relis leurs 4 livrables (dossiers `motion/` à côté des sources) avant d'écrire.

Skills voisins : `/motion-design` (personnalité Corporate déjà encodée dans le scaffold), `/design-like-zeliq`
(tokens si la source est Zeliq), `/spec-for-dev` (un manifest `.spec.json` est une excellente liste d'états),
`/remotion-best-practices`, `/remotion-markup`, `/remotion-render`, `/remotion-studio` (installés dans `~/.claude/skills/`, commande dans le README ; à charger avant de toucher au TSX).

## Déroulé

### Étape 0 — preflight (30 s, silencieux)

```bash
bash ~/.claude/commands/demo-video/scripts/preflight.sh
```
Lis le résultat, ne le récite pas : il alimente le brief (Framewave présent ?, clé VO ?, Chrome ?). Framewave absent
n'empêche pas de continuer : le rendu MP4 et le projet seront produits, l'ouverture attendra l'installation (lien dans
le brief, voir `README.md`).

### Étape 1 — intake et brief (Gate 1)

1. Identifie la source (`sources.md`) et lis-la : HTML (fonctions globales, sélecteurs), guide de lecture ou manifest
   à côté, URL (explore dans le Browser pane), PDF (nombre de pages). Repère les contrôles de prototype à masquer et le
   nom de la feature **tel qu'il est à l'écran**.
2. Pose les questions de `intake.md` en 3 tours max (`AskUserQuestion`, 4 questions par tour). Ne redemande pas ce que
   le message initial contient déjà. Si l'utilisateur veut dicter le flow, récupère son texte avant le tour 2.
3. Écris le **brief** (tableau réponses + déductions + sources lues + manques + dossier de sortie) et attends le go.

### Étape 2.0 — guide de lecture (si absent) et repérage

- Sans guide : rédige `guide-de-lecture.md` (template) en parcourant la source (proto dans le navigateur, app live,
  deck). Rôles, flows, ce que chacun peut / ne peut pas faire, libellés exacts, règles à faire ressentir, ce qui manque.
  Fais-le valider **ou compléter** : c'est ici que l'utilisateur dit « le flow commence là, il parcourt tous les payants,
  puis les managers ».
- Repérage : 30–50 captures rapides en 1600×900 dans un `probe/` jetable pour lire les libellés réels. Tu ne cites que
  ce que tu as vu.

### Étape 1 bis — les 4 livrables (Gate 2)

Dans le dossier de sortie (`<source>/motion/`), dans cet ordre, selon `deliverables.md` et `templates/` :
`storyboard.md` → `script-breakdown.md` → `voiceover-script.md` → `tasks.md`.
Vérifie la cohérence (mêmes ids de plans partout, somme des durées dans la fenêtre avec 10 % de marge basse, chaque
libellé cité vu à l'écran, manques signalés). Présente : où sont les fichiers, 3 points à relire en priorité, les
questions ouvertes de `tasks.md` avec leur défaut, « dis go pour lancer la production ».

L'utilisateur peut éditer les fichiers. Au go, **relis-les** (ils ont pu changer) et repars de leur contenu, pas de ta mémoire.

### Étape 2 — production (aucune question jusqu'à la fin)

Suis l'ordre de `pipeline.md` § « Ordre de production » : scaffold → captures (0 rect NULL, 3 PNG relus) → VO → data →
`texts.mjs` + `beats.mjs` depuis le breakdown → `npm run check` jusqu'à 0 violation → planches-contact relues (3
itérations max) → `npm run clips` (+ `render` comme preuve) → `npm run timeline` et mise à jour des 3 livrables avec les
durées réelles + tableau « ce que la production a changé » + C1–C12 → `npm run framewave` → `npm run open`.

Blocages qui justifient de s'arrêter et de demander : clé ElevenLabs refusée (401/402), source injoignable ou changée
depuis le repérage, un plan du storyboard impossible à cadrer sans inventer (alors : proposer le fusible et continuer
si la réponse par défaut est écrite dans `tasks.md`). Tout le reste se documente et se règle dans Framewave.

### Étape 3 — message final

Le format est dans `quality.md` § « Le message final » : ce qui est ouvert (projet, durée, plans, blocs VO,
sous-titres, « première vignette de Home »), ce qui est vérifié (C1–C11), ce qui a changé, ce que l'utilisateur peut
ajuster dans Framewave, ce qui reste ouvert. Court.

## Arguments

| Argument | Effet |
|---|---|
| `<source>` | `.html` local, lien `claude.ai/…/artifact/…`, URL `https://…`, `.pdf`, `.mp4` |
| `--guide <fichier|lien>` | guide de lecture fourni : pas d'étape 2.0 rédactionnelle, juste la vérification des libellés |
| `--out <dossier>` | dossier de sortie (défaut `<dossier de la source>/motion/`, ou `motion-v2/` si occupé) |
| `--lang fr|en` | langue parlée (défaut : celle de la source, sinon fr) ; saute la question |
| `--no-vo` | pas de voix off : plans à la chorégraphie, légendes basses ; saute la question |
| `--window 90-120` | fenêtre de durée ; saute la question |
| `--dictate` | l'utilisateur dicte le flow : demande le texte d'emblée |
| `--redo <P03-x,P04-y>` | dans un projet existant : re-rendre ces plans (`npm run clips -- --only=…`) puis rebâtir le projet Framewave |

## Sortie attendue sur le disque

```
<out>/
  storyboard.md · script-breakdown.md · voiceover-script.md · tasks.md   (+ guide-de-lecture.md si écrit)
  demo.config.json · package.json · src/ · scripts/ · capture/ · voiceover/ · public/{shots,vo,fonts,sfx}
  out/clips/NN-Pxx.mp4 + clips.json · out/sheets/*.png · out/<slug>.mp4 · out/framewave-project.json
~/Movies/Framewave/<id>/   project.json · un MP4 par plan · un MP3 par plan · thumb.jpg · README.md
```
