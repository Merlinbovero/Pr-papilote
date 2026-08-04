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
| `success`                         | Validation, réponse juste, vérifié          | Vert (clarté 0,515 en clair — F1a)    |
| `warning`                         | Attention, à re-vérifier                    | Orange                                |
| `destructive`                     | Erreur, danger, réponse fausse              | Rouge (clarté 0,528 en clair — F1a)   |
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

Polices : **Archivo** (`--font-display`, exposée par le token `--font-heading` — **titres** H1/H2, grands titres cinématiques) · **Geist Sans** (`--font-sans`, interface et lecture, corps de texte) · **Geist Mono** (`--font-geist-mono` : chiffres, codes OACI, fréquences, immatriculations, formules). Les `h1` et `h2` héritent automatiquement de la police display (`@layer base`) ; le corps reste en Geist pour la lisibilité. La police display porte l'identité « cinématique institutionnelle » — grotesque sobre à graisses fortes, jamais d'effet « gaming ».

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
| `FicheHeader` (surtitre à filet, titre display), `VerifiedBadge`, `ReadingTime`                | Fiche                       | En-tête normalisé                      |
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

**En-tête de page unique** : toutes les pages intérieures utilisent `PageHeader` (`src/components/layout/page-header.tsx`) — bandeau photo réelle créditée, **filet d'accent à la couleur du concours** (`getModuleAccentVar` : EOPAN bleu Marine, EOPN bleu Air, ALAT vert Terre, transverses en `primary`), libellé de section en capitales (eyebrow **précédé d'un filet d'accent**), titre et description. Le titre est en **police display** (`--font-heading`) ; en taille `hero` (portes d'entrée : hubs concours, BIA) il est agrandi (`text-4xl` → `lg:text-6xl`, extra-bold, `text-balance`) sur une bannière plus haute (18–26 rem), pour le même langage cinématique que le hero d'accueil. Les catégories tirent leur photo de `getCategoryPhoto` (photo thématique de la famille, sinon photo du module) : aucune page sans visuel. Sans photo, `PageHeader` se réduit à un en-tête typographique à filet d'accent.

## 6ter. Le Banc — charte fonctionnelle (lot F1b)

Le Banc est un **poste de travail sous contrainte**, pas un document. L'audit F0b §1 avait montré que les séances empruntaient le vocabulaire des pages de consultation — cartes bordées, même densité, jusqu'à 203 caractères par ligne — alors qu'elles sont l'inverse d'une lecture. Sa charte est donc distincte, et **autonome** : elle suit la discipline colorimétrique de PLANCHE sans dépendre d'aucun de ses fichiers.

**Portée.** Tout est émis sous `.banc` (`src/styles/banc.css`), jamais sur `:root`, et préfixé `--bc-`. Tant qu'aucun élément ne porte la classe, le produit est inchangé.

| Sujet              | Règle                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encre de famille F | Turquoise h 193 — `#036564` clair, `#6BBDBA` sombre. Choisie par la mesure : seul créneau libre de la famille isoluminante, ΔE00 ≥ 13,9 des sept encres PLANCHE, ≥ 16,6 des trois états, dans le gamut sRGB.                          |
| Fonds              | Trois niveaux : cadre, stimulus, réponses. **Recalculés** — les niveaux de PLANCHE, taillés pour du texte documentaire, faisaient tomber `juste` et `attention` sous 4,5.                                                             |
| Hiérarchie         | Par la **surface**, jamais par la bordure : la carte bordée appartient au registre documentaire.                                                                                                                                      |
| États de réponse   | `juste`, `erreur`, `attention`, `neutre` — chacun avec un **repère non chromatique**. Jamais la couleur seule, jamais l'opacité seule. « Neutralisé après correction » et « désactivé » sont distincts.                               |
| Chronomètre        | Une écriture (`M:SS`, `H:MM:SS`), `role="timer"`, `aria-live="off"`, chiffres tabulaires, formulation naturelle par le contenu accessible. **Aucun seuil n'est codé** : l'état vient du moteur. L'absence de chronomètre est un état. |
| Progression        | Dit l'**avancement**, jamais la position — celle-ci appartient au titre de la question. Une seule barre par séance ; aucune barre si la séance n'a pas de fin connue.                                                                 |
| Mesure de lecture  | Consignes 60–75 caractères, énoncé jusqu'à ~90, stimulus graphique en largeur libre. Des **plafonds CSS**, jamais des coupes.                                                                                                         |
| Cadre              | Une seule largeur, partagée par tous les moteurs.                                                                                                                                                                                     |
| Mode séance        | Au lancement : l'introduction se replie, l'aire entre dans le cadre, le focus s'y déplace, **et le temps ne démarre qu'ensuite**. Consignes rappelables, sortie explicite.                                                            |
| Titre de séance    | La séance porte **son propre `<h1>`**, court, nommant la tâche et jamais la position. Il reçoit le focus au lancement et **nomme le cadre** (`aria-labelledby`). Exactement un `<h1>` par phase — jamais zéro, jamais deux.           |

