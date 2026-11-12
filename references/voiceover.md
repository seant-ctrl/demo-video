# Voix off — ElevenLabs, écriture, mesure

## La clé, et rien d'autre

- Cherchée dans cet ordre : `ELEVENLABS_API_KEY` (env) → `<projet>/.env` → `~/.demo-video/.env`.
- **Jamais dans le chat, jamais dans un livrable, jamais dans un log.** Si l'utilisateur la colle dans la conversation :
  la déplacer dans `~/.demo-video/.env` (chmod 600), lui dire de la révoquer et d'en générer une autre (leçon des deux
  premières démos, où la clé a traîné dans la session).
- Pas de clé → on ne pose pas de question piège : on propose « script seulement » et on indique où poser la clé.
- Génération = crédits consommés : **jamais avant le go de Gate 2**, jamais `--force` sans raison. Un texte modifié
  dans `script-<lang>.json` régénère seulement sa piste (le manifest garde le texte généré).

## Réglages : Eleven v4

On utilise **Eleven v4** (`eleven_v4`), le modèle le plus naturel d'ElevenLabs : c'est lui qui donne une voix off de qualité.
Doc de référence, à relire avant de toucher aux réglages :

- Le modèle : <https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4>
- Écrire pour v4 (audio tags, pauses, emphase) : <https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v4>
- Les paramètres de l'API : <https://elevenlabs.io/docs/api-reference/text-to-speech/convert>
- Limites par modèle (10 000 caractères par requête en v4) : <https://elevenlabs.io/docs/overview/models>

| Paramètre | Valeur | Pourquoi |
|---|---|---|
| Modèle | `eleven_v4` | le plus naturel, 90+ langues dont le français. `eleven_v4_turbo` existe mais vise le temps réel (agents conversationnels), pas la voix off |
| Voix | **George** `JBFqnCBsd6RMkjVDRZzb` par défaut | voix du catalogue standard, lit bien le français. Les voix de la Voice Library et les Professional Voice Clones sont recommandées sur v4 par ElevenLabs, à tester avec `--only=p00` |
| `stability` | 0,5 | bas = plus expressif et variable d'une prise à l'autre ; haut = plus régulier, plus monotone. 0,4 à 0,6 pour une voix off produit |
| `similarity_boost` | 0,75 | fidélité à la voix d'origine. Plus haut peut rendre la voix moins naturelle |
| `use_speaker_boost` | true | renforce la ressemblance, coût de latence négligeable en génération différée |
| `style`, `speed` | **absents** | non disponibles en v4 : l'API les accepte mais les ignore. Le débit se règle par l'écriture (phrases courtes, ponctuation) |
| `clone_strength` | 0 | seulement pour une Professional Voice Clone affinée sur v4 ; 0,5 en repli si la voix dérive |
| `language_code` | `fr` ou `en` | force la langue, évite qu'un mot anglais fasse basculer l'accent |
| `previous_text` / `next_text` | toujours | la prosodie enchaîne d'un plan au suivant au lieu de repartir à plat à chaque MP3 |
| Sortie | `mp3_44100_128`, un fichier **par plan** | c'est ce qui permet le recalage plan par plan et les blocs Framewave |
| Mesure | `afinfo` (macOS), sinon `ffprobe` | la durée mesurée fixe le plancher du plan |

Ce qui change à l'écriture avec v4 :

- **Pas de SSML** (`<break>` ignoré). Les pauses passent par les points de suspension, la ponctuation et la structure des phrases.
- **Audio tags** entre crochets pour l'intention : `[posé]`, `[enthousiaste]`, `[chuchote]`. À doser : un par phrase au plus, jamais sur une phrase qui cite un libellé d'UI. Le respect des tags progresse mais n'est pas garanti, réécouter le plan.
- **Majuscules = emphase.** Ne pas écrire un nom de produit en capitales par habitude, le TTS l'appuierait.
- **Prononciation** d'un nom propre difficile : IPA en ligne entre barres obliques, ou dictionnaire de prononciation côté API.

Autre voix, autre modèle : `ELEVEN_VOICE_ID`, `ELEVEN_MODEL`, ou `voice:{id, model, settings}` dans `demo.config.json`.
Toujours tester avec `--only=p00` avant de lancer toute la série.

## Écrire le script

Débit mesuré sur George en `eleven_multilingual_v2` : **FR 2,42 mots/s, EN ≈ 2,6 mots/s**. Le recaler après la première génération en v4 (`npm run vo` affiche le débit réel). Budget par plan = `(durée visée − 0,7 s) × débit`.
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
