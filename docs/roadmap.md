# Feuille de route

Trois niveaux (ch. 10 §12). La séparation évite de retarder la V1 par du non-essentiel. Ce document est réévalué régulièrement ; les idées non planifiées vivent dans `docs/idees-futures.md`.

## V1 — indispensable (fondations établies + première production)

Fondations **livrées** (Volume II, ch. 1–10) :

- Design system et framework UI ; graphe documentaire ; moteur de recherche ; architecture des données ; moteur de quiz/examen paramétrique ; progression (compétences, objectifs, favoris, reprise) ; chaîne éditoriale et contrôle qualité ; SEO, accessibilité automatisée, robustesse.

Reste à faire pour la V1 :

- **Intégration Supabase réelle** : câblage lecture/écriture de la progression, des favoris et des objectifs ; authentification effective (état « non configuré » propre jusque-là).
- **Production de contenu** : cinq fiches pilotes **validées définitivement comme références officielles** (statut `publie`, 2026-07-09) ; production progressive par famille, chaque famille validée avant la suivante.
- **Banque de questions** initiale reliée aux fiches publiées (couverture surveillée par `content:check`).

### Ordre de production validé (2026-07-09)

Production **progressive**, jamais de masse. Chaque famille est validée avant de passer à la suivante ; la qualité prime.

