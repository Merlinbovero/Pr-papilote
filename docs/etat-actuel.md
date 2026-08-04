# État actuel — référence courante

**Ce document a vocation à bouger.** Il existe pour que les documents datés —
[`cloture-planche.md`](cloture-planche.md), les constats du lot M3 dans
[`roadmap.md`](roadmap.md) — puissent rester figés. Un procès-verbal qu'on
rectifie a posteriori ne prouve plus rien de ce qu'il attestait ; c'est ici, et
seulement ici, que l'on lit l'état du jour.

Chaque nombre est donné **avec sa définition**. Deux chiffres différents sur le
même sujet ne sont pas nécessairement une erreur : le plus souvent, ils ne
comptent pas la même chose.

Dernière vérification : **2026-08-01**, sur `b19cac7` (commit servi en
production) pour les mesures de production, et sur `banc/integration` pour
l'avancement du Banc.

---

## Le Banc — **clos au lot F12**

| Route / surface                         | Registre         | Lot |
| --------------------------------------- | ---------------- | --- |
| `/entrainement/eopan`                   | **Banc**         | F2a |
| `/reviser`                              | **Banc**         | F2b |
| `/entrainement/eopn`                    | **Banc**         | F3  |
| `/entrainement/alat`                    | **Banc**         | F3  |
| Quiz de matière BIA                     | **documentaire** | F4  |
| Mini-quiz de fiche                      | **documentaire** | F4  |
| `/bia/examen-blanc`                     | **Banc**         | F5  |
| `/progression`, `/progression/[module]` | _hors périmètre_ | F6  |
| `/psychotechnique/entrainement`         | **Banc**         | F7a |
| `/psychotechnique/triangles`            | **Banc**         | F7b |
| Les six autres épreuves de famille      | **Banc**         | F7c |
| `/psychotechnique/secpil`               | **Banc**         | F9  |
| `/anglais/quiz`                         | **Banc**         | F12 |
| Quiz de cours                           | **documentaire** | F12 |
| `/design-system/quiz` (vitrine)         | **documentaire** | F12 |

**Le tableau est complet, et c'est le compilateur qui le garantit** : depuis le
lot F12, la propriété `variant` est obligatoire sur le lecteur de quiz. Il n'y
a plus de valeur par défaut, donc plus de surface qui puisse échapper à
l'arbitrage par simple omission. Une surface non classée ne compile pas.

Le registre `documentaire` n'est pas une étape vers le Banc : c'est un
**classement définitif**, arbitré au lot F4. Ces quiz sont la prolongation
immédiate d'une lecture, subordonnés à leur document, sans destination autonome.
Ils gardent l'apparence de leur hôte **et** tiennent le contrat d'accessibilité
du Banc — DT-002 y est remboursée. Voir la règle dans `design-system.md`.

L'examen blanc est l'autre bord de cette même frontière, et le plus net : il se
lance explicitement, occupe cent questions et deux heures et demie, se
chronomètre et se termine. Changement de tâche principale, donc changement de
registre. Le critère, dans les deux sens : _un registre visuel distinct est
déclenché par un changement de tâche principale, pas par la simple présence
d'une interaction._

**Le lot F6 se solde par un arbitrage, non par une migration.** Le plan du
chantier prévoyait « la progression au registre du Banc » ; l'examen du code a
montré que la prémisse était fausse. `/progression` et `/progression/[module]`
ne sont pas des séances : aucune épreuve, aucun chronomètre, aucun contrôle de
réponse, aucun état à sauvegarder — des cartes, des listes et des liens. Le
bloc « Reprendre » lui-même n'ouvre rien : il **navigue** vers `/reviser` ou
vers un entraînement. Ce sont donc des surfaces de LECTURE, et le critère de F4
les classe documentaires sans hésitation. Leur poser `.banc` reviendrait à
peindre un tableau de bord aux couleurs d'un instrument de mesure au motif
qu'il en parle. Vérifié plutôt que supposé : `grep` ne trouve aucune mécanique
de séance dans `src/features/progression/` ni dans les deux gabarits.

