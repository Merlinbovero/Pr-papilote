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

## Lots suivants (prévus)

- **D3b** — outre-mer (inset maps DOM-TOM) + enrichissement des implantations
  (écoles, régiments, BAN, bases aériennes par armée).
- **D4** — harmonisation globale (bannières, cartes, rayons, boutons, overlays,
  densité) et vérification de l'homogénéité perçue.
