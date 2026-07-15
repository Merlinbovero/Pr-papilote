# Design System — PrépaPilote

**Référence absolue de l'interface** (Volume II, chapitre 2). Aucun composant, aucune page, aucune fonctionnalité ne s'en écarte sans justification écrite. Complément : `docs/ui-framework.md` (doctrine et règles de décision). Visualisation vivante : route interne `/design-system`.

Direction artistique : rigueur, professionnalisme, aéronautique, documentation technique, précision, confiance — **un manuel technique moderne**. Jamais : futuriste, militaire caricatural, agressif, surchargé, « gaming ». Inspiration de qualité (pas d'apparence) : Apple, Stripe, Linear, GitHub, Notion, Vercel — leur point commun exploité ici : la cohérence.

## 1. Design tokens

Tous les tokens vivent dans `src/app/globals.css` (`:root` clair, `.dark` sombre, exposés via `@theme inline`). **Couleur brute interdite** dans les composants.

### Couleurs

| Token                             | Signification                               | Notes                                 |
| --------------------------------- | ------------------------------------------- | ------------------------------------- |
| `primary`                         | Navigation, action principale, lien         | **Bleu drapeau français** (≈ #0055A4) |
| `secondary`                       | Fonds d'action secondaire                   | Neutre                                |
| `accent`                          | Survols, sélection, état actif de nav       | Bleu très pâle (teinte de `primary`)  |
| `success`                         | Validation, réponse juste, vérifié          | Vert                                  |
| `warning`                         | Attention, à re-vérifier                    | Orange                                |
| `destructive`                     | Erreur, danger, réponse fausse              | Rouge                                 |
| `info`                            | Information neutre (encarts, notes)         | Bleu clair, distinct de `primary`     |
| `background` / `card` / `popover` | Fonds et surfaces                           | 3 niveaux de surface                  |
| `border` / `input` / `ring`       | Séparateurs, contours, focus                |                                       |
| `foreground`                      | Texte principal                             |                                       |
| `muted-foreground`                | Texte secondaire                            |                                       |
| `muted`                           | Fonds discrets, texte tertiaire via opacité |                                       |
| `concours-eopan/eopn/alat`        | Identité concours                           | Badge/liseré uniquement               |
| `chart-1…5`                       | Séries de graphiques                        |                                       |
| `sidebar-*`                       | Navigation latérale                         |                                       |

**Variantes d'état — règle unique** : les états dérivent du token par les utilitaires standard, jamais par de nouveaux tokens : survol `hover:bg-primary/90`, actif `active:bg-primary/80`, désactivé `disabled:opacity-50 disabled:pointer-events-none`, focus `focus-visible:ring-2 ring-ring`. C'est ce qui garantit qu'un état se comporte pareil partout. Contraste : WCAG AA (4,5:1 texte, 3:1 UI) dans les deux thèmes.

### Typographie

Polices : **Geist Sans** (`--font-sans`, interface et lecture) · **Geist Mono** (`--font-geist-mono` : chiffres, codes OACI, fréquences, immatriculations, formules).

| Usage                      | Classe                                                                       | Règle                   |
| -------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| H1 (titre de page, unique) | `text-3xl md:text-4xl font-bold tracking-tight`                              | Un seul par page        |
| H2 (section)               | `text-2xl font-semibold tracking-tight`                                      |                         |
| H3 (sous-section)          | `text-xl font-semibold`                                                      |                         |
| H4–H6                      | `text-lg font-semibold` puis `text-base font-semibold`                       | Rarement nécessaires    |
| Paragraphe                 | `text-base` + `leading-7` en lecture longue                                  | Largeur ≤ `max-w-prose` |
| Légende, méta              | `text-sm text-muted-foreground`                                              |                         |
| Citation                   | `border-l-2 pl-4 italic text-muted-foreground`                               |                         |
| Tableaux                   | `text-sm`, en-têtes `text-muted-foreground`, chiffres `font-mono text-right` |                         |
| Infobulle                  | `text-xs`                                                                    |                         |
| Bouton                     | `text-sm font-medium`                                                        |                         |

Hiérarchie sans saut de niveau. Le confort de lecture prime sur tout effet.

### Espacements

Échelle 4/8 exclusivement — jamais de valeur arbitraire :

| Règle nommée                                  | Valeur                                    |
| --------------------------------------------- | ----------------------------------------- |
| Intérieur de composant dense (badge, cellule) | `p-1`–`p-2`, `gap-2`                      |
| Intérieur de carte / bloc                     | `p-4`–`p-6`, `gap-4`                      |
| Entre éléments d'un bloc                      | `space-y-2` (serré), `space-y-4` (normal) |
| Entre blocs d'une page                        | `space-y-6`–`space-y-8`                   |
| Entre sections                                | `py-12 md:py-16`                          |
| Grilles de cartes                             | `gap-4 md:gap-6`                          |
| Conteneur global                              | `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`  |

Le vide est un composant : chaque marge cite sa règle.

### Rayons

Échelle unique dérivée de `--radius` (0.625rem) : `rounded-sm` (contrôles denses) · `rounded-md` (inputs, boutons) · `rounded-lg` (par défaut) · `rounded-xl` (cartes, surfaces) · `rounded-full` (pastilles, avatars). Jamais de rayon hors échelle.

### Ombres

Trois niveaux, discrets, jamais décoratifs : `shadow-sm` (surface posée : carte au repos) · `shadow-md` (élément soulevé : carte survolée, popover) · `shadow-lg` (au-dessus de tout : modale, palette). Aucune ombre colorée, aucune ombre interne décorative.

### Bordures

Épaisseur unique `border` (1 px), couleur unique `border-border` (`border-input` pour les champs). La hiérarchie s'exprime par la couleur de fond et l'espace, pas par des bordures épaisses. Liseré d'accent éventuel : `border-l-2` + token sémantique (citations, encart Analyse).

### Icônes

**Lucide exclusivement.** Taille `size-4` dans le texte et les boutons, `size-5` en navigation ; `stroke-width` par défaut ; toujours `aria-hidden` avec libellé textuel ou `aria-label` sur le parent. Aucune autre bibliothèque, aucun émoji d'interface.

### Breakpoints officiels

| Nom      | Seuil           | Usage type                        |
| -------- | --------------- | --------------------------------- |
| Mobile   | < 640 px (base) | 1 colonne, navigation en panneau  |
| Tablette | `md:` ≥ 768 px  | 2 colonnes, tableaux complets     |
| Laptop   | `lg:` ≥ 1024 px | Sidebar visible, 3 colonnes       |
| Desktop  | `xl:` ≥ 1280 px | Confort maximal, infobox latérale |

(`sm:` 640 px sert d'intermédiaire mobile large.) Conception desktop-first, implémentation mobile-first ; vérification à 360 / 768 / 1440 px. Aucune fonctionnalité ne disparaît.

## 2. Arborescence du système

```
src/app/globals.css        tokens (source de vérité visuelle)
src/lib/motion.ts          bibliothèque d'animations commune
src/lib/utils.ts           cn() — composition de classes
src/components/ui/         35 primitives shadcn/Radix (génériques, sans métier)
src/components/layout/     structure de site (header, footer, breadcrumb, thème)
src/components/shared/     composants métier réutilisables (catalogue)
src/components/content/    rendu du contenu structuré (RSC purs, à venir)
src/features/*/            composants de moteurs (recherche, quiz, progression…)
src/app/design-system/     vitrine interne de référence
docs/design-system.md      ce document · docs/components.md catalogue vivant
```

## 3. Composants

### Primitives disponibles (35 — shadcn/Radix, ne pas réécrire)

accordion · alert · avatar · badge · breadcrumb · button · card · checkbox · command · dialog · dropdown-menu · empty · field · input · input-group · label · navigation-menu · pagination · popover · progress · radio-group · scroll-area · select · separator · sheet · skeleton · sonner · spinner · switch · table · tabs · textarea · tooltip (+ theme-provider, theme-toggle)

Couverture immédiate de la liste officielle : navigation (menu, onglets, pagination, fil d'Ariane), boutons (variantes `default/outline/ghost/destructive/link`, tailles `sm/default/lg/icon`), formulaires (input, textarea, select, checkbox, radio, switch), états (skeleton, empty, alert, spinner, sonner), affichage (table, accordéon, badge, alerte, modale, popover, tooltip).

### Composants métier du catalogue — construits, chacun avec son écran

`SiteHeader` · `SiteFooter` · `SiteBreadcrumb` · `ModuleCard` (carte concours) · `SearchCommand` (barre + palette de recherche) — détail : `docs/components.md`.

### Blocs éditoriaux par nature d'information (vitrine `/design-system`)

Objectif : **l'œil identifie la nature d'un bloc avant de l'avoir lu.** Chaque
variante porte une couleur porteuse de sens (§ tokens), une icône Lucide et un
intitulé par défaut. Aucune couleur brute : uniquement des tokens.

| Composant  | Variante(s)                                 | Couleur porteuse               | Emploi                                    |
| ---------- | ------------------------------------------- | ------------------------------ | ----------------------------------------- |
| `Callout`  | `definition`                                | `info` (bleu)                  | Définition d'un terme ou d'une notion     |
| `Callout`  | `a-retenir`                                 | `primary` (bleu drapeau)       | Point clé condensé                        |
| `Callout`  | `technique`                                 | `muted` (gris)                 | Donnée chiffrée à connaître               |
| `Callout`  | `citation`                                  | `muted` (gris)                 | Citation courte sourcée                   |
| `Callout`  | `source`                                    | `info` (bleu)                  | Renvoi de source                          |
| `Callout`  | `piege`                                     | `warning` (orange)             | Erreur fréquente / confusion              |
| `Callout`  | `a-verifier`                                | `warning` (orange, pointillés) | Information datée / susceptible d'évoluer |
| `Callout`  | `actuel`                                    | `success` (vert)               | Fait opérationnel du moment               |
| `Callout`  | `historique`                                | `muted` (gris)                 | Repère du passé                           |
| `Timeline` | jalons `{ date, title, body?, highlight? }` | `primary` sur jalon majeur     | Chronologie verticale (gabarit Histoire)  |
| `DataGrid` | paires `{ label, value }`                   | neutre                         | Caractéristiques techniques (clé/valeur)  |

`Callout` est rendu en `<aside>` étiqueté (nature annoncée aux lecteurs
d'écran) ; `DataGrid` en liste de définitions ; `Timeline` en liste ordonnée.
Ces trois blocs sont la brique de base des gabarits spécialisés (Appareil,
Histoire, Géopolitique, RETEX) et de l'enrichissement des fiches.

### Composants métier spécifiés — à construire avec leur gabarit consommateur

| Composant                                                                                      | Gabarit consommateur        | Rôle                                   |
| ---------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------- |
| `FicheCard`, `DocumentCard`, `QuizCard`                                                        | Hubs de catégorie           | Cartes de liste documentaire           |
| `FicheHeader` (3 strates), `VerifiedBadge`, `ReadingTime`                                      | Fiche                       | En-tête normalisé                      |
| `Infobox`                                                                                      | Fiche-objet                 | Données structurées par type           |
| `RelationBlock` (« Notions préalables/complémentaires », « Voir également », « Applications ») | Fiche                       | Encarts générés du graphe              |
| `SourceList`, `Citation`, `InternalLink`, `TermTooltip`                                        | Fiche                       | Appareil documentaire                  |
| `CrossModuleReturn` (pastille retour de passerelle)                                            | Fiche                       | Arbitrage 10                           |
| `MediaGallery`, `PdfViewer`                                                                    | Notice de document          | Documents publics                      |
| `SearchFilters`, `SearchSuggestions`, `RecentlyViewed`                                         | Recherche                   | Filtres, suggestions, historique local |
| `QuestionCard`, `AnswerChoices`, `CorrectionPanel`, `QuizTimer`, `QuizProgress`, `ScoreCard`   | Lecteur/restitution de quiz | Moteur d'entraînement                  |
| `StatCard`, `ProgressGauge`, `TrendChart` (Recharts), `Timeline`                               | Progression                 | Tableaux de bord                       |
| `UploadField`, état hors connexion                                                             | Compte / global             | Différés jusqu'au besoin réel          |

Règle absolue (§14 du chapitre) : **un composant entre au Design System (catalogue + `/design-system` + documentation) avant d'être utilisé dans une page.** Construire « avec son gabarit consommateur » signifie : le composant est développé, documenté et exposé dans la vitrine dans le même commit que le premier écran qui le consomme — jamais après, jamais spéculativement des mois avant.

## 4. Conventions de nommage

- Fichiers `kebab-case.tsx`, composants `PascalCase`, hooks `use-xxx.ts` / `useXxx`.
- Props : `variant` (apparence), `size` (`sm`/`default`/`lg` — trois tailles maximum, uniquement si pertinent), `orientation`, booléens `is*/with*` évités au profit de variantes cva.
- Variantes gérées par **cva** exclusivement ; classes composées par **`cn()`** — jamais de concaténation.
- Tokens : `--color-*` sémantiques ; pas de token « joli », chaque couleur a un sens.
- Un fichier = un composant exporté (+ sous-composants de composition liés, modèle Card/CardHeader).

## 5. Règles d'utilisation et de création

Tout composant du catalogue est : réutilisable (aucune dépendance à une page), indépendant (props + tokens uniquement), documenté (fiche au catalogue), testable (rôles ARIA — un test difficile à écrire = composant mal conçu), responsive, accessible dès la création (clavier, focus visible, ARIA si nécessaire, ordre logique, contraste AA).

États gérés nativement quand ils existent : normal, hover, focus, actif, désactivé, chargement, erreur — via la règle unique des variantes d'état (§1) et les props standard (`disabled`, `aria-invalid`, `loading` si prévu). Jamais de comportement spécial par page.

Performance : Server Component par défaut ; `"use client"` en feuille justifié ; pas de re-render évitable (état au plus près, clés stables) ; pas de dépendance nouvelle sans justification écrite ; React Flow/Recharts/éditeurs en import dynamique.

### Documentation d'un composant (gabarit obligatoire du catalogue)

Rôle (une phrase) · Quand l'utiliser · Quand ne pas l'utiliser (et quoi utiliser à la place) · Variantes et tailles · Props principales · Limites connues · Exemple minimal.

## 6. Animations

Bibliothèque commune : `src/lib/motion.ts` (`DURATIONS` 150/200/300 ms, `TRANSITIONS` enter/exit, `fadeInUp`, `fadeIn`, `staggerContainer`) + transitions CSS simples (`transition-colors duration-150`) pour les survols. Interdits : rebond, rotation, zoom > 1.05, effets d'attention. `motion-safe:` en CSS, `<MotionConfig reducedMotion="user">` dans le provider dès la première animation Framer Motion montée. Une animation hors bibliothèque est un défaut de revue.

## 6bis. Photographies et en-têtes de page

Règle éditoriale : **uniquement de vraies photographies, jamais d'images générées**. Chaque photo provient d'une source à licence de libre réutilisation vérifiée (domaine public, CC0, CC BY, CC BY-SA — Wikimedia Commons pour la V1) et n'est que redimensionnée/compressée. Le registre unique `src/lib/photos.ts` porte, pour chaque cliché, l'`alt` français, l'auteur, la licence et la page source ; la page `/credits-photos` les affiche et honore l'obligation d'attribution des licences CC. Les fichiers optimisés vivent dans `public/images/`. Toute nouvelle image passe par le registre — aucune balise `<img>`/`<Image>` décorative ne référence une URL externe.

**Photo par fiche** : chaque fiche peut porter une photographie d'illustration (champ `image` du schéma de fiche — src, alt, auteur, licence, source) qui montre le sujet (appareil, base, instrument). Affichée en bannière 2:1 en tête de fiche (`FichePhotoBanner`) avec crédit et lien source ; agrégée sur `/credits-photos`. Objectif : aucune fiche sans visuel (chantier progressif par lots).

**En-tête de page unique** : toutes les pages intérieures utilisent `PageHeader` (`src/components/layout/page-header.tsx`) — bandeau photo réelle créditée, **filet d'accent à la couleur du concours** (`getModuleAccentVar` : EOPAN bleu Marine, EOPN bleu Air, ALAT vert Terre, transverses en `primary`), libellé de section en capitales (eyebrow), titre et description. Les catégories tirent leur photo de `getCategoryPhoto` (photo thématique de la famille, sinon photo du module) : aucune page sans visuel. Sans photo, `PageHeader` se réduit à un en-tête typographique à filet d'accent.

## 7. Risques identifiés

1. **Dérive des variantes** (« encore une taille, encore un variant ») → cva borné à `variant` + `size` (≤ 3 tailles), toute variante nouvelle justifiée en PR.
2. **Composants spéculatifs** construits sans écran réel → interdits ; la table du §3 lie chaque composant à son gabarit.
3. **Divergence vitrine/réalité** → la route `/design-system` importe les vrais composants : elle ne peut pas mentir. Chaque nouveau composant y entre le jour même.
4. **Mise à jour shadcn** écrasant nos adaptations → les primitives sont possédées dans le repo ; toute régénération passe par une PR diffée.
5. **Excès de client components** au fil des contributions → revue systématique de chaque `"use client"` (règle 3 d'AGENTS.md).

## 8. Améliorations futures envisagées

Storybook si l'équipe s'élargit (la vitrine interne suffit à un propriétaire unique) · tests de régression visuelle (Playwright screenshots) sur la vitrine · audit de contraste automatisé des tokens en CI · export des tokens vers d'autres surfaces (PDF imprimables, future app mobile).
