# Qualité — critères, rythme, leçons

## Les 12 critères (C1 → C12), vérifiés sur le fichier rendu et écrits dans `tasks.md`

| # | Critère | Comment on le prouve |
|---|---|---|
| C1 | 1920 × 1080, 30 fps, H.264, piste AAC (ou le format décidé à l'intake) | `ffprobe` (embarqué Remotion) sur `out/demo.mp4` ou sur un clip |
| C2 | Durée dans la fenêtre de l'intake | `npm run check` (TOTAL) et `npm run timeline` |
| C3 | Zone de sécurité 5 % respectée **à chaque frame**, animations comprises | `npm run check` : 0 violation ; le clamp caméra interdit haut/gauche par construction |
| C4 | Aucun écran tronqué par accident | chaque recadrage est déclaré dans le breakdown avec sa raison ; les plans larges sont à 0,90 |
| C5 | Texte ajouté ≥ 24 px à 1080p, contraste ≥ 4,5:1 | pastilles 28, légendes 30, cartons 44–124 ; blanc sur accent / grey1000 |
| C6 | Aucun plan sous 1,5 s | `check` (MIN_BEAT = 45 f) ; en pratique le plus court est un carton de rôle à 3 s |
| C7 | ≤ 3 informations neuves par plan, ≤ 3 pastilles, jamais 2 légendes à la fois | `check` compte les pastilles ; la relecture des planches fait le reste |
| C8 | La VO ne décrit jamais une action absente de l'image | colonne « visible à l'écran » du script VO, relue **après** recalage |
| C9 | Texte d'UI cité par la VO à un zoom ≥ 1,5× | `check` (MIN_TEXT_Z) ; exceptions `text:false` listées et justifiées (élément plus large que la zone de sécurité) |
| C10 | Zéro écran, libellé ou fonctionnalité inventé ; zéro texte réécrit dans la source | le harnais n'injecte que du CSS de masquage ; la liste exhaustive des textes ajoutés est dans le breakdown |
| C11 | L'audio est la source de vérité du timing | `durée(plan) − durée(VO)` entre 0,5 et ~3 s sur tous les plans, jamais négatif (`npm run timeline`) |
| C12 | Compréhensible en une lecture | les 5 phrases que le spectateur doit pouvoir dire après le film, écrites dans `tasks.md`, à valider par l'utilisateur |

## Rythme

- **Un plan = une intention.** Si un plan a besoin de deux pastilles qui ne parlent pas de la même chose, c'est deux plans.
- Cadence produit-marketing : 6–9 s par plan d'écran, 3 s par carton de rôle, titre 5–9 s, outro 7–11 s.
- Mouvement de caméra : 600 ms, puis **tenir ≥ 1 s**. Deux mouvements enchaînés sans tenue = le spectateur ne lit rien.
- Curseur : arrive, s'arrête 200–400 ms, clique. Jamais de trajet pendant qu'une pastille entre.
- Pastille : entre 4 f après le highlight, reste ≥ 1,5 s, sort avant le mouvement de caméra suivant.
- Coupe franche entre états d'un même écran ; fondu 12 f entre parties et autour des cartons ; rien d'autre.
- Silence de fin de plan : 0,5–2,5 s. Au-delà, le plan est trop long pour sa phrase.

## Leçons des deux premières démos (à relire avant d'écrire la chorégraphie)

| Leçon | D'où elle vient |
|---|---|
| Un fondu entre deux captures du même écran **dédouble le texte** (« Actif » + « En pause » lisibles ensemble) → coupe franche | Démo 1 · P13 |
| Un élément à < 30 px du bord du plateau ne supporte **aucun** zoom : plan large + pastille pour porter le nom | Démo 1 · P01 (entrée sidebar à 23 px) |
| Une ligne de 1 572 px (nom + badge + interrupteur) n'a aucun zoom qui garde les trois : ligne entière à 1,05 + légende | Démo 1 · P13 |
| Un toast qui entre au clic peut être **coupé** par le zoom : cliquer sur l'état sans toast, reculer, puis montrer le toast | Démo 1 · P12 |
| Le débordement caméra doit être **asymétrique** : autorisé côté fond page, interdit côté topbar/sidebar blanches | Démo 1 (MARGIN 340) |
| Un plateau plus haut que 1080 n'a pas de plan « page entière » : le haut ou le bas est coupé, choisir 900 quand tout tient | Démo 2 · P29 |
| Une modale de 520 × 660 css ne tient pas à 1,5 : la montrer entière à ~1,17 (`text:false`) puis zoomer les blocs cités | Démo 2 · P06, P13 |
| Les toasts d'action doublent des accusés de réception déjà à l'écran : masquer toute la zone de toast | Démo 2 |
| Le nom de la feature n'apparaît parfois **nulle part** dans l'UI : le carton porte le nom du brief, et c'est une décision de l'utilisateur, pas de l'agent | Démo 2 (nom du brief ≠ titre de la page) |
| Deux états qui se contredisent (« désactivé » ici, « en cours » là) ne peuvent pas être dans le même film : écarter l'un et le dire | Démo 2 |
| George lit à 2,42 mots/s, pas 2,3 : le film sort 8 % plus court qu'estimé → prévoir la marge basse de la fenêtre | les deux |
| La clé API dans le chat = à révoquer. Elle vit dans un `.env` 600 | les deux |
| « Sept flows » annoncés, six titrés : un écart dans la source se **signale**, on ne le comble pas | Démo 1 (guide) |
| Une action faite hors du produit, une validation d'équipe, la réception côté admin se passent **hors écran** : la VO le dit au conditionnel de fait, aucun écran n'est inventé | Démo 2 |

## Relecture des planches-contact (étape 2.8)

Une planche = 24 vignettes (4 × 6) à 3 s d'intervalle. On la lit (`Read`) et on cherche, dans l'ordre :
1. un texte coupé par le bord (pastille, légende, libellé zoomé) ;
2. un curseur qui n'est pas sur sa cible au moment du clic ;
3. deux états superposés (fondu mal placé) ;
4. une vignette « vide » (plateau gris sans écran : shot `at` trop tard, ou caméra hors plateau) ;
5. une pastille présente sur deux vignettes consécutives sans que la caméra ait bougé (elle reste trop longtemps) ;
6. un emoji en tofu.
Chaque défaut → correction dans `beats.mjs` → `npm run check` → nouvelle planche pour la zone concernée (`Sheet2` si c'est
entre 72 s et 144 s). Trois itérations maximum avant de rendre ; le reste se corrige dans Framewave.

## Le message final (après ouverture de Framewave)

Cinq blocs, court :
1. **Ce qui est ouvert** : nom du projet, durée, nombre de plans / blocs VO / sous-titres, « première vignette de Home ».
2. **Ce qui a été vérifié** : C1–C11 en une ligne chacune, C12 en question.
3. **Ce que la production a changé** par rapport au cadrage (3 points max, le reste est dans `tasks.md`).
4. **Ce que tu peux ajuster dans Framewave** (les 5 puces de `framewave.md`).
5. **Reste ouvert** : les questions de `tasks.md`, avec la réponse par défaut.
Pas de « n'hésite pas », pas de récapitulatif de ce qui a été fait tâche par tâche.