**Vitrine** : `/design-lab/banc` (catalogue) et `/design-lab/banc/seance` (étalon de densité), derrière `NEXT_PUBLIC_DESIGN_LAB`, `noindex`.

### Le titre principal d'un état interactif

**La règle**, arbitrée le 2026-08-01 :

> Lorsqu'un état interactif remplace la tâche principale et retire le titre de
> la vue précédente, il doit fournir **son propre titre principal**. Un nom
> accessible sur un groupe complète cette structure ; il ne la remplace pas.

Elle dépasse le Banc : elle vaut pour tout écran qui se substitue à un autre
sans changer d'URL.

**Ce que le `role="group"` nommé ne fait pas**, et qui a motivé l'arbitrage. Il
nomme l'aire de jeu, mais il n'a pas la sémantique `heading` ; il n'apparaît
pas dans la liste des titres d'un lecteur d'écran ; il ne constitue pas un
point de repère ; et il n'expose pas la séance comme le nouveau sujet
principal de la vue. L'absence de `<h1>` n'est pas en soi une non-conformité
WCAG A/AA — la norme n'impose pas littéralement un titre de niveau 1 par vue —
mais quand le chapeau éditorial disparaît, la séance devient fonctionnellement
une nouvelle vue et doit en exposer la structure.

**La structure retenue** :

```tsx
<h1 id={idTitre} tabIndex={-1}>Test de dominos</h1>
<div role="group" aria-labelledby={idTitre}>…</div>
```

**Les trois phases** :

| Phase       | `<h1>` présent                 | Focus                         |
| ----------- | ------------------------------ | ----------------------------- |
| Au repos    | le titre **éditorial**         | inchangé                      |
| En séance   | le titre **de séance**, seul   | déplacé sur ce titre          |
| À la sortie | le titre **éditorial** revient | contrat de non-vol du lot F1a |

Le titre de séance est **visible** par défaut, à une échelle de conduite et non
d'édition. Il peut être masqué en `sr-only` si sa présence visuelle est
réellement redondante avec une information déjà affichée — jamais retiré de
l'arbre d'accessibilité. Aucune route ne l'emploie aujourd'hui : vérifié
appelant par appelant, aucune n'affiche son propre titre en séance.

**Une région live n'est pas un substitut** à la structure de titres.

Garde : `e2e/banc-titre-seance.spec.ts`, onze routes × quatre phases.

### Quand une activité prend le registre du Banc

**La règle**, arbitrée au lot F4 :

> Une activité interactive adopte le registre du Banc **uniquement lorsqu'elle
> devient la tâche principale de la vue**. Une activité courte, contextuelle et
> encastrée conserve le registre de son document hôte, même si elle réutilise le
> moteur fonctionnel du Banc.

La frontière n'est donc pas « lecture contre exercice », mais **exercice
subordonné au document** contre **séance autonome qui remplace momentanément le
document comme tâche principale**.

