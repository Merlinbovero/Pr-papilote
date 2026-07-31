# Clôture — migration documentaire PLANCHE et consolidation M10

Document de clôture, écrit après les lots M1 à M10. Il consigne l'état réel,
les dettes qui restent et la façon de revenir en arrière. Il ne décrit aucune
intention : tout ce qu'il affirme a été mesuré, et ce qui relève de l'hypothèse
est signalé comme tel.

> **Ce document est daté et ne bouge pas — note du 2026-07-31.**
>
> Il vaut **pour l'état à la clôture de M10**, et c'est ce qui fait sa valeur :
> un procès-verbal qu'on rectifie a posteriori ne prouve plus rien de ce qu'il
> attestait. Ce qu'il dit du **Banc** — famille F réservée, aucune interface
> produite, chantier non engagé — était vrai à M10 et ne l'est plus.
>
> | Moment        | Le Banc                                                                                                                                              |
> | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **À M10**     | lettre de cote F réservée, zéro document, aucune interface.                                                                                          |
> | **F1a — F1b** | contrat de focus, jetons `--bc-`, trois composants de fondation, vitrine interne derrière un drapeau. Toujours **aucun moteur de production migré**. |
> | **F2a — F2b** | deux routes réelles migrées : `/entrainement/eopan` et `/reviser`. **En production** depuis le 2026-07-31.                                           |
>
> L'état courant — routes migrées, appelants restants et leurs définitions —
> est tenu par [`etat-actuel.md`](etat-actuel.md), qui a vocation à bouger.

---

## 1. État final

La **migration documentaire est terminée**. Tout ce qui est un document est
rendu par un gabarit PLANCHE.

- **238 fiches** migrées, sur `/(planche)/[module]/[categorie]/[slug]`.
- **14 leçons canoniques** migrées, sur `/(planche)/cours/[slug]`.
- **Zéro document sous `FicheTransition`** — le composant a été supprimé au lot
  M9b, avec `site-fonts-transition.ts`.
- **252 cotes documentaires**, toutes uniques sur l'union des deux tables
  (`cours` : 14, `fiches` : 238), vérifié par test.

---

## 2. Archétypes et familles de cotes

| Lettre | Famille                     | Documents | Encre                |
| ------ | --------------------------- | --------: | -------------------- |
| **A**  | Le Dossier de concours      |        23 | `indigo`             |
| **B**  | La Leçon canonique          |        14 | `bistre`             |
| **C**  | La Planche d'identification |        83 | encre du module hôte |
| **D**  | Le Cahier                   |        20 | `sienne`             |
| **E**  | La Situation                |         4 | `sienne`             |
| **F**  | _réservé au Banc_           |         0 | —                    |
| **G**  | La fiche de notion          |       108 | `bistre`             |

**F est la seule lettre inoccupée.** Elle attend Le Banc, la famille des
interfaces où l'utilisateur exécute réellement un exercice.

### Grammaire

`MODULE · F.C.NN` — module propriétaire, lettre de famille, rang de la catégorie
dans `categories.json`, puis numéro sur deux chiffres.

Le dernier segment n'a pas le même sens partout, et c'est délibéré :

- **B** — rang **global dans le parcours**, pour que « la leçon 7 » veuille dire
  quelque chose ;
- **A, C, D, E, G** — **numéro d'enregistrement dans la catégorie**, attribué à
  l'entrée du document au corpus.

### Affecter une nouvelle fiche

1. La catégorie porte un archétype par défaut dans
   `content/_referentiels/archetypes.json` ; une fiche en hérite.
2. Une exception par identifiant l'emporte sur ce défaut.
3. **Le module ne détermine pas l'archétype** — arbitrage du lot M7a : une
   notice d'appareil reste une notice, quel que soit le module qui la range.
4. Une catégorie classée `dossier` doit aussi déclarer sa nature
   (`naturesDossier`) ; son absence fait échouer le rendu, jamais silencieusement.

### Stabilité des cotes

- Une cote **est gelée** à l'attribution. Elle ne bouge ni au changement de
  titre, ni de slug, ni d'ordre d'affichage, ni à la disparition d'une voisine.
- **Un numéro retiré n'est jamais réattribué.**
- La clé est l'**identifiant de contenu**, pas le chemin. `eopan.procedures.catobar`
  vit aujourd'hui dans la catégorie `concepts` et porte `EOPAN · A.12.01` : son
  identifiant garde la trace de son ancien rangement, et **ne doit pas être
  « corrigé »**. Un test le fixe.
