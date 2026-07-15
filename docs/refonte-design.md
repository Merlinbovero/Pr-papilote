# Refonte design / UX — montée en gamme post-V1

Passe de direction artistique visant à porter **toute l'application** au niveau
qualitatif de la page d'accueil (institutionnel, sobre, français, aéronautique,
premium, élégant en thème sombre). Travaillée en lots vérifiés et livrés en
production. La page d'accueil sert de référence : on ne la dégrade pas.

## Lot D1 — Header et cadrage des visuels

**Header repensé.** Les libellés longs (« EOPAN — Marine »…) s'empilaient sur
deux lignes et donnaient une impression brouillonne. Remplacés par **deux menus
déroulants** sobres (`NavigationMenu` radix) :

- **Concours** — EOPAN, EOPN, ALAT, Fondamentaux, chacun avec sa **pastille de
  couleur d'armée** et une courte description ;
- **S'entraîner** — BIA, Psychotechnique, Cartes, Dictionnaire, avec icône et
  description.

Résultat : zone haut-gauche nette, aérée, sans chevauchement ; état actif
visible ; tiroir mobile conservé.

**Cadrage des visuels.** Ajout d'un point focal (`object-position`) au registre
photo (`SitePhoto.focal`), câblé dans `ModuleCard` et `PageHeader`. Réglages :
EOPN (avion décalé à droite) et EOPAN (appontage) mieux centrés sur le sujet
dans les cartes verticales et les bannières ; planche de bord recentrée.

## Lot D2 — Composition des sous-pages

**Bannières hero plus fortes.** `PageHeader` gagne une taille `hero` (bannière
plus haute, texte ancré en bas) appliquée aux **hubs de concours** et au **hub
BIA** — vraies portes d'entrée. Le cadrage des photos (point focal D1) rend le
sujet visible même en bandeau large.

**Cartes de catégories premium.** Nouveau composant `CategoryCard` : icône de
famille (`getCategoryIcon` — avion, ancre, cible, boussole, nuage…) dans une
pastille teintée à la **couleur du module**, titre, décompte, relief au survol
(ombre + montée). Remplace les cartes plates du hub de module. Cohérence sans
photo par catégorie (évite la répétition d'une même image).

**BIA plus éditorial.** Hero photo, cartes de matières à numéro en pastille +
relief au survol, **en-tête photo par matière** (`MATIERE_PHOTOS` : météo,
aérodynamique, espace, cockpit, histoire…).

## Lot D3a — Refonte des cartes : géographie réaliste

Le fond « blob » de ~45 points est remplacé par une **vraie géographie de France
métropolitaine** : régions IGN (données publiques `france-geojson`) projetées en
Mercator au build (`scripts/generate-france-map.mjs` → `content/_referentiels/
france-map.json`, autonome, sans réseau au build). Côtes, Bretagne, Cotentin,
frontières de régions et Corse sont réalistes. La **même projection** place les
marqueurs (`src/lib/cartes/geo.ts`) : ils tombent exactement sur le fond ;
positions pré-calculées au serveur et passées au composant client (le JSON du
fond ne part pas dans le bundle). **Panneau et filtres premium** : marqueurs à la
couleur de l'armée, halo de sélection, labels à liseré blanc lisibles, panneau de
détail avec code d'implantation, liens du graphe, filtres pastille colorés.

## Lot D3b — Outre-mer

Support des **zones** (`zone` : métropole + 6 territoires) et d'un rôle
**Souveraineté**. Les implantations métropolitaines restent sur le fond SVG ;
les implantations d'outre-mer s'affichent en **cartouches (inset)** groupés par
territoire sous la carte — approche honnête, sans fausse géographie. Neuf bases
outre-mer **vérifiées** (sources officielles defense.gouv.fr / Wikipédia,
localisation communale) : 5 bases aériennes (BA 367 Guyane, BA 181 La Réunion,
DA 181 Mayotte, BA 186 Nouvelle-Calédonie, DA 190 Polynésie) et 4 bases navales
(Fort-de-France, Port des Galets, Nouméa, Papeete). Limite assumée : l'ALAT
outre-mer (détachements hélicoptères) n'est pas encore couverte.

## Lot D4 — Harmonisation

Système de cartes unifié : composant **`FicheCard`** (titre, résumé tronqué,
badge optionnel, relief au survol) appliqué aux listes de fiches (pages de
catégorie, matières BIA), cohérent avec `CategoryCard`. Rayons harmonisés
(`rounded-2xl` bannières, `rounded-xl` cartes), même hover (ombre + montée),
même densité. Résultat : les pages internes partagent un langage visuel unique
au lieu d'une juxtaposition de styles.

## Bilan de la passe design

- **Header** : menus déroulants sobres, fin de l'empilement de libellés.
- **Bannières** : `PageHeader` illustré + taille hero, cadrage par point focal,
  code couleur par armée sur toutes les pages intérieures.
- **Sous-pages** : cartes de catégories/fiches premium (icône de famille,
  relief), hero renforcés, BIA plus éditorial.
- **Cartes** : vraie géographie de France (régions IGN), marqueurs alignés,
  outre-mer en cartouches, panneau et filtres premium.
- **Cohérence** : composants partagés (`PageHeader`, `CategoryCard`,
  `FicheCard`), tokens couleur, rayons et survols unifiés.
