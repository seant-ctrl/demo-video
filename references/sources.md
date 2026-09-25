# Sources — ce qu'on accepte, ce qu'il faut en plus, comment on capture

Une démo se fabrique à partir de **captures d'états** (PNG @2x) et de **rects** (les rectangles des éléments cités,
en px css). Tout le reste (caméra, curseur, pastilles, VO) est produit par Remotion. La question pour chaque source
est donc : comment j'atteins chaque état de manière déterministe, et comment je relève les rects.

## 1. Artifact de démo (HTML self-contained) + guide de lecture

C'est le cas nominal, celui des deux premières démos. Deux objets :

| Objet | Ce que c'est | Où il est |
|---|---|---|
| **Proto** | un `.html` autonome (souvent produit par `/design-like-zeliq`), avec des fonctions globales d'état (`setRole`, `gotoScene`, `openModal`, `preview(key)`…) | fichier local, ou lien `claude.ai/…/artifact/<id>` (WebFetch le lit) |
| **Guide de lecture** | un `.md` (ou artifact) qui liste, **rôle par rôle**, les flows, ce que chaque rôle peut / ne peut pas faire, les règles produit à faire ressentir, les libellés exacts | même dossier, ou lien claude.ai |
| (bonus) **Manifest spec-for-dev** | `<proto>.spec.json` : flows → états → `steps` (`call fn`, `click`, `addClass`…) déjà déterministes | à côté du proto |

**Ce qui manque le plus souvent, et ce qu'on fait :**
- *Pas de guide* → l'agent le rédige (**étape 2.0**, avant le storyboard) : il lit le HTML (fonctions globales, `data-*`,
  sélecteurs de rôle), ouvre le proto dans le navigateur (Browser pane) et parcourt chaque écran, puis écrit
  `guide-de-lecture.md` sur le modèle `templates/guide-de-lecture.md`. L'utilisateur le valide **ou le complète** :
  c'est là qu'on récupère « le flow commence ici, il doit parcourir tous les payants, puis les managers ».
- *Guide sans libellés exacts* → on capture d'abord (45 états en 1600×900 dans un dossier `probe/` jetable), on lit les
  libellés à l'écran, on cite entre guillemets uniquement ce qu'on a vu.
- *Nom de la feature différent entre brief, proto et guide* → question à l'utilisateur, jamais tranché seul. Le pipeline
  **ne réécrit aucun texte** de la source ; si le nom doit changer, c'est la source qu'on republie.
- *Contrôles de prototype visibles* (barre de version, switch FR/EN, sélecteur de rôle, toasts de debug) → `hide:[…]` du
  harnais. Masquer, jamais supprimer du DOM (les hauteurs bougeraient).

**Capture** : `capture/capture.mjs` sur une **copie locale figée** du proto (`capture/proto.html`, on note la date/version) :
Chrome headless via puppeteer-core, viewport **1600 × N css @ 2×** (N = 900 par défaut ; 1000–1200 quand deux blocs
cités doivent tenir dans un même plan), transitions et animations CSS coupées, un `shot()` par état avec ses rects.
Piloter par les **fonctions publiques** du proto ou les `steps` du manifest, jamais par des clics à l'aveugle.

## 2. Démo live depuis une URL (app.zeliq.com, staging, produit tiers)

Même harnais, deux différences : la session et la stabilité des données.

1. **Session** : `demo.config.json → capture.profileDir = "~/.demo-video/chrome-profile"`, puis `npm run login` ouvre un
   Chrome visible ; **l'utilisateur** se connecte, ferme la fenêtre. Les captures headless réutilisent ce profil.
   L'agent ne saisit jamais d'identifiants, ne lit jamais de cookies, ne stocke rien d'autre que ce profil local.
2. **Données** : un compte de démo est la bonne réponse. Sinon, `hide` sur les sélecteurs qui portent du perso
   (avatars, emails, montants) — floutage CSS (`filter: blur(6px)`) accepté quand l'élément doit rester présent.
3. **Exploration** : avant d'écrire le guide de lecture, l'agent parcourt l'app dans le Browser pane (`navigate`,
   `read_page`, `find`) pour relever les URLs de chaque page, les sélecteurs stables (`data-testid`, `aria-label`, texte)
   et les libellés. Il écrit le guide, l'utilisateur valide.