- Le registre gelé est répliqué dans `cotes-fiches.test.ts` : un script ne peut
  pas renuméroter le corpus proprement et silencieusement.

---

## 3. Tests

- `npm run check` **vert** — 737 tests unitaires et d'intégration.
- Suite Playwright complète **à zéro échec**, confirmée sur trois campagnes.
- **Les anciennes lignes de base rouges n'existent plus.** Les six échecs
  documentés — `preparation`, `revision`, `fiches-pilotes` ×2, `psychotechnique`
  — sont corrigés à la cause, pas contournés.
- **Aucun test probabiliste connu.** `psychotechnique:43` lit désormais les
  familles depuis `FAMILY_INFO` au lieu d'en lister six ; `home.spec.ts:26` a
  passé 60 exécutions ciblées et trois suites complètes.

### Procédure obligatoire avant toute livraison

1. `npm run check` vert ;
2. **suite Playwright complète exécutée** — `npm run check` ne l'inclut pas ;
3. aucune livraison fondée sur les seuls tests du lot en cours.

Cette règle est née d'un incident : `planche-aviation-mondiale.spec.ts` est resté
rouge un lot entier sans être vu.

---

## 4. Recherche

- **Source canonique unique** : `buildSearchEntries()`. Elle alimente l'artefact,
  `/recherche`, l'accueil et la palette. Aucune règle de classement n'est
  dupliquée ailleurs.
- **Artefact** : `public/generated/recherche-index.json`, 477 entrées.
- **Génération** : `npm run generate:search-index`, raccordé à `prebuild`, via
  `tsx` (en `devDependencies` seulement — voir `ARCHITECTURE.md`). Écriture
  atomique ; un échec supprime le temporaire et fait échouer le build.
- **Non versionné** (`.gitignore`) : régénéré à chaque build, jamais édité à la
  main.
- **Validation partagée** : `features/search/artefact.ts` sert au générateur et
  au navigateur. Un artefact ne peut pas passer la génération et échouer à
  l'exécution.
- **Chargement différé** : rien avant la première ouverture de la palette.
- **Promesse combinée** : import dynamique et chargement de l'index réunis dans
  une seule promesse **mémorisée avant tout `await`**, donc partagée par les
  ouvertures simultanées. Un échec la libère pour permettre une nouvelle
  tentative.
- **Repli** : le déclencheur **est** le lien `/recherche`. Sans JavaScript il
  navigue ; les clics modifiés restent au navigateur.

### Cache — trois environnements à ne pas confondre

