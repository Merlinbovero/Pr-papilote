---
name: design-system
description: Design system du projet — palette, typographie, espacements, cartes, boutons, tableaux, navigation. Utiliser pour toute décision visuelle ou création d'interface.
---

# UI / UX Design System

Fondation : **shadcn/ui** (style radix-nova, 30 composants dans `src/components/ui/`) + tokens Tailwind v4 dans `src/app/globals.css` + thème clair/sombre via `next-themes` + icônes **Lucide**.

## Règle d'or

Ne jamais recréer un composant qui existe dans `src/components/ui/`. Composer à partir des primitives (Button, Card, Table, Tabs, Dialog, Sheet, NavigationMenu, Command…). Personnaliser via props/`className`/cva, pas en dupliquant.

## Palette

- Uniquement les tokens sémantiques : `primary` (actions), `secondary`, `muted` (fonds discrets, texte secondaire), `accent` (survols), `destructive` (danger), `card`, `border`, `ring`.
- Toute nouvelle couleur (ex. couleur par concours EOPAN/EOPN/ALAT) devient un token dans `globals.css` avec variantes claire + sombre, puis s'utilise via classe Tailwind.
- Contraste WCAG AA minimum (4.5:1 texte normal, 3:1 grand texte) dans les deux thèmes.

## Typographie

- Polices : Geist Sans (texte/UI) et Geist Mono (code, données chiffrées) via `next/font`.
- Échelle : `text-sm` corps secondaire, `text-base` corps, `text-lg/xl` intertitres, `text-2xl–4xl` titres de page (`font-semibold` ou `font-bold`, `tracking-tight`).
- Un seul `h1` par page ; hiérarchie de titres sans saut de niveau.
- Longueur de ligne du contenu pédagogique : `max-w-prose`.

## Espacements et surfaces

- Échelle 4/8 uniquement. Rythme vertical de page : sections en `py-12 md:py-16`, blocs en `space-y-6`.
- Cartes : composant `Card` ; grilles de cartes `grid gap-4 md:gap-6`. Élévation discrète (`shadow-sm`), pas d'ombres lourdes.
- Boutons : hiérarchie stricte — 1 action primaire (`default`) par vue, secondaires en `outline`/`ghost`, danger en `destructive`. Tailles `sm/default/lg` + `icon`.
- Tableaux : primitives `Table` + TanStack Table ; en-têtes `text-muted-foreground`, lignes `hover:bg-muted/50`, alignement numérique à droite.
- Navigation : `NavigationMenu` (desktop), `Sheet` (menu mobile), `Breadcrumb` (fil d'Ariane sur les pages profondes), `Command` (palette de recherche, à brancher sur Fuse.js).

## Feedback

- Chargement : `Skeleton` (jamais de spinner seul sur une page entière).
- Notifications : `sonner` (toast) — monter `<Toaster />` dans le layout racine.
- États vides : message + action suggérée, pas de zone blanche.
