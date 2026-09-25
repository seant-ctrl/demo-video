# Intake — le questionnaire guidé

Le but : sortir de l'intake avec un **brief complet** que l'utilisateur valide en une lecture (Gate 1), et dont chaque
réponse alimente directement `demo.config.json`, les 4 livrables markdown et les questions de `tasks.md`.

Règles de conduite :
- **Détecter avant de demander.** Type de source, Framewave installé, clé ElevenLabs, Chrome, node : c'est le preflight
  qui le dit (`scripts/preflight.sh`), pas une question.
- **Une question = une décision qui change le film.** Pas de question dont la réponse a un défaut évident.
- `AskUserQuestion` prend 4 questions max par appel → **3 tours** au plus, dans l'ordre ci-dessous. Chaque option a une
  description qui dit ce que ça change. L'option recommandée est en premier avec « (Recommandé) ».
- Quand la source impose une réponse (ex. slides → pas de curseur), on ne pose pas la question, on l'écrit dans le brief.
- Si l'utilisateur a déjà donné une info dans son message (« 90 secondes, en anglais »), on ne la redemande pas.

## Tour 0 — ce qu'on déduit tout seul

| Détecté | Comment | Conséquence |
|---|---|---|
| Type de source | extension / URL / dossier (voir `sources.md`) | branche de capture, questions du tour 3 |
| Guide de lecture présent ? | `.md` à côté de l'artifact, lien claude.ai fourni, manifest `.spec.json` à côté | si absent : proposer d'en écrire un (tour 3) |
| Framewave installé | `/Applications/Framewave.app` | sinon : lien d'install dans le brief, on continue quand même (le rendu MP4 existe) |
| Clé ElevenLabs | env, `./.env`, `~/.demo-video/.env` | sinon : la question VO propose « script seul » ou demande où mettre la clé (jamais dans le chat) |
| Marque | source Zeliq (tokens, app.zeliq.com, proto DS) → défauts du scaffold | sinon question « marque » au tour 2 |
| Dossier de sortie | `<dossier de la source>/motion/` (ou `motion-v2/` si `motion/` existe) | affiché dans le brief |

## Tour 1 — cadrage (4 questions)

