# Design System — PrépaPilote

Direction artistique : professionnelle, sobre, française, institutionnelle, aéronautique, moderne, intemporelle. Jamais : HUD, effets « jeu vidéo », animations spectaculaires. Une visualisation vivante de ce système est disponible sur la route interne `/design-system` (hors production).

## Tokens

Tous les tokens vivent dans `src/app/globals.css` (`:root` = clair, `.dark` = sombre, exposés via `@theme inline`). **Interdiction absolue de couleur brute** dans les composants.

### Palette

| Token                                                | Usage                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `primary`                                            | Accent institutionnel — bleu aéronautique profond. Actions principales, liens actifs, focus.    |
| `secondary` / `muted` / `accent`                     | Fonds discrets, texte secondaire, survols. Neutres.                                             |
| `destructive`                                        | Danger, suppression, réponse fausse.                                                            |
| `success`                                            | Réponse juste, validation, état « vérifié ».                                                    |
| `warning`                                            | Avertissement, contenu à re-vérifier.                                                           |
| `card` / `border` / `ring`                           | Surfaces, séparations, focus.                                                                   |
| `concours-eopan` · `concours-eopn` · `concours-alat` | Marqueurs discrets par concours : liseré, badge, pastille. **Jamais** en thème de page complet. |
| `chart-1…5`                                          | Séries de graphiques (Recharts).                                                                |

Contraste WCAG AA minimum (4,5:1 texte, 3:1 UI) dans les deux thèmes.

### Typographie

- **Geist Sans** : interface et lecture. **Geist Mono** : données chiffrées, codes OACI, fréquences, immatriculations.
- Échelle : `text-sm` secondaire · `text-base` corps · `text-lg`/`text-xl` intertitres · `text-2xl`–`text-4xl` titres (`font-semibold`/`bold`, `tracking-tight`).
- Un seul `h1` par page ; hiérarchie sans saut. Largeur de lecture des fiches bornée (`max-w-prose`).

### Espacements et grille

- Échelle 4/8 stricte : `gap-2/4/6/8`, `p-4/6/8`. Pas de valeur arbitraire sans contrainte documentée.
- Conteneur global : `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` (factorisé dans le layout).
- Conteneur de lecture documentaire : ~72ch. Grilles de cartes : 1 → 2 → 3 colonnes selon breakpoint.
- Rythme vertical : sections `py-12 md:py-16`, blocs `space-y-6`.

### Responsive

Conception **desktop-first** (l'écran de référence est le poste de travail), implémentation CSS **mobile-first** (base = mobile, puis `md:`, `lg:` — mécanique Tailwind). Aucune fonctionnalité ne disparaît sur mobile ; seule la disposition change. Chaque écran est vérifié à 360 px, 768 px et 1440 px.

### Animations

Uniquement au service de la lisibilité : transitions 150–300 ms, `ease-out`, transform/opacity seulement, `motion-safe:`/`useReducedMotion` systématiques. Survol de carte : translation/échelle ≤ 1.02 + ombre discrète.

## États obligatoires

Tout écran définit ses quatre états : **chargement** (`Skeleton`, jamais un spinner pleine page), **vide** (message + action suggérée, jamais de zone blanche), **erreur** (`Alert` + action de récupération), **nominal**. Notifications ponctuelles : `sonner`.

## Inventaire des composants

### Primitives (`src/components/ui/` — shadcn, ne pas réécrire)

accordion · alert · avatar · badge · breadcrumb · button · card · checkbox · command · dialog · dropdown-menu · empty · field · input · input-group · label · navigation-menu · pagination · popover · progress · radio-group · scroll-area · select · separator · sheet · skeleton · sonner · spinner · switch · table · tabs · textarea · tooltip

### Composants métier (créés avec leur premier écran consommateur — voir `docs/components.md`)

| Composant                                                    | Statut                  |
| ------------------------------------------------------------ | ----------------------- |
| Carte de module (accueil)                                    | ✅ V1                   |
| Header / Footer / Breadcrumb de site                         | ✅ V1                   |
| Palette de recherche (Ctrl/Cmd+K)                            | ✅ V1                   |
| Carte documentaire, carte quiz, infobox d'objet              | à venir avec les fiches |
| Encart de relation (« Voir également », « Notions de base ») | à venir avec les fiches |
| Badge « Vérifié le … », pastille retour de passerelle        | à venir avec les fiches |
| En-tête de fiche à trois strates                             | à venir avec les fiches |

**Règle** : ne jamais recréer une primitive existante ; personnaliser par composition, `className` et cva. Tout nouveau composant métier entre au catalogue `docs/components.md` dans le même commit.