1. **Fondamentaux aéronautiques**
2. **EOPAN**
3. **EOPN**
4. **ALAT**
5. **Dictionnaire** — en dernier : il enrichit naturellement les fiches déjà produites et réutilise leurs définitions (les deux termes pilotes `catobar` et `appontage` restent en `relecture` jusqu'à cette phase).

## Chantier « profondeur produit » (audit du 2026-07-17)

Priorisation issue d'un audit d'usage : l'investissement pédagogique était concentré sur les Fondamentaux, alors que les concours cibles (EOPAN/EOPN/ALAT) restaient des bibliothèques de fiches. Incréments menés **sans jamais inventer de donnée**, en réutilisant le contenu déjà validé.

**Livré**

- **P1a — mode « S'entraîner » par concours** : séries tirées de la banque déjà marquée par concours (`/entrainement/[concours]`), correction détaillée, vivier servi à la demande. Livré (2026-07-17).
- **P4 — « Ma préparation »** : concours cible + date d'épreuve (saisie utilisateur) → compte à rebours et accès directs sur l'accueil. Livré (2026-07-17).

**À faire (par ordre de valeur)**

- **P2 — Révision espacée** : file « à revoir aujourd'hui » dérivée de l'historique de réponses (cohérent avec la progression dérivée sans streak). Mécanique pure, sans nouveau contenu — réalisable de façon autonome.
- **P3 — Psychotechnique en profondeur** : nouvelles familles (mémoire de chiffres/empan, attention soutenue, spatial 3D, double-tâche renforcée) et batterie chronométrée avec restitution. Générateurs algorithmiques, sans donnée factuelle inventée.
- **Examen blanc au format officiel par concours** : le contrat `examSchema` (déjà défini, sourcé et daté) existe mais n'est pas alimenté. **Bloqué sur sources** : structure officielle des épreuves (nombre de questions, durée, barème) à fournir/valider avant production.
- **Production de contenu concours** : parcours guidés (cours) et enrichissement des banques EOPAN/EOPN/ALAT. **Bloqué sur sources** (annales, notices officielles).
- **Intégration Supabase réelle** (déplace aussi un point V1) : faire de Supabase le socle multi-appareils de la progression/`préparation`. **Bloqué sur configuration** (variables d'environnement du projet).

## Chantier ouvert — Système d'illustration technique PrépaPilote

**Ouvert le 2026-07-28, sur réserve de la direction éditoriale.** Les croquis du
prototype PLANCHE — silhouette d'appareil, schéma de couche limite — sont
**acceptés comme provisoires du design-lab, refusés comme système graphique de
production** : trop rudimentaires pour le niveau de précision du reste de la
charte. **Ce chantier ne bloque pas la migration générale.**

Le chantier devra définir une direction artistique complète, entièrement
originale à PrépaPilote, inspirée des documents de bureau d'études aéronautiques
et des manuels professionnels — jamais décalquée d'eux — pour :

- les **schémas aérodynamiques** ;
- les **forces et écoulements** ;
- les **vues d'appareils** (silhouettes, trois vues, échelles comparées) ;
- les **coupes** ;
- les **instruments** ;
- la **navigation** ;
- les **plans** ;
- les **illustrations scientifiques**.

Il devra fixer, au minimum : les graisses de trait et leur signification, la
grille de construction, le traitement des repères et des cotes, les conventions
de coupe et de hachure, l'échelle et son affichage, le comportement en registre
sombre, et le format de production des sources (dessin vectoriel versionné).

**Règles en vigueur jusqu'à ce chantier** — elles s'appliquent dès maintenant :

1. **Aucune silhouette approximative ne peut être présentée comme fidèle à un
   appareil réel.** Un tracé qui n'a pas été établi sur des cotes sourcées est
   un démonstrateur, et le dit.
2. **Les démonstrateurs génériques restent explicitement signalés** — dans la
   légende visible _et_ dans le texte alternatif.
3. Les schémas existants sont conservés provisoirement, sans effort de
   reprise : ce serait du travail perdu.
4. **Aucune illustration décorative n'est inventée pour remplir un espace.** Un
   emplacement sans figure reste vide, comme une donnée absente reste « — ».

---

## Dette antérieure à M3 — deux tests Playwright rouges

**Constaté le 2026-07-28, pendant le lot M3.** Deux fichiers de test échouent, et
ils échouaient **déjà sur le commit précédent** : vérifié en construisant le
commit antérieur dans un `git worktree` et en servant les deux versions côte à
côte. Le lot M3 ne les a ni causés ni aggravés, et **ne les répare pas** : ce
sont des fonctionnalités sans rapport avec le gabarit, et un lot de migration
graphique ne doit pas les toucher.

| Fichier                   | Symptôme                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `e2e/preparation.spec.ts` | le repère `region « Ma préparation »` n'existe plus dans `src/`    |
| `e2e/revision.spec.ts`    | la séance de révision ne parvient pas à l'état attendu par le test |

**Comment ils s'exécutent** — et pourquoi ils n'ont pas fait rougir un commit :

- `npm run check` = `lint` + `typecheck` + `format:check` + `vitest run`.
  **Playwright n'en fait pas partie.** Les 633 tests annoncés verts sont les
  tests unitaires et d'intégration Vitest.
- La suite Playwright s'exécute par `npm run test:e2e` (soit `playwright test`).
  Elle démarre `npm run dev` par la configuration ; les routes protégées par
  drapeau exigent `NEXT_PUBLIC_DESIGN_LAB=1` et `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=1`,
  faute de quoi une trentaine de tests supplémentaires échouent sur des 404
  attendus. Commande complète :

  ```
  NEXT_PUBLIC_DESIGN_LAB=1 NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=1 npm run test:e2e
  ```

  Pour ces deux seuls fichiers :

  ```
  npx playwright test e2e/preparation.spec.ts e2e/revision.spec.ts
  ```

**À traiter dans un lot dédié**, hors migration : décider si « Ma préparation »
doit revenir sur l'accueil ou si le test doit suivre la fonctionnalité là où
elle a été déplacée, puis rebrancher le test sur l'état réel du produit.

## Dette relevée au lot M6b — trois défauts antérieurs, hors migration

Le lot M6b a mesuré les 238 fiches avant et après. Trois défauts ressortent qui
**existaient déjà** et qu'un lot de migration graphique n'avait pas à corriger.
Chacun est prouvé antérieur en servant les deux versions côte à côte.

| Défaut                                                                                                      | Portée                                                                                                                                              | Preuve                                                                 |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `.border-success` à **4,38:1** — sous le seuil WCAG AA de 4,5:1                                             | charte historique, 172 fiches restantes                                                                                                             | scan axe identique avant/après ; **retiré** des 66 notices migrées     |
| Trois fiches rédigent une section `s-entrainer`, qui heurte l'identifiant de `NotionQuiz`                   | `eopn/missions/le-domaine-spatial-militaire`, `fondamentaux/anglais-aeronautique/la-comprehension-ecrite`, `psychotechnique/exercices/les-matrices` | identifiant en double dans le gabarit historique comme dans le nouveau |
| Quatre notices rédigent une section « Caractéristiques » **et** renseignent `specs` — deux tableaux voisins | `eopan/appareils/rafale-m`, `eopan/navires/charles-de-gaulle`, `eopn/appareils/pc-21`, `eopn/appareils/alphajet`                                    | le gabarit historique rendait déjà les deux                            |

Les deux premiers sont techniques et se traitent dans un lot d'accessibilité ou
de contenu. Le troisième est **éditorial** : décider si la section rédigée doit
disparaître au profit de la fiche signalétique, ou l'inverse, n'est pas une
décision de graphisme.

Une quatrième observation, sans défaut associé : **aucune des 66 notices ne
déclare de document rattaché**. La branche « Documents » du gabarit existe et
n'est éprouvée par aucune page — à garder en tête avant de s'appuyer dessus.

### Le retour arrière de M6b emporte un arbitrage éditorial

`git revert 07b1917` rétablit **la classification antérieure des missions** :
les neuf fiches `*/missions` redeviennent `identification` et la répartition
repasse à 75 / 122 / 37 / 4. Le classement en `lecon` a été validé séparément de
la migration graphique, mais les deux vivent dans le même commit.

**Si M6b est relancé, réappliquer l'arbitrage explicitement** avant toute
génération de cote — les neuf missions ne doivent recevoir ni cote de notice ni
gabarit de Planche. Le test de répartition gelée est le point de contrôle : il
attend 66 / 131 / 37 / 4. Détail : `docs/design-migration.md` §18.8.

**Question ouverte à trancher au passage** : `npm run test:e2e` devrait-il
entrer dans la porte de qualité, ou rester une vérification manuelle ? Tant
qu'il en est dehors, une régression de bout en bout peut être commitée sans
rien faire rougir.

---

## V2 — améliorations importantes

- Lighthouse CI branché après le premier déploiement (budgets de `docs/qualite-technique.md`).
- Monitoring runtime (erreurs, lenteurs) et analytics anonymes respectueux, à l'intégration.
- Génération assistée de questions depuis les données structurées (marqueur `generator`, validation humaine).
- Enrichissement du graphe (nouveaux prédicats factuels) et des familles d'objets au fil du contenu.
- Génération statique incrémentale surveillée dès ~500 pages.

## V3 — innovations long terme

- Multilingue (chemin réservé sans champ mort : langue « fr » implicite, `schemaVersion`).
- Variantes de fiche par concours.
- Mode hors-ligne (explicitement hors V1).
- Recommandations pédagogiques affinées par IA (sans changer le modèle de progression dérivée).

> Toute promotion V2 → V1 ou V3 → V2 passe par le critère des trois questions (`docs/gouvernance.md` §3) et, si structurante, une ADR.

## Dette relevée au lot M8b

### Identifiants dupliqués dans les SVG de schémas — 16 fiches

Seize fiches de notion portent un doublon `id="a"` ou `id="ac"` : des `<marker>`
de flèche définis à l'identique dans deux fichiers `content/schemas/*.svg` montés
sur la même page.

**Antérieur au lot** (mesuré identique avant et après), **sans effet visuel**
(les définitions en double sont identiques à l'octet, la flèche se rend bien) et
**situé dans le contenu**, pas dans le gabarit.

Non corrigé en M8b : les deux issues possibles sortaient du périmètre — éditer
les SVG est une modification de contenu, préfixer les identifiants dans
`FicheFigure` changerait le rendu du Cahier et du Dossier. À arbitrer dans un lot
d'assainissement du contenu graphique. Détail : `docs/design-migration.md` §22.5.

### Trois composants sans consommateur de production

`fiche-photo`, `service-badge` et `aircraft-specs` ne sont plus montés que par
`FicheTransition` (23 Dossiers) et la galerie `/design-system/fiche`. Dix autres
composants de `src/components/content/` sont dans le même cas. Ils disparaîtront
avec le lot du Dossier ; un lot de migration graphique ne fait pas le ménage du
dépôt.

### Une leçon de méthode : `npm run check` n'exécute pas Playwright

`e2e/planche-aviation-mondiale.spec.ts` est resté rouge pendant tout le lot M7b
sans être vu, parce que seuls les fichiers du lot en cours étaient relancés.
**La suite complète doit être exécutée avant chaque livraison**, pas seulement
les fichiers touchés.