Ce que le Banc doit à ces pages est d'un autre ordre — que leurs **entrées**
vers les séances soient lisibles — et cela relève de la navigation, pas du
registre.

Les deux premières lignes sont vérifiées en production ; les suivantes ne sont
pas encore déployées — la mise en ligne attend la clôture du Banc.

**Gain mesuré au lot F3**, bas du bouton « Valider », même environnement et une
seule variable changée — la constante qui active le registre :

| Viewport   | Rendu historique | Banc       | Gain        |
| ---------- | ---------------- | ---------- | ----------- |
| 1440 × 900 | 623 px           | **461 px** | −162 px     |
| 390 × 844  | 783 px           | **489 px** | **−294 px** |

Ces valeurs ne se comparent pas à celles publiées en F2a : le point de mesure
diffère — bas du bouton de validation ici, bas du premier contrôle de réponse
là-bas.

**Gain mesuré au lot F5** sur l'examen blanc, bas du premier contrôle de
réponse, `git stash` pour seule variable — même machine, même vivier fixe, deux
compilations de production successives :

| Viewport   | Rendu historique | Banc       | Gain    |
| ---------- | ---------------- | ---------- | ------- |
| 1280 × 720 | 519 px           | **423 px** | −96 px  |
| 412 × 839  | 639 px           | **523 px** | −116 px |

Le premier contrôle tenait déjà dans l'écran avant migration : l'examen blanc
n'était pas atteint par le défaut le plus grave de l'audit F0b — contrairement
aux épreuves psychotechniques, mesurées à 891, 995 et 994 px pour un écran de 844. Le gain de F5 est donc réel mais modeste sur ce point, et l'apport du lot
est ailleurs :

| Repère                              | Avant              | Après                               |
| ----------------------------------- | ------------------ | ----------------------------------- |
| Titre `h1` encore affiché en séance | oui                | **non** (replié, rappelable)        |
| Chronomètre — rôle                  | aucun              | **`timer`**, nommé, `aria-live=off` |
| Chronomètre — taille / graisse      | 14 px / 400        | **18 px / 600**, sur surface        |
| Verdict par question en correction  | icône seule        | **mot** (« Juste » / « Ratée »)     |
| Lien « À réviser »                  | souligné au survol | **souligné au repos** (DT-002)      |

**Gain mesuré au lot F7a** sur l'entraînement psychotechnique, bas du premier
contrôle de réponse, `git stash` pour seule variable :

| Viewport   | Rendu historique | Banc       | Gain        |
| ---------- | ---------------- | ---------- | ----------- |
| 1440 × 900 | 605 px           | **363 px** | −242 px     |
| 390 × 844  | 779 px           | **367 px** | **−412 px** |

C'est le gain le plus important du chantier, et c'est logique : cette route
cumulait les deux écrans d'avant-séance — choix de la session **et** consignes
des familles tirées — au-dessus de l'aire de jeu.

### Le défaut de repli, mesuré sur tout le module

Relevé au lot F7a sur les **sept épreuves de famille**, encore non migrées,
après lancement et **document remonté en haut** :

| Épreuve           | 1440 × 900 | 390 × 844 |
| ----------------- | ---------- | --------- |
| Dominos           | 1004 px    | 962 px    |
| Calcul mental     | 842 px     | 1268 px   |
| Codage            | 950 px     | 1482 px   |
| Appareils photos  | 1083 px    | 1410 px   |
| Formes imbriquées | 1527 px    | 1427 px   |
| Triangles         | 1363 px    | 1347 px   |
| Orientation       | 1068 px    | 1151 px   |

**Treize de ces quatorze mesures sont hors écran.** Le constat est plus large
que celui de l'audit F0b, qui n'avait relevé que trois épreuves à 891, 995 et
994 px.

> **Correction d'une première lecture erronée.** Ma première campagne de
> mesure donnait ces contrôles « dans l'écran ». Elle lisait la position
> RELATIVE AU VIEWPORT après que Playwright eut fait défiler la page pour
> cliquer le lanceur : elle mesurait donc un contrôle qu'il avait fallu aller
> chercher, et le déclarait visible. Remonter le document avant de mesurer
> renverse le résultat.

