# Les 4 livrables markdown — format, contenu, exigences

Ils sont écrits dans cet ordre, dans le dossier de sortie, **avant toute production**. L'utilisateur les relit et les
modifie ; l'agent ne lance la production qu'après un « go » explicite (Gate 2). Après production, ils sont **mis à jour
avec les durées réelles** (étape 2.10) : un livrable qui dit « 8 s estimées » quand le MP3 fait 6,9 s est faux.

Les squelettes sont dans `templates/`. Si des démos ont déjà été produites sur la machine, leurs livrables
(dossiers `motion/` à côté des sources) sont la meilleure référence de ton et de niveau de détail : les lire avant d'écrire.

Ton : celui de `~/.claude/shared/sean-context.md`. Français, tutoiement, direct, pas d'intro ni de conclusion. Chaque
affirmation sur la source est vérifiable (« relevé à l'écran », « ligne 412 du proto », « section Manager du guide »).

## 1. `storyboard.md` — ce qu'on montre et pourquoi

Le document de décision. Un lecteur qui ne lit que lui sait ce que sera le film.

| Section | Contenu obligatoire |
|---|---|
| En-tête (blockquote) | format (1920×1080 · 30 fps · H.264 + AAC), **fenêtre de durée** et durée rendue (mise à jour en 2.10), public, sujet en une phrase, **sources** avec identifiants/dates/versions |
| Ce que j'ai vérifié à l'écran | combien d'états capturés en repérage, les constats qui conditionnent le film (contrôles de proto à masquer, nom de la feature, libellés réels), 3 à 5 puces |
| Brief de l'utilisateur | s'il a dicté le flow : son texte tel quel, puis comment le storyboard y répond |
| Inventaire par rôle / partie | tableaux **Retenu** (flow source → plans → pourquoi) et **Écarté** (flow → pourquoi, et « premier plan à réintégrer si… ») |
| Ce que les sources ne contiennent pas — signalé, pas comblé | liste numérotée : chaque écran/état absent, ce que fait le film à la place (VO au conditionnel, plan coupé), **jamais un écran inventé** |
| Storyboard | tableau `# · Durée · Écran source (état) · Action montrée · Texte à l'écran (ajouté) · Intention`. P00 = titre, dernier = outro, cartons de rôle si 2 parties. Durée = estimation puis réelle |
| Fusibles | 3 plans à couper en priorité si la VO déborde, avec leur gain en secondes, « aucun ne casse le fil » |
| Rythme et lisibilité | plan le plus court, max d'infos par plan, nombre de pastilles, politique de raccords, règle « la VO ne nomme que ce qui est à l'écran, zoom ≥ 1,5× sur le texte cité » |
| Marque (si hors Zeliq) | couleurs, polices, logo utilisés |

Règles : le nombre de plans découle de la fenêtre (≈ 1 plan / 6–8 s en produit-marketing) ; une **intention par plan** ;
les cartons de rôle sont des plans (3 s) ; le nom de la feature est **vérifié dans les sources**, pas déduit.

## 2. `script-breakdown.md` — ce que la composition fait à l'image, plan par plan

Le document de fabrication. Assez précis pour que `beats.mjs` en découle mécaniquement.

| Section | Contenu obligatoire |
|---|---|
| Géométrie et pipeline | tableau : capture (viewport, dpr, K), plateau (z = 0,90 → 1728×972), clamp caméra (MARGIN, côtés interdits), masquage au capture (**aucun texte injecté**), compo, motion (personnalité, easing, durées), typo/couleurs, textes ajoutés (taille, fond, contraste), audio (durée = max(chorégraphie, VO + 20 f)), raccords, contrôle automatique |
| Captures à produire | tableau `Shot · Rôle · Setup (appels de fonctions / steps) · Rects` + hauteurs de capture spéciales. Chaque shot = un état atteignable, vérifié |
| Plan par plan | un paragraphe **P00…Pn** : shots utilisés, caméra (z, ancre, timings en frames ou secondes), curseur (trajet, clic), highlights (rect, from/to), pastilles/légendes (texte, côté), raccord de sortie. Les contraintes de la source (« la ligne fait 1572 px : aucun zoom ne garde nom + badge + interrupteur ») sont écrites **avec leur conséquence** |
| Textes ajoutés — liste exhaustive | tous les textes qui n'existent pas dans la source, Inter ≥ 28 px, et lesquels citent la source mot pour mot |

Notation : `z` échelle, `→` déplacement en 600 ms, `ancre` rect centré, frames @30fps, `+VO` = le plan s'étire si l'audio dépasse.

## 3. `voiceover-script.md` — la voix, alignée sur l'image

| Section | Contenu obligatoire |
|---|---|
| En-tête | langue parlée et langue de référence (décision de l'intake), voix / modèle / réglages ElevenLabs, règle « l'audio est la source de vérité », **débit mesuré** après génération (mots/s) |
| Script parlé | tableau `# · TC début · TC fin · Plan · VO réelle · Silence · Mots · Texte · Visible à l'écran quand la phrase est dite`. La colonne « visible » est la garantie C8 : la voix ne décrit jamais une action absente de l'image |
| Script de référence (autre langue) | même découpage, colonne mots, non généré |
| Total | mots, secondes de parole, % de temps parlé (viser 65–80 %) |
| Notes de diction | nombres en lettres, apostrophes typographiques, `previous_text`/`next_text`, noms de produit non traduits, ce qu'on ne dit pas (valeurs de records, montants…) |

Budget : **FR 2,4 mots/s, EN 2,6 mots/s** (mesuré sur George). Phrase par plan : 6 à 19 mots, jamais deux idées neuves.
Sans VO (intake) : le fichier existe quand même avec le texte des légendes/pastilles par plan et « (pas de voix) » en en-tête.

## 4. `tasks.md` — le plan de production et ses preuves

| Section | Contenu obligatoire |
|---|---|
| État | où on en est (étape 1 = livrables écrits ; étape 2 = production ; ✅ par tâche) |
| Ordre et dépendances | tableau `# · Tâche · Dépend de · Sortie` : 2.0 guide/repérage · 2.1 scaffold · 2.2 captures · 2.3 VO · 2.4 mesure · 2.5 recalage · 2.6 chorégraphie · 2.7 check · 2.8 planches QA · 2.9 rendu + clips · 2.10 mise à jour des livrables · **2.11 projet Framewave + ouverture** |
| Scripts | la liste des `npm run …` du projet |
| Ce que la production a changé par rapport au cadrage | tableau `Point · Cadrage · Réalité, et pourquoi` (rempli en 2.10) |
| Exceptions `text:false` | liste des plans où un texte à l'écran est sous 1,5× **parce que l'élément est plus large que la zone de sécurité**, jamais parce que la VO le cite |
| Critères de réussite C1 → C12 | tableau avec le résultat vérifié sur le fichier rendu (voir `quality.md`) |
| Tranché | les décisions prises par l'utilisateur (intake, Gate 1, Gate 2) avec leur date |
| Reste ouvert / À trancher | questions numérotées, chacune avec la réponse par défaut si l'utilisateur ne répond pas |

## Ce que l'agent vérifie avant de présenter les 4 fichiers (Gate 2)

- Chaque plan du storyboard a son paragraphe dans le breakdown et sa ligne dans le script VO : **même id, même ordre**.
- Chaque libellé entre guillemets a été vu à l'écran (repérage) ou lu dans le guide.
- Somme des estimations dans la fenêtre, avec 10 % de marge basse (la VO réelle s'étire plus souvent qu'elle ne raccourcit).
- Aucun écran inventé ; les manques sont dans la section dédiée du storyboard.
- Le message de présentation dit : les 4 fichiers, où ils sont, ce qu'il faut relire en priorité (3 points), les questions ouvertes de `tasks.md`, et « dis go pour lancer la production ».
