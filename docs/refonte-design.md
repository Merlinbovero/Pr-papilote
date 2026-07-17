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

---

# Passe UI/UX/DA — juillet 2026 (V2)

Seconde passe de direction artistique, en réponse à un audit ergonomique ciblé.
Méthode : **audit → plan → implémentation par incréments vérifiés → tests → ce
rapport**. Chaque incrément est passé par `npm run check` + `npm run build` + la
CI (tests unitaires, e2e Playwright, scan d'accessibilité axe WCAG AA) avant
fusion. Aucune régression d'architecture, de routes, de progression, de SEO ou
de responsive. Contrainte tenue : **pas de couleur brute** (tokens uniquement),
sobriété institutionnelle conservée (aucun effet « gaming / cockpit »).

## Audit — points faibles identifiés

1. **DA trop grise et uniforme.** Les neutres du thème (surtout sombre) étaient
   des gris purs (chroma 0) : impression de « tout gris », une seule strate de
   surface, peu de profondeur.
2. **Barre latérale de module envahissante.** Toujours présente, fixe, elle
   volait la vedette au contenu — la lecture n'était pas au centre.
3. **Hiérarchie de lecture faible** dans les fiches et les cours : le gras se
   fondait dans le texte, les ancres de synthèse manquaient de poids.
4. **Dictionnaire peu soigné** : lignes plates, peu lisible, peu premium.
5. **Cartes des bases** au fond plat en couleurs brutes, sans relief terre/mer.

## Incréments livrés

### UI-1 — Palette « bleu ardoise » multi-surfaces + sommaire repliable

- **Palette retintée** (`globals.css`) : neutres passés du gris pur à un léger
  **bleu ardoise** (teinte 259, celle du bleu drapeau), en clair comme en
  sombre. Vraie **échelle d'élévation** : `background < sidebar < card/popover <
elevated`, avec un nouveau token `--elevated` (utilitaire `bg-elevated`).
  Bordures et survols faiblement bleutés. Contraste AA conservé ou amélioré
  (`--muted-foreground` calibré, vérifié par axe).
- **Sommaire de module repliable** (`module-sidebar-nav.tsx`) : panneau
  **masquable** (état mémorisé en `localStorage`) qui se réduit à un rail étroit
  pour donner toute la place au contenu ; surface distincte, élément actif à la
  couleur du module. Le contenu redevient la priorité.

### UI-2 — Refonte du dictionnaire

- **Navigateur** : entrées en **cartes** sur surface (`bg-card`, survol
  `bg-elevated`, focus visible) au lieu de lignes plates ; badge « Fiche » bleu
  (navigation) ; **traduction anglaise en ligne** ; en-têtes de lettre repensés
  (pastille bleutée + filet + décompte).
- **Page d'un terme** : vraie fiche de référence — carte de définition en avant,
  métadonnées libellées (anglais, synonymes), **renvoi de fiche en carte
  cliquable** (icône + flèche), bloc **« Voir aussi »** reliant les termes d'une
  même fiche (maillage interne).

### UI-3 — Hiérarchie de lecture du contenu

- **Rendu Markdown** (`markdown.tsx`) : le **gras ressort** du texte courant
  (`text-foreground font-semibold`) — ~2 900 occurrences dans le contenu ;
  ajout du rendu `h3`/`h4` et des filets `hr`.
- **Cours** : le bloc **« L'essentiel à retenir »** adopte la carte à filet bleu
  du bloc « L'essentiel » des fiches — même charge visuelle pour l'ancre de
  synthèse, fiche comme cours.

### UI-4 — Cartes des bases : fond terre/mer réaliste

- Fin des **couleurs Tailwind brutes** (`sky-50`, `slate-900/950`) : fond
  **« mer » bleuté** construit sur les tokens (`color-mix` de `--info` sur
  `--background`, adaptatif clair/sombre) et régions en **terre claire**
  (`fill-card`). La France se détache franchement du fond marin, sans couleur
  brute — carte plus réaliste et conforme au design system.

## Décisions notables

- **Retint par tokens plutôt que par page.** La cause du « tout gris » était la
  définition des neutres (chroma 0). La corriger à la racine (tokens) propage la
  profondeur partout, sans toucher les composants (aucune couleur en dur à
  chasser). Choix confirmé par `grep` : zéro couleur brute réintroduite.
- **Sidebar repliable, pas supprimée.** L'index de module reste utile ; on lui
  retire seulement sa dominance. Repli mémorisé, lecture différée (pas d'écart
  d'hydratation).
- **`color-mix` sur tokens pour la mer.** Un dégradé « eau » qui suit
  automatiquement le thème, sans dupliquer des valeurs clair/sombre ni
  réintroduire de couleur brute.
- **Discipline d'accessibilité.** Un premier jet du dictionnaire a fait chuter
  le contraste d'un texte (opacité `/80` → 3,59:1) ; la CE axe l'a bloqué, la
  correction (opacité retirée) est repartie en CI verte. Le garde-fou a joué son
  rôle : rien n'est fusionné en rouge.

## Ce qui reste (pistes d'incréments futurs)

- **Anti-collision des labels** sur la carte quand plusieurs bases sont proches
  (déjà noté au Lot L) et regroupement de marqueurs au dézoom.
- **Sommaire repliable sur mobile** : le repli est aujourd'hui pensé desktop
  (≥ lg) ; la barre de catégories mobile reste l'entrée principale sur petit
  écran.
- **Micro-typographie** : filets de séparation optionnels sous les titres de
  section de fiche pour les fiches très longues (non fait pour éviter la
  surcharge sur les fiches courtes).
