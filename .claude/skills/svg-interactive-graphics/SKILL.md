---
name: svg-interactive-graphics
description: SVG interactifs, schémas cliquables, cartes, plans techniques (cockpits, instruments, aéronefs) et diagrammes. Utiliser pour tout graphique vectoriel, schéma pédagogique interactif ou visualisation de données.
---

# SVG & Interactive Graphics

Outils installés : SVG inline React, **react-zoom-pan-pinch** (zoom/déplacement), **@xyflow/react** (React Flow — diagrammes nodaux), **Recharts** (graphiques de données).

## Choisir le bon outil

| Besoin                                                               | Outil                                                 |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| Schéma technique cliquable (cockpit, instrument, plan 3 vues, carte) | SVG inline + composants React                         |
| Grand schéma à explorer (zoom/pan)                                   | SVG dans `<TransformWrapper>` de react-zoom-pan-pinch |
| Diagramme de flux/processus (procédures, arbres de décision)         | React Flow                                            |
| Graphique de données (progression, scores, stats dashboard)          | Recharts                                              |

## SVG interactifs — règles

- SVG **inline en JSX** (pas en `<img>`) pour styler et rendre interactif. Composant client feuille (`"use client"`).
- Toujours `viewBox` sans `width`/`height` fixes + `className="h-auto w-full"` → responsive automatique.
- Couleurs par tokens du thème : `fill-primary`, `stroke-border`, `text-muted-foreground` (le SVG suit alors le mode sombre).
- Zones cliquables : envelopper les `path`/`g` dans des éléments avec `role="button"`, `tabIndex={0}`, `aria-label` descriptif, gestion `onKeyDown` (Enter/Espace) — ou superposer de vrais `<button>` positionnés. Survol : `hover:fill-accent transition-colors cursor-pointer`.
- État de sélection contrôlé par React (`selectedId`), affichage des détails dans un panneau latéral (`Sheet`) ou une `Card` adjacente — pas de tooltip seul (inaccessible au clavier).
- Étiquettes dans le SVG : `<text>` avec `className="fill-foreground text-sm"` ; préférer les étiquettes HTML superposées si le texte doit rester lisible à toutes les tailles.

## Zoom / Pan

```tsx
<TransformWrapper minScale={0.5} maxScale={4} wheel={{ step: 0.1 }}>
  <TransformComponent wrapperClass="!w-full rounded-lg border">
    {/* SVG du schéma */}
  </TransformComponent>
</TransformWrapper>
```

Ajouter des boutons zoom +/−/reset visibles (accessibilité : tout le monde n'a pas de molette/pinch).

## React Flow & Recharts

- React Flow : import via `next/dynamic` (`ssr: false`), nœuds personnalisés = composants React stylés design system, `fitView` par défaut, `<Controls />` + `<MiniMap />` sur les grands graphes.
- Recharts : `<ResponsiveContainer>` obligatoire ; couleurs via tokens (`var(--color-primary)` / `var(--chart-*)`) ; tooltips personnalisés stylés `Card` ; fournir une alternative textuelle (tableau ou résumé) pour l'accessibilité.