**Le lot F7b a commencé par les triangles**, mesurés après migration :

| Viewport   | Rendu historique | Banc       | Gain        |
| ---------- | ---------------- | ---------- | ----------- |
| 1440 × 900 | 1363 px          | **740 px** | −623 px     |
| 390 × 844  | 1347 px          | **662 px** | **−685 px** |

**Le lot F7c a migré les six autres.** Bas du premier contrôle de réponse,
après lancement et document remonté en haut :

| Épreuve           | 1440 × 900 avant → après | 390 × 844 avant → après |
| ----------------- | ------------------------ | ----------------------- |
| Dominos           | 1004 → **547 px**        | 962 → **531 px**        |
| Calcul mental     | 842 → **357 px**         | 1268 → **361 px**       |
| Codage            | 950 → **465 px**         | 1482 → **841 px**       |
| Appareils photos  | 1083 → **550 px**        | 1410 → **785 px**       |
| Formes imbriquées | 1527 → **967 px**        | 1427 → **729 px**       |
| Triangles         | 1363 → **853 px**        | 1347 → **775 px**       |
| Orientation       | 1068 → **630 px**        | 1151 → **590 px**       |

**Treize des quatorze mesures sont désormais dans le premier écran**, contre
une seule avant. Le relevé qui reste dehors est nommé plutôt que tu :
**formes imbriquées en 1440 × 900, à 967 px pour un écran de 900**. Son
tutoriel de présentation est le plus haut des sept, et le repli ne suffit pas
à lui seul. Le traiter demande de raccourcir le contenu ou de réorganiser
l'écran de choix — décision éditoriale, pas de registre : elle reste ouverte.

**Gain mesuré au lot F9** sur SECPIL, bas de l'écran de simulation, `git stash`
pour seule variable :

| Viewport   | Rendu historique | Banc       | Gain    |
| ---------- | ---------------- | ---------- | ------- |
| 1440 × 900 | 1254 px          | **749 px** | −505 px |
| 390 × 844  | 900 px           | **428 px** | −472 px |

Les deux relevés passaient **hors écran** ; ils tiennent désormais dans le
premier écran. Le lot corrige en outre un défaut nommé dès la charte du Banc
(lot F1b) : le temps restant et la précision étaient dessinés **dans** le
`<svg>`, lequel porte `role="img"` et un libellé statique — ces deux valeurs
n'atteignaient donc jamais une technique d'assistance, sur l'épreuve la plus
chronométrée du produit. Elles sont désormais exposées hors du dessin, le
chronomètre par le composant du Banc.

### Le titre de séance — question tranchée le 2026-08-01

Le mode séance replie le chapeau éditorial, titre de niveau 1 compris. La
question posée était : le nom accessible du cadre de séance suffit-il à tenir
ce rôle ?

**Réponse : non, et la séance porte désormais son propre `<h1>`** (lot F7d,
appliqué aux onze routes en un seul point). Le `role="group"` nommé n'a pas la
sémantique `heading`, n'apparaît pas dans la liste des titres d'un lecteur
d'écran, ne constitue pas un point de repère, et n'expose pas la séance comme
le nouveau sujet principal de la vue. Le groupe est conservé, mais nommé **par**
ce titre.

La règle générale, qui dépasse le Banc, est dans `design-system.md` :

> lorsqu'un état interactif remplace la tâche principale et retire le titre de
> la vue précédente, il doit fournir son propre titre principal. Un nom
> accessible sur un groupe complète cette structure ; il ne la remplace pas.

Garde : `e2e/banc-titre-seance.spec.ts` — onze routes × quatre phases, aucune
phase à zéro ou deux titres.

### Le stockage local — lot F11

Le Banc a fini par toucher toutes les séances ; il restait à traiter ce
qu'elles **écrivent**. L'inventaire a trouvé **douze clés** dans
`localStorage`, réparties en **trois conventions incompatibles** :
`prepapilote:revision` (deux-points), trois clés `prepapilote.…` (pointées,
sans version), huit clés `pp.<famille>.history.v1` (préfixe abrégé, **avec** un
suffixe de version), et `module-sidebar-collapsed` (sans espace de noms).