| Environnement                | Constat                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next start` (mesuré, curl)  | `ETag` servi · `If-None-Match` → **304** · gzip **386 618 → 80 699 octets** · **Brotli non appliqué**                                                        |
| Navigateur (banc Playwright) | Le second `fetch` rend **200 depuis le cache mémoire**, pas 304 — c'est le comportement normal du cache navigateur, **pas** une infirmation du 304 ci-dessus |
| Hébergement final            | **Non mesuré.** Aucune conclusion n'en est tirée                                                                                                             |

---

## 5. Performance

- Hub `/eopan` : **532 Ko → 121 Ko** de HTML initial sous `next start`, soit
  **−411 Ko (−77 %)**.
- Index : **373 Ko brut**, **79 Ko transféré**.
- **Aucune requête d'index avant ouverture** — vérifié sur l'accueil, le hub,
  une fiche et une leçon.
- **Une seule requête** à la première ouverture ; **aucune** ensuite dans la
  même session.
- Ouverture complète (import + fetch + rendu) : **570 ms** sur le banc ;
  téléchargement 96 ms, parsing JSON 1,2 ms, validation 0,2 ms, premiers
  résultats 129 ms après saisie. Cache froid 20–24 ms, chaud 10–12 ms.

### Limites méthodologiques

- Les **temps** viennent du serveur Playwright, qui exécute `npm run dev`. Les
  **poids HTML** viennent de `next start` sur un build de production. **Les deux
  jeux ne sont pas comparables** et ne doivent pas être additionnés.
- Le temps d'import dynamique n'est pas isolé du total d'ouverture.
- Aucune mesure n'a été faite sur l'hébergement final.

---

## 6. Nettoyage

- **17 composants historiques supprimés** avec la vitrine qui les maintenait
  seule en vie.
- **Conservés** : `callout`, `data-grid`, `timeline` — montrés par l'index du
  design system, qui est le **système vivant** ; plus `fiche-figure`, `markdown`,
  `methode-fiche-card`, `notice-document`, `print-button`, `relation-block` et
  `types.ts`, tous atteignables depuis la production.
- **`/design-system/fiche` supprimée.** L'index `/design-system` demeure :
  `noindex`, servi en production seulement derrière
  `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM`, absent de la navigation publique, et couvert
  par un test minimal.
- **Fontes** : sur les 238 fiches, les seules familles servies sont
  `plancheSerif`, `plancheSans`, `plancheMono`. **Aucune Geist, Geist Mono ni
  Archivo.** Elles ne vivent plus que sous `(site)`.
- **Gain réel sur les bundles : quasi nul.** CSS 170 → 169 Ko sur une fiche, JS
  et HTML inchangés. Next avait déjà écarté ces composants du code livré. Le
  gain est du code mort en moins, **pas des octets économisés** — le dire
  autrement serait exagérer.

---

## 7. Navigation

- **Aucune barre latérale sur les documents**, volontairement. Les 20 catégories
  du module n'y sont pas listées.
- Elle **reste entière** sur les hubs et les pages de catégorie
  (`(site)/[module]/layout.tsx`) : 20 catégories atteignables.
- Depuis un document, une autre catégorie du même module est à **deux clics**
  (fil d'Ariane → hub → catégorie).
- Restent à **un clic** : fil d'Ariane, fiches voisines, renvois et termes,
  recherche, en-tête global, pied légal.
- **Recherche unifiée** : même palette, même index, même classement sur
  `(planche)` et `(site)`.

### Deux natures de routes

- **Documentaires** — 2 routes portant 252 documents, entièrement PLANCHE.
- **Fonctionnelles** — 48 routes `(site)` encore sous la charte historique.

---

## 8. Dettes restantes

1. **`/fondamentaux/instruments/chaine-pitot-statique`** — ses deux `id="ac"`
   diffèrent (`markerWidth` 6 contre 7). Les rendre uniques **changerait le
   rendu** : les pointes de flèche de la seconde figure passeraient de 7 × 7 à
   6 × 6, retour à l'intention de l'auteur mais changement visuel tout de même.
   Seule page des seize non corrigée. Registre gelé dans
   `schemas-identifiants.test.ts`.
2. **Chantier d'illustration technique** — direction artistique complète encore
   à définir ; les schémas actuels sont provisoires.
3. **Le Banc, famille F** — lettre de cote réservée, aucune interface produite.
4. **48 routes fonctionnelles historiques** — dictionnaire, recherche,
   progression, entraînement, psychotechnique, BIA, cartes, anglais, révision,
   compte, pages légales.
5. **Pages globales et hubs** — non migrés.
6. **Hébergement final** — Brotli et politique de cache réelle **à mesurer**.
   Ce qui est écrit ici vaut pour `next start`.

---

## 9. Annulation et points de restauration

### Commits principaux

`da426fb` M2 · `3b5be5d` M3 · `d3dfdd3` M4 · `d6425d8` M5 · `6e6adb8` M6a ·
`07b1917` M6b · `c678503` M7a · `1e618f1` M7b · `5f4bfd1` M8a · `9dd8810` M8b ·
`51cae37` M9a · `32466a4` M9b

### Commits autonomes de M10, révocables séparément

| Commit    | Objet                                       |
| --------- | ------------------------------------------- |
| `9ac9f2a` | tests — les quatre échecs corrigés          |
| `3890d92` | SVG — quinze pages aux identifiants uniques |
| `9c17cb8` | nettoyage — vitrine et dix-sept composants  |
| `12832bc` | contrôle de l'index du design system        |
| `270b9a8` | recherche à la demande (étape)              |
| `3bea247` | artefact statique généré                    |
| `4d503d9` | palettes `(site)` migrées                   |
| `214bd94` | campagne de stabilité et mesures            |

### Points de restauration distants

- `sauvegarde/m9a` → `51cae37`
- `sauvegarde/m9b` → `f54cfeb`

Le proxy git de cet environnement **refuse `refs/tags`** : les points de
restauration sont des branches.

### Procédure

`git revert <commit>` pour un ensemble ; `git fetch origin <branche> && git
reset --hard <sha>` pour repartir d'un point de restauration. Le dépôt local a
été réinitialisé **deux fois** par l'environnement pendant le chantier : vérifier
`HEAD` au début de chaque reprise, et pousser après chaque étape.

---

## 10. Définition de fin

- **Migration documentaire PLANCHE : terminée.**
- **Consolidation M10 : terminée.**
- **Refonte complète du produit : NON terminée.**

Chantiers suivants, séparés et non engagés : **Le Banc**, les **zones
fonctionnelles** (48 routes), le **chantier d'illustration technique**.