Une interface encastrée reste au registre de son hôte tant qu'elle est
subordonnée au contenu consulté, dépendante de son contexte, courte,
optionnelle, sans attention exclusive, sans parcours autonome complet, et qu'elle
ne justifie pas à elle seule une entrée, une sortie, une reprise ou un résultat
de séance. Le registre distinct devient justifié quand l'utilisateur cesse
temporairement de lire pour entrer dans une activité autonome : lancement
explicite, plusieurs étapes, progression propre, chronomètre éventuel, correction
structurée, résultat final, reprise possible, besoin d'un espace sans
concurrence avec le document.

**Quatre choses à ne pas confondre** — c'est ce que le code mélangeait avant ce
lot : le **registre visuel**, le **moteur fonctionnel**, le **contrat
d'accessibilité** et le **modèle de données**. Un quiz encastré garde le premier
de son hôte tout en partageant les trois autres avec le Banc.

| Variante       | Pour              | Prend                                                                                                                                                   | Ne prend pas                                                                                            |
| -------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `banc`         | séances autonomes | tout le registre                                                                                                                                        | —                                                                                                       |
| `documentaire` | quiz encastrés    | sémantique, focus après validation, annonces, corrections accessibles, clavier, états juste/faux/désactivé, lien distingué autrement que par la couleur | fond du Banc, cadre de séance, plein écran, typographie complète, disparition de l'en-tête documentaire |

**Il n'y a que ces deux valeurs, et il n'y a plus de défaut — clôture au lot
F12.** Une troisième, `legacy`, a existé de F2a à F12 pour désigner le rendu
**non encore arbitré** ; elle était la valeur par défaut. C'était juste pendant
la migration : un appelant que personne n'avait encore examiné ne changeait pas
d'apparence tout seul. C'est faux une fois la migration finie — un défaut
permet d'**omettre** le choix, et une omission ne se lit pas dans le code, elle
se déduit de son absence.

La propriété est donc **obligatoire**. Un nouvel appelant ne compile pas sans
avoir tranché : le compilateur pose la question à la place d'une relecture.

**Conséquence, et principal acquis de la clôture** : le contrat
d'accessibilité devient **inconditionnel**. Il était porté par un booléen vrai
pour `banc` et `documentaire`, faux pour `legacy` ; les deux registres restants
le tenant, le booléen disparaît. DT-002 — le lien « Pour approfondir » distingué
par la seule couleur — est soldée par là même, et l'exclusion `link-in-text-block`
qui protégeait la campagne axe est retirée.

**Reclassement.** Si un quiz encastré devient long, chronométré, persistant ou
doté d'un résultat autonome, il franchit le seuil de la séance : il doit alors
proposer une **entrée explicite** vers le Banc, jamais transformer silencieusement
la page documentaire.

### Migration route par route

Le Banc est entré dans le produit **une route à la fois**, chacune servant de témoin à la suivante. Pendant tout le chantier, l'activation a été explicite et typée (`variant="legacy" | "banc"`), `legacy` par défaut : un appelant non migré ne changeait pas d'apparence, et le lecteur de quiz n'a jamais existé qu'en un seul exemplaire — la variante ne porte que la **présentation**, jamais la logique. Le défaut a été retiré à la clôture (F12), une fois qu'il n'y avait plus rien à ne pas migrer.

