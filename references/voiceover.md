# Voix off — ElevenLabs, écriture, mesure

## La clé, et rien d'autre

- Cherchée dans cet ordre : `ELEVENLABS_API_KEY` (env) → `<projet>/.env` → `~/.demo-video/.env`.
- **Jamais dans le chat, jamais dans un livrable, jamais dans un log.** Si l'utilisateur la colle dans la conversation :
  la déplacer dans `~/.demo-video/.env` (chmod 600), lui dire de la révoquer et d'en générer une autre (leçon des deux
  premières démos, où la clé a traîné dans la session).
- Pas de clé → on ne pose pas de question piège : on propose « script seulement » et on indique où poser la clé.
- Génération = crédits consommés : **jamais avant le go de Gate 2**, jamais `--force` sans raison. Un texte modifié
  dans `script-<lang>.json` régénère seulement sa piste (le manifest garde le texte généré).

## Réglages qui ont fait leurs preuves

| Paramètre | Valeur | Pourquoi |
|---|---|---|
| Voix | **George** `JBFqnCBsd6RMkjVDRZzb` | catalogue par défaut (disponible sur le plan Free), multilingue, lit un français propre. Les voix de bibliothèque partagée renvoient **402** sur Free |
| Modèle | `eleven_multilingual_v2` | prosodie stable, `language_code` respecté |
| `voice_settings` | stability 0,55 · similarity 0,75 · style 0,25 · speed 1,0 · speaker boost | un ton posé, sans emphase marketing |
| `previous_text` / `next_text` | toujours | la prosodie enchaîne d'un plan au suivant au lieu de repartir à plat à chaque MP3 |
| Sortie | `mp3_44100_128`, un fichier **par plan** | c'est ce qui permet le recalage plan par plan et les blocs Framewave |
| Mesure | `afinfo` (macOS), sinon `ffprobe` | la durée mesurée fixe le plancher du plan |

Voix française native, autre langue, autre voix : `ELEVEN_VOICE_ID`, `ELEVEN_MODEL`, `ELEVEN_LANG`, ou `voice:{id, model, speed, settings}`
dans `demo.config.json`. Vérifier avec `--only=p00` avant de lancer toute la série.

## Écrire le script

Débit mesuré sur George : **FR 2,42 mots/s, EN ≈ 2,6 mots/s**. Budget par plan = `(durée visée − 0,7 s) × débit`.
Viser **65–80 % de temps parlé** sur le film : en dessous, ça flotte ; au-dessus, on ne lit plus les pastilles.

Règles d'écriture (toutes vérifiées sur les deux démos) :
1. **Une phrase nomme uniquement ce qui est à l'écran au moment où elle est dite** (colonne « visible » du script).
   Si la caméra montre le bouton à 2,0 s, le mot « bouton » ne peut pas tomber à 0,8 s.
2. Une idée neuve par phrase, 6 à 19 mots. Deux phrases courtes valent mieux qu'une longue.
3. Les libellés d'UI cités sont **tels qu'à l'écran** (« Round-robin équipe », pas « la répartition en round robin »),
   et le zoom est ≥ 1,5× à ce moment-là.
4. Nombres **en lettres** (« quatre-vingts », pas « 80 ») : le TTS hache les chiffres. Exception : les identifiants qui
   sont à l'écran et qu'on épelle exprès.
5. Apostrophes typographiques (’) dans le JSON : la liaison est plus nette.
6. Noms de produit et d'agents jamais traduits (noms d'agents, de modules, de la feature elle-même).
7. Ce qu'on **ne dit pas** : les valeurs de records DNS, les montants réels, les noms de vrais clients, une durée promise
   (« en quelques secondes ») que le produit ne garantit pas. Le conditionnel de fait pour les états simulés (« quand les
   enregistrements sont visibles… »).
8. Le carton titre dit le nom et la promesse en une phrase ; l'outro dit les 2–3 règles qui expliquent tout ce qu'on a vu,
   puis le nom.
9. Tutoiement en FR si la source tutoie (Zeliq tutoie) ; sinon vouvoiement, cohérent d'un bout à l'autre.

## Après génération (étape 2.4–2.5)

- `npm run vo` imprime `TOTAL VO … mots/s`. Si le débit s'écarte de plus de 10 % de l'estimation, recalculer la durée
  totale (`npm run timeline`) **avant** d'écrire la chorégraphie.
- Plans « audio-driven » (VO + 0,67 s > chorégraphie) : la fin du plan est une image stable. Plans « choreo-driven » :
  le silence de fin sert à lire les pastilles ; s'il dépasse 3 s, la phrase est trop courte ou le plan trop long.
- Si le total sort de la fenêtre : couper un **fusible** du storyboard (jamais accélérer la voix au-delà de 1,05).

## Sans voix off

`voiceover:false` : les plans durent leur chorégraphie (`min`), ≥ 4 s par écran neuf, ≥ 1,5 s minimum absolu. Les
légendes basses (`captions` de `Beat`) portent alors le message d'un plan : une par plan maximum, 30 px, ≤ 12 mots.
`voiceover-script.md` existe quand même : c'est là que sont les textes des légendes, plan par plan.