Deux défauts en découlaient, et ce sont eux qui ont été corrigés — pas le
désordre des noms.

**1. Le marqueur de version était décoratif.** `grep` sur tout le dépôt : le
`.v1` de ces huit clés n'apparaît que dans leur propre déclaration. Rien ne le
lit, rien ne le compare. Passer à `.v2` n'aurait migré aucune donnée : cela
aurait écrit **ailleurs**, en abandonnant les anciennes sans les lire ni les
effacer. Une perte silencieuse, prête à se produire au premier changement de
forme.

**2. Rien n'était validé.** Douze lecteurs faisaient `JSON.parse(brut) as T`.
Un `as` n'est pas une vérification, c'est une affirmation ; et ce que rend
`localStorage` vient de l'extérieur du programme — version antérieure, autre
onglet, extension, écriture interrompue. La panne survenait alors loin de sa
cause : une échéance `undefined`, une date illisible, un score qui n'est pas un
nombre.

La règle appliquée par `src/lib/stockage/` :

> une donnée relue depuis le stockage est une donnée **externe**. Elle est
> validée à l'entrée, jamais castée ; et si elle est refusée, elle est mise de
> côté sous `<clé>.rejete`, jamais détruite.

**Ce que le lot ne fait pas, délibérément : il ne renomme aucune clé.**
Renommer reviendrait à abandonner les données de ceux qui ont déjà travaillé —
exactement le défaut relevé au point 1. Les clés gardent leur nom historique ;
c'est leur **contenu** qui devient versionné, sous enveloppe `{ v, d }`. Les
données déjà présentes chez les utilisateurs sont des tableaux nus : elles sont
acceptées telles quelles et enveloppées à la première écriture.

**Un défaut a été introduit puis rattrapé pendant le lot**, et il mérite d'être
nommé ici parce qu'aucun test ne l'a vu : la première version du module imposait
une borne de 20 entrées à tous les historiques, alors que trois épreuves
(`codage`, `formes`, `triangles`) bornaient déjà au site d'appel à 10 et
écrivaient ensuite tout ce qu'elles recevaient. C'est la relecture du diff, pas
la campagne, qui l'a arrêté. `limite` est donc **facultative**, et la raison est
écrite dans `historique.ts`.

Gardes : 12 tests unitaires sur le contrat (`stockage.test.ts`), et deux
contrôles e2e qui vérifient qu'un état écrit **avant** ce lot reste lu et n'est
pas mis en quarantaine (`revision-leitner.spec.ts`,
`bia-examen-f5-reference.spec.ts`).

## Le décompte des appelants — trois définitions, trois nombres

La confusion vient de ce que trois documents comptent trois choses.

### 1. Composants qui importent et rendent `QuizPlayer` — **six**

| Composant                                | État                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `features/revision/revision-session.tsx` | **banc** (F2b)                                                     |
| `features/quiz/pool-quiz.tsx`            | **banc** — les trois concours (F2a, F3) et le quiz d'anglais (F12) |
| `features/quiz/notion-quiz.tsx`          | **documentaire** (F4) — encastré, hors périmètre visuel du Banc    |
| `features/cours/course-experience.tsx`   | **documentaire** (F12) — section « Se tester » d'une leçon         |
| `features/bia/matiere-quiz.tsx`          | **documentaire** (F4) — encastré, hors périmètre visuel du Banc    |
| `app/(site)/design-system/quiz/page.tsx` | **documentaire** (F12) — vitrine interne, hors surface publique    |

**Plus une seule ligne sans registre depuis le lot F12**, et ce n'est pas un
effet de rédaction : la propriété est devenue obligatoire, donc ce tableau ne
peut plus contenir de case vide sans que le projet cesse de compiler.

**Ce tableau ne recense pas tout ce qui joue une séance.** `BiaExamPlayer`
(examen blanc, migré au lot F5) n'importe pas `QuizPlayer` : c'est un moteur
distinct, avec ses propres phases, son chronomètre et sa persistance. Les
épreuves psychotechniques et SECPIL sont dans le même cas. Un décompte fondé
sur les appelants d'un composant ne les verra jamais.