4. **Stabilité** : `waitUntil: 'networkidle2'` + attente explicite des éléments cités (`page.waitForSelector`) ; masquer les
   horodatages relatifs (« il y a 2 min ») qui changeraient entre deux captures ; un état = un `shot()`, jamais une vidéo.
5. **Interdits** : toute action irréversible dans l'app réelle (envoyer, supprimer, payer). On capture des états, on
   ne joue pas le flow pour de vrai. S'il faut un état « après envoi », on le prend sur un compte de démo ou on le signale
   dans « Ce que les sources ne contiennent pas ».

## 3. Présentation (Google Slides, PPTX, Keynote, PDF)

On passe **toujours par un PDF** : c'est le seul format qu'on rasterise proprement et de façon reproductible.

| Source | Comment obtenir le PDF |
|---|---|
| Google Slides | Fichier → Télécharger → PDF. Si le deck est partagé en lecture : `https://docs.google.com/presentation/d/<ID>/export/pdf` |
| PPTX | skill `anthropic-skills:pptx` (lecture + export), ou `soffice --headless --convert-to pdf` si LibreOffice est là |
| Keynote | Fichier → Exporter → PDF (meilleure qualité, images sans compression) |

Puis `capture.kind = "slides"`, `capture.source = "chemin/deck.pdf"`, `npm run slides` → `public/shots/slide-01.png…` +
manifest (rect `slide` = la page). Les zooms sur un chiffre ou un schéma se déclarent à la main dans `beats.mjs` avec
`d.S(x, y, w, h)` (px css relevés sur le PNG, largeur 1600).

Spécificités : pas de curseur, pas de SFX ; **un plan par slide** par défaut (le rythme d'une slide = sa VO + 0,7 s) ;
les cartons titre/outro sont souvent redondants avec la première/dernière slide → proposer de les couper ; les
animations « build » d'une slide ne sont pas dans le PDF → si une slide doit apparaître en 3 temps, il faut 3 slides
(ou 3 rects et des highlights successifs).

## 4. Vidéo déjà enregistrée (capture d'écran Framewave, Loom, mp4 quelconque)

Pas de Remotion : Framewave sait tout faire sur une vidéo continue (zooms, curseur re-dessiné s'il vient d'un
enregistrement Framewave, sous-titres Whisper, textes). Le rôle de l'agent se réduit à :
1. regarder la vidéo (extraire des stills à intervalle régulier avec le ffmpeg embarqué de Remotion, ou le lecteur),
2. écrire `storyboard.md` (découpage en plans avec timecodes) + `voiceover-script.md` (une phrase par plan, calée sur les
   timecodes) + `tasks.md`,
3. générer la VO par plan, puis construire le projet Framewave **sans clips Remotion** : un seul clip vidéo, des blocs
   audio VO placés aux timecodes, des sous-titres, des marqueurs, et des `zooms` manuels aux moments cités.
   `scripts/framewave-project.mjs` ne couvre pas ce cas ; l'agent écrit un script ad hoc sur le même modèle (voir
   `framewave.md`, il fait 60 lignes).

## 5. Ce qui n'est pas une source suffisante

- Un Figma seul : pas d'états navigables ni de libellés finaux. Passer par `/design-like-zeliq` pour en faire un proto,
  ou l'exporter en PDF et le traiter comme des slides (en le disant : ce sera une vidéo de maquettes, pas une démo).
- Une description orale du produit : on peut écrire le storyboard, pas la vidéo. Le dire au brief.
- Un compte de prod avec des vraies données clients : refuser la capture tant qu'un compte de démo ou une liste de
  masques n'est pas fournie.

## Tableau de décision rapide

| Source | Capture | Curseur | Guide de lecture | Étape 2.0 |
|---|---|---|---|---|
| Artifact + guide | `capture.mjs` (proto local) | oui | fourni | vérification des libellés |
| Artifact sans guide | idem | oui | **à écrire** | exploration + guide, validation |
| URL live | `login.mjs` puis `capture.mjs` | oui | **à écrire** | exploration navigateur + guide |
| Slides | `slides-to-shots.mjs` | non | le deck l'est | lecture du deck, découpage |
| Vidéo | aucune (stills de lecture) | déjà dedans | non | découpage aux timecodes |
