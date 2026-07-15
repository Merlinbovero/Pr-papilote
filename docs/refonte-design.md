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

## Lots suivants (prévus)

- **D2** — composition des sous-pages : hero internes plus travaillés, cartes de
  catégories plus riches, hiérarchie et respiration renforcées (concours, BIA).
- **D3** — refonte du module cartes : géographie plus réaliste (fond France +
  Corse propre), outre-mer (inset maps), panneau latéral et filtres premium.
- **D4** — harmonisation globale (bannières, cartes, rayons, boutons, overlays,
  densité) et vérification de l'homogénéité perçue.