### 2. « Cinq autres appelants » de `design-system.md` — **périmé depuis F12**

Ce chiffre comptait les **composants non migrés**, `revision-session` exclu. Il
n'a plus d'objet : il n'existe plus de composant non migré, seulement des
composants **classés**, en `banc` ou en `documentaire`. La phrase est conservée
dans `design-system.md` au titre du récit de la migration, pas de l'état
courant — c'est ce document-ci qui fait foi sur l'état courant.

### 3. Registre `AUTRES_APPELANTS` — **neuf routes témoins**

> **Correction du 2026-08-01.** Ce document annonçait **onze**. Le nombre était
> celui d'avant le lot F3, qui a retiré `/entrainement/eopn` et
> `/entrainement/alat` en les migrant ; je ne l'avais pas reporté ici. Recompté
> depuis la source (`playwright test --list`), le registre en a **neuf**.

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

| Composant           | Témoins | Pourquoi ce nombre                                  |
| ------------------- | ------- | --------------------------------------------------- |
| `pool-quiz`         | 1       | `/anglais` — `eopn` et `alat` sont partis au lot F3 |
| `QuizPlayer` nu     | 1       | vitrine interne                                     |
| `matiere-quiz`      | 1       | un gabarit                                          |
| `course-experience` | 1       | un gabarit                                          |
| `notion-quiz`       | **5**   | rendu par cinq gabarits de fiche                    |

Chaque migration retire une ligne du registre, et l'oubli se voit
immédiatement : le contrôle correspondant tombe, puisque la route porte
désormais `.banc`.

**Deux niveaux de protection, qui ne se recouvrent pas.**
`src/features/quiz/notion-quiz.test.tsx` surveille le **composant** — aucune
classe du Banc, avant comme après le tirage. Le registre surveille les
**pages**. Une fuite venue du composant se verrait sur les cinq gabarits ; une
fuite venue d'un seul gabarit ne se verrait que là.

**Vérifié, et pas seulement raisonné.** Les cinq gabarits rompus ensemble font
tomber les cinq témoins correspondants, les autres restant verts. Rompu seul,
`dossier.tsx` ne fait tomber **qu'un** témoin — `/eopan/concepts/catobar` — les
autres restant verts : les entrées sont bien indépendantes. Le garde-fou
unitaire tombe lui aussi lorsque `NotionQuiz` passe `variant="banc"`. (Ces
ruptures ont été faites au lot F3, quand le registre comptait onze entrées ;
les deux entrées retirées depuis n'appartenaient pas au groupe `notion-quiz`,
la démonstration d'indépendance reste donc valable telle quelle.)

**Un témoin doit rendre ce qu'il surveille.** `NotionQuiz` retourne `null` sans
questions : une fiche sans banque passerait le contrôle sans rien prouver. Les
cinq routes ont été vérifiées en production — chacune rend « Tester cette
notion ».

**Ce que ce registre ne couvre pas, et pourquoi — relevé au lot F5.**
`/bia/examen-blanc` n'y a jamais figuré : son moteur est distinct de
`QuizPlayer`, et le registre est indexé sur les appelants de ce dernier. La
route était donc, jusqu'à F5, une page de production sans témoin de
non-régression sur l'invariant « aucune classe du Banc hors des routes
migrées ». Le trou est refermé par le fait même de la migration —
`e2e/bia-examen-banc.spec.ts` la couvre désormais en positif — mais il faut le
noter : **un registre indexé sur un composant est aveugle à tout moteur
concurrent**. Le lot F9 (SECPIL) et le lot F7 (coquille psychotechnique)
présenteront la même configuration.

## Campagnes de tests

| Mesure                                  | Valeur                                                      |
| --------------------------------------- | ----------------------------------------------------------- |
| Tests découverts                        | **834** en 44 fichiers, deux projets (`chromium`, `mobile`) |
| Dernière campagne complète, sans filtre | **820 réussis, 14 ignorés, 0 échec, 0 flaky** — après F5    |
| Tests unitaires (`npm run check`)       | **824** en 55 fichiers                                      |

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
