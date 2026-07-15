# Cartes des bases — architecture consignée

Consigné le 2026-07-15 (phase 4 du plan V1). Trois cartes pédagogiques —
aéronautique navale (BAN), armée de l'Air et de l'Espace, ALAT — reliées au
graphe documentaire.

## Sécurité et précision — règles

- **Données publiques uniquement** : noms, codes et villes des bases telles
  qu'elles apparaissent sur les sites officiels du ministère ;
- **localisation communale** : les marqueurs pointent la **commune**
  (coordonnées de ville, 2 décimales), jamais une emprise, une entrée ou
  une installation ;
- aucune donnée opérationnelle, aucun effectif sensible, aucune zone —
  le contenu du marqueur reprend ce que disent déjà les fiches publiées.

## Les données (`content/_referentiels/implantations.json`)

Une implantation = `{ slug, name, code, ville, departement, armee
(marine|air|terre), statut (active|historique), roles[] (ecole, chasse,
transport, helicopteres, patrouille-maritime, ravitaillement, essais,
soutien, etat-major), lat, lon, ficheId?, liens[] (ficheIds du graphe) }`.
Validation Zod au build, comme tous les référentiels. Une implantation
sans fiche propre (ex. Avord) est reliée à la fiche la plus pertinente du
graphe (les FAS).

## Le rendu

- **Fond de France original** : tracé SVG simplifié (côtes et frontières
  approximées par une trentaine de points projetés) — aucun fond de carte
  externe, conforme au « tout auto-hébergé » ;
- projection équirectangulaire corrigée en latitude (cos 46,5°) sur la
  boîte métropole ; la Corse est incluse ;
- **zoom/pan** via react-zoom-pan-pinch (dépendance déjà au stack) ;
- marqueurs = boutons accessibles (nom complet en aria-label) ; la
  sélection ouvre un **panneau de détail** : code, ville/département,
  statut, rôles, et les **liens du graphe** (fiche de la base, unités,
  appareils, écoles) ;
- **filtres** par rôle et statut (chips à bascule), comptes affichés ;
- la couleur des marqueurs suit l'armée de la carte (token `primary`),
  le statut historique passe en style creux.

## Les routes

`/cartes` (hub — les trois cartes), `/cartes/aeronavale`,
`/cartes/armee-de-l-air`, `/cartes/alat`. Pages = composition ; le
composant `BaseMap` (client) et la projection vivent dans
`src/features/cartes/`.
