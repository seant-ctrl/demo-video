# {{Nom du proto / de l'app}} — guide de lecture

> Écrit par /demo-video le {{JJ/MM}} à partir de {{fichier / URL}}, version {{…}}. **À valider ou compléter avant le storyboard** : c'est ce document qui dit quels flows la vidéo doit parcourir.
> Ce que je n'ai pas pu vérifier est marqué ⚠️. Ce que tu veux imposer (point d'entrée, ordre, ce qu'il faut absolument montrer ou éviter) va dans la section « Consignes ».

## Consignes ({{à remplir par toi}})

- Point d'entrée : {{…}}
- Rôles / plans à parcourir, dans l'ordre : {{…}}
- À montrer absolument : {{…}}
- À éviter : {{…}}

## Ce que la source expose

| Levier | Où | Valeurs |
|---|---|---|
| Rôles / modes | `{{setRole(id)}}` / sélecteur `{{#role}}` | {{admin, manager, commercial}} |
| Navigation | `{{gotoScene(id)}}` / URLs | {{home, mailboxes, domain, sequence}} |
| États | `{{openModal(id)}}`, `{{preview(key)}}`, classes `{{.is-open}}` | {{…}} |
| Contrôles de prototype à masquer | `{{.proto-bar, .toast-zone, #lang-switch}}` | visibility:hidden au capture |

## Rôle · {{Nom du rôle 1}} ({{« libellé tel qu'à l'écran »}})

### Ce qu'il peut faire

| # | Flow | Écrans / états | Libellés clés (tels qu'à l'écran) | Règle produit que ça illustre |
|---|---|---|---|---|
| 1 | {{…}} | {{scene → modal → toast}} | « {{…}} », « {{…}} » | {{…}} |

### Ce qu'il ne peut pas faire (et comment l'écran le dit)

| # | Limite | Ce qu'on voit | Libellé |
|---|---|---|---|
| 1 | {{…}} | {{onglet verrouillé, carte floutée}} | « {{…}} » |

## Rôle · {{Nom du rôle 2}}

{{idem}}

## Les règles à faire ressentir (candidates pour l'outro et les pastilles)

1. {{Règle, formulée comme la source la formule}}
2. {{…}}

## Ce qui n'est pas dans la source ⚠️

- {{Flow ou écran absent, état simulé, action hors produit}} → la vidéo {{le dit au conditionnel / ne le montre pas}}.