1. **Public et intention** — `Produit / marketing (Recommandé)` · `Onboarding client` · `Sales / prospect` · `Interne / handoff équipe`
   → change la voix (promesse vs mode d'emploi), la densité (≤ 3 infos par plan en marketing), les cartons.
2. **Durée cible** — `60–90 s` · `90–120 s (Recommandé)` · `120–180 s` · `180–240 s`
   → devient `window` dans `demo.config.json` et le budget de mots (2,4 mots/s en FR, 2,6 en EN) qui borne le script VO.
   Pour un flow à 2 rôles ou plus, recommander 180–240.
3. **Langue** — `Français (VO FR, UI telle qu'elle est)` · `Anglais` · `FR parlée + script EN en référence` · `Les deux (2 rendus)`
   → `lang`, fichier `script-<lang>.json`, colonne de référence dans `voiceover-script.md`.
4. **Le storyboard, qui le décide ?** — `Claude propose depuis la source (Recommandé)` · `Je dicte le flow` · `Mix : je donne l'ordre des étapes, Claude découpe`
   → si « je dicte » ou « mix » : demander en texte libre, **avant le tour 2**, le flow attendu (point d'entrée, rôles ou plans
   à parcourir, ce qu'il faut absolument montrer, ce qu'il faut éviter). Le coller tel quel dans le storyboard, section « Brief ».

## Tour 2 — son et image (4 questions)

1. **Voix off** — `ElevenLabs, générée (Recommandé si clé)` · `Script seulement, pas de génération` · `Pas de voix off`
   → `voiceover`, tâche 2.3, et le mode de timing : avec VO l'audio est la source de vérité ; sans VO chaque plan dure sa chorégraphie.
   Sans clé détectée, ne pas proposer la génération : proposer « script seulement » et dire où poser la clé (`~/.demo-video/.env`).
2. **Musique** — `Aucune (Recommandé)` · `Un fichier que je fournis` · `Libre de droits, je choisis dans Framewave`
   → si fichier : demander le chemin, `framewave.music`, volume 0,12 sous une VO (0,25 sans VO). L'agent ne génère ni ne télécharge de musique.
3. **Curseur et clics** — `Curseur synthétique + son de clic (Recommandé pour une app)` · `Curseur sans son` · `Aucun curseur`
   → `cursor`, `sfxClick`. Slides → forcé à « aucun », pas de question.
4. **Zooms** — `Dans l'image, calés sur la VO (Recommandé)` · `Éditables dans Framewave (clips à plat)`
   → `zooms: 'baked' | 'framewave'`. Le second mode perd la vérification automatique du zoom ≥ 1,5× sur le texte cité, le dire.

## Tour 3 — spécifique à la source (≤ 4 questions, voir `sources.md`)

**Artifact / prototype HTML**
- Guide de lecture absent → `Claude écrit un guide de lecture depuis le proto et tu le valides (Recommandé)` · `Je te le donne (lien ou fichier)` · `On se passe de guide`
- Rôles / plans à couvrir → options tirées du proto (`setRole`, sélecteur de plan) : `Un seul rôle : …` · `Deux rôles en deux parties` · `Tous`
- Contrôles de prototype à masquer → proposer ce qu'on a repéré (barre de version, switch de rôle, zone de toast) ; masquer, jamais réécrire
- Nom exact de la feature → le proposer tel qu'il est à l'écran ; si le brief dit autre chose, poser la question (leçon d'une démo précédente)

**URL live**
- Connexion → `Je me connecte une fois dans une fenêtre Chrome (Recommandé)` · `Page publique, rien à faire`
- Compte / données à l'écran → `Compte démo dédié` · `Mon compte, masquer ce qui est perso` : demander quoi masquer (noms, emails, montants) → sélecteurs `hide` du harnais
- Pages du parcours → texte libre : l'agent les explorera avec le navigateur pour écrire le guide de lecture
- Viewport → `1600 css (Recommandé)` · `1440` · `1920`

**Slides**
- Format → `PDF déjà exporté` · `Google Slides (je donne le lien, export PDF)` · `PPTX / Keynote (export PDF via le skill pptx)`
- Rythme → `Une slide = un plan (Recommandé)` · `Claude regroupe / découpe selon le contenu`
- Zooms dans les slides → `Oui sur les chiffres et schémas` · `Slides plein cadre uniquement`

**Vidéo déjà enregistrée** (mp4 de Framewave ou autre)
- Ce qu'on fait dessus → `Découpage en plans + VO + sous-titres (Recommandé)` · `VO et sous-titres seulement` → pas de Remotion : Framewave direct (voir `sources.md`)

## Tour 4 (optionnel) — marque et sortie, seulement si la source n'est pas Zeliq

- Couleurs (fond des cartons, accent, fond de page), polices (fichiers .ttf/.otf), logo (SVG blanc) → `theme.ts`, `public/`
- Cartons titre / outro → `Les deux (Recommandé)` · `Titre seul` · `Aucun (la vidéo s'ouvre sur l'écran)`
- Format → `16:9 1080p (Recommandé)` · `9:16` · `1:1` (les deux derniers : plateau à recadrer, prévenir que les rects changent)

## Le brief (Gate 1)

Un seul message, en tableau, qui reprend chaque réponse et chaque déduction, plus :
- la liste des **sources lues** (fichiers, liens, versions/dates),
- ce qui **manque** et ce qu'on fera si ça n'arrive pas (ex. « pas de guide : j'écris un guide de lecture en 2.0, tu le valides »),
- le **dossier de sortie**,
- la phrase : « Je pars là-dessus et je produis les 4 documents. Dis "go" ou corrige. »

On n'écrit pas une ligne de storyboard avant le go.
