# État actuel — référence courante

**Ce document a vocation à bouger.** Il existe pour que les documents datés —
[`cloture-planche.md`](cloture-planche.md), les constats du lot M3 dans
[`roadmap.md`](roadmap.md) — puissent rester figés. Un procès-verbal qu'on
rectifie a posteriori ne prouve plus rien de ce qu'il attestait ; c'est ici, et
seulement ici, que l'on lit l'état du jour.

Chaque nombre est donné **avec sa définition**. Deux chiffres différents sur le
même sujet ne sont pas nécessairement une erreur : le plus souvent, ils ne
comptent pas la même chose.

Dernière vérification : **2026-07-31**, sur `b19cac7` (commit servi en
production) et sur la branche de recette qui le prolonge.

---

## Le Banc — avancement

| Route                 | Registre | Lot |
| --------------------- | -------- | --- |
| `/entrainement/eopan` | **Banc** | F2a |
| `/reviser`            | **Banc** | F2b |
| `/entrainement/eopn`  | **Banc** | F3  |
| `/entrainement/alat`  | **Banc** | F3  |

Les deux premières sont vérifiées en production ; les deux suivantes ne sont pas
encore déployées.

**Gain mesuré au lot F3**, bas du bouton « Valider », même environnement et une
seule variable changée — la constante qui active le registre :

| Viewport   | Rendu historique | Banc       | Gain        |
| ---------- | ---------------- | ---------- | ----------- |
| 1440 × 900 | 623 px           | **461 px** | −162 px     |
| 390 × 844  | 783 px           | **489 px** | **−294 px** |

Ces valeurs ne se comparent pas à celles publiées en F2a : le point de mesure
diffère — bas du bouton de validation ici, bas du premier contrôle de réponse
là-bas.

## Le décompte des appelants — trois définitions, trois nombres

La confusion vient de ce que trois documents comptent trois choses.

### 1. Composants qui importent et rendent `QuizPlayer` — **six**

| Composant                                | État                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `features/revision/revision-session.tsx` | **migré** (F2b)                                                                      |
| `features/quiz/pool-quiz.tsx`            | **mixte** — `banc` sur `/entrainement/eopan`, `legacy` sur `eopn`, `alat`, `anglais` |
| `features/quiz/notion-quiz.tsx`          | legacy                                                                               |
| `features/cours/course-experience.tsx`   | legacy                                                                               |
| `features/bia/matiere-quiz.tsx`          | legacy                                                                               |
| `app/(site)/design-system/quiz/page.tsx` | legacy — vitrine interne, hors surface publique                                      |

### 2. « Cinq autres appelants » de `design-system.md` — **cohérent**

Ce sont les **composants non migrés**, `revision-session` exclu. Le chiffre est
juste dans sa définition ; `pool-quiz` y compte pour un, bien qu'il serve les
deux registres.

### 3. Registre `AUTRES_APPELANTS` — **onze routes témoins**

Ce nombre ne se compare pas à celui des composants : depuis le 2026-07-31, le
registre a **une entrée par chemin d'intégration indépendant**, et non par
composant.

**La règle de granularité**, générale et applicable à tout registre de ce
type :

> un registre de non-régression a une entrée par **frontière indépendante**
> capable de violer l'invariant testé.

L'invariant est ici « aucune classe du Banc sur une route encore historique ».
Quatre frontières peuvent l'enfreindre : le composant de quiz, le gabarit de
page, l'enveloppe de charte, une branche conditionnelle de rendu. Deux routes
ne partagent un témoin que si elles coïncident sur les quatre.

Ce n'est pas théorique : aux lots F2a et F2b, c'est la **page** qui posait
`.banc`, jamais le composant. Un registre indexé sur les seuls composants
serait aveugle au chemin que le projet a effectivement emprunté deux fois.

| Composant           | Témoins | Pourquoi ce nombre                                 |
| ------------------- | ------- | -------------------------------------------------- |
| `pool-quiz`         | 3       | trois pages distinctes (`eopn`, `alat`, `anglais`) |
| `QuizPlayer` nu     | 1       | vitrine interne                                    |
| `matiere-quiz`      | 1       | un gabarit                                         |
| `course-experience` | 1       | un gabarit                                         |
| `notion-quiz`       | **5**   | rendu par cinq gabarits de fiche                   |

`/entrainement/eopn` et `/entrainement/alat` coïncident sur les quatre
frontières : leur redondance est volontaire et sans coût.

**Deux niveaux de protection, qui ne se recouvrent pas.**
`src/features/quiz/notion-quiz.test.tsx` surveille le **composant** — aucune
classe du Banc, avant comme après le tirage. Le registre surveille les
**pages**. Une fuite venue du composant se verrait sur les cinq gabarits ; une
fuite venue d'un seul gabarit ne se verrait que là.

**Vérifié, et pas seulement raisonné.** Les cinq gabarits rompus ensemble font
tomber les cinq témoins correspondants, les six autres restant verts. Rompu
seul, `dossier.tsx` ne fait tomber **qu'un** témoin — `/eopan/concepts/catobar`
— les dix autres restant verts : les entrées sont bien indépendantes. Le
garde-fou unitaire tombe lui aussi lorsque `NotionQuiz` passe `variant="banc"`.

**Un témoin doit rendre ce qu'il surveille.** `NotionQuiz` retourne `null` sans
questions : une fiche sans banque passerait le contrôle sans rien prouver. Les
cinq routes ont été vérifiées en production — chacune rend « Tester cette
notion ».

## Campagnes de tests

| Mesure                                  | Valeur                                                      |
| --------------------------------------- | ----------------------------------------------------------- |
| Tests découverts                        | **778** en 40 fichiers, deux projets (`chromium`, `mobile`) |
| Dernière campagne complète, sans filtre | **764 réussis, 14 ignorés, 0 échec, 0 flaky** — après F3    |
| Tests unitaires (`npm run check`)       | **823** en 55 fichiers                                      |

La suite s'exécute sur une **compilation de production**, jamais sur le serveur
de développement — voir le commentaire de `playwright.config.ts` pour les quatre
dépendances au mode de compilation que ce choix réveille.

**Une campagne se rapporte toujours avec sa liste de flaky**, jamais comme
simplement verte : un test repris compte séparément des réussites, et le taire
reviendrait à masquer une instabilité.

## Routes fonctionnelles historiques

`cloture-planche.md` en annonce **48** à la clôture de M10. Ce nombre n'a **pas
été revérifié** depuis, et il ne doit pas être recopié comme s'il l'avait été.
Il sera repris ici quand un comptage aura été refait, avec sa définition.

## État de la production

|                  |                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| URL              | <https://pr-papilote.vercel.app>                                                                                      |
| Commit servi     | `b19cac7`                                                                                                             |
| Recette complète | voir le rapport du 2026-07-31 — 29 routes en 200, index de recherche servi (477 entrées), aucune fuite de `localhost` |

Défauts ouverts relevés à cette recette et **non corrigés à ce jour** : en-têtes
de sécurité absents (CSP, `Referrer-Policy`, `Permissions-Policy`,
`X-Content-Type-Options`, `X-Frame-Options`), version de cache du service worker
figée à `v1` sur des fichiers non empreintés, trois routes `/entrainement/*`
indexables mais absentes du sitemap, et l'index de recherche sérialisé deux fois
sur `/recherche`.