| Route                 | Lot | État                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/entrainement/eopan` | F2a | **Migrée.** Séance complète : préparation, question, correction, résultats, reprise, erreur de chargement.                                                                                                                                                                                                                               |
| `/reviser`            | F2b | **Migrée.** Mêmes états, plus deux propres à la révision : « rien à réviser » et erreur de chargement récupérable.                                                                                                                                                                                                                       |
| Cinq autres appelants | —   | **Composants** non migrés, `revision-session` exclu. Rendu historique, inchangé — vérifié route par route par `e2e/banc-route-pilote.spec.ts`, dont la liste est le registre des **routes** témoins : six entrées, un nombre qui ne compte pas la même chose. Décompte complet et lacune connue dans [`etat-actuel.md`](etat-actuel.md). |

**Ce que la deuxième route a apporté au Banc**, sans architecture parallèle :

- `lancementDesactive` et `idDescriptionLancement` sur `ModeSeance` — un lancement peut dépendre d'un préalable, et un bouton désactivé doit **dire pourquoi** (`aria-describedby`), sans quoi il forme une impasse ;
- deux **états terminaux** qui ne sont pas des questions : un aboutissement normal (« rien à réviser ») et une erreur bloquante. Tous deux prennent une surface, un titre, et le focus — mais seulement si le système l'a encore, jamais s'il a été déplacé par le candidat entre-temps ;
- la règle du **choix exclusif** : `fieldset` + `legend` + boutons radio natifs, jamais une imitation ARIA. Le contrôle recouvre la pastille (`absolute inset-0 opacity-0`) pour que cible réelle et cible visible coïncident, et la sélection porte une coche en plus de sa teinte.

**Migrer une route, c'est aussi prouver que le moteur n'a pas bougé.** La méthode retenue en F2b : écrire la campagne comportementale **avant** la migration, la faire passer sur la route non migrée, puis la rejouer **octet pour octet** après. Ce que la migration ne doit pas toucher se prouve alors par un `git diff` vide, et non par une affirmation.

**Deux règles nées de la première migration, et vérifiées par rupture délibérée :**

1. **Le registre est chargé par le point d'adhésion** — ce qui pose `.banc` importe `banc.css`. En F1b la feuille n'était importée que par la mise en page du laboratoire : la première migration a donc rendu des classes **inertes**, sans flex, sans surface, sans teinte. Un test qui vérifie la présence de la classe serait passé ; seule la mesure du **style calculé** l'a vu. Les contrôles portent désormais sur `getComputedStyle`.
2. **Le registre est porté par la page, pas par un bloc** — un `.banc` posé sur la seule aire de séance dessine un rectangle tiède dans un fond froid. Le fond du site étant le plus clair des deux (ΔE00 2,16 en clair, 0,86 en sombre), toutes les encres du Banc y mesurent un contraste **supérieur** à celui vérifié sur `--bc-fond` : les tests de jetons gardent le pire cas.

**Effet mesuré sur la route pilote**, bas du premier contrôle de réponse, comparé au **témoin vivant** qu'était alors `/entrainement/eopn` — même gabarit, variante `legacy`, mesuré le même jour (ce témoin a lui-même été migré au lot F3 ; la mesure reste celle du jour où elle a été prise) :

| Viewport           | Témoin `legacy` | Route migrée |
| ------------------ | --------------- | ------------ |
| 1440 × 900         | 509 px          | **347 px**   |
| 390 × 844 (mobile) | 670 px          | **403 px**   |

Sur mobile, la séance entière — énoncé, quatre réponses, validation et les deux issues — tient désormais dans le premier écran.

Les valeurs de 891, 995 et 994 px citées ailleurs dans ce document proviennent de **trois épreuves psychotechniques**, et non de cette route : elles mesurent la même maladie sur les moteurs qui restent à migrer, pas l'avant de celui-ci.

## 7. Risques identifiés

1. **Dérive des variantes** (« encore une taille, encore un variant ») → cva borné à `variant` + `size` (≤ 3 tailles), toute variante nouvelle justifiée en PR.
2. **Composants spéculatifs** construits sans écran réel → interdits ; la table du §3 lie chaque composant à son gabarit.
3. **Divergence vitrine/réalité** → la route `/design-system` importe les vrais composants : elle ne peut pas mentir. Chaque nouveau composant y entre le jour même.
4. **Mise à jour shadcn** écrasant nos adaptations → les primitives sont possédées dans le repo ; toute régénération passe par une PR diffée.
5. **Excès de client components** au fil des contributions → revue systématique de chaque `"use client"` (règle 3 d'AGENTS.md).

## 8. Améliorations futures envisagées

Storybook si l'équipe s'élargit (la vitrine interne suffit à un propriétaire unique) · tests de régression visuelle (Playwright screenshots) sur la vitrine · audit de contraste automatisé des tokens en CI · export des tokens vers d'autres surfaces (PDF imprimables, future app mobile).
