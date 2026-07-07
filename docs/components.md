# Catalogue des composants partagés

Composants de `src/components/shared/`, `src/components/layout/` et des moteurs `src/features/`. Les primitives `src/components/ui/` (shadcn) ne sont pas listées ici — voir [ui.shadcn.com](https://ui.shadcn.com).

Règle : tout nouveau composant partagé ajoute son entrée ici, dans le même commit.

| Composant        | Emplacement                             | Rôle                                                                 | Props principales                                 |
| ---------------- | --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| `SiteHeader`     | `components/layout/site-header.tsx`     | Header global : logo, palette de recherche, thème, connexion         | —                                                 |
| `SiteFooter`     | `components/layout/site-footer.tsx`     | Pied de page sobre : liens vers les cinq modules                     | —                                                 |
| `SiteBreadcrumb` | `components/layout/site-breadcrumb.tsx` | Fil d'Ariane accessible (`aria-label="Fil d'Ariane"`)                | `items: { label, href? }[]`                       |
| `ThemeProvider`  | `components/layout/theme-provider.tsx`  | Fournit le thème clair/sombre/système (next-themes, classe)          | `children`                                        |
| `ThemeToggle`    | `components/layout/theme-toggle.tsx`    | Menu de bascule de thème                                             | —                                                 |
| `ModuleCard`     | `components/shared/module-card.tsx`     | Carte d'accueil d'un module : visuel plein cadre, nom en très gros   | `module`, `orientation`, `imageSrc?`, `imageAlt?` |
| `SearchCommand`  | `features/search/search-command.tsx`    | Palette de recherche globale (Ctrl/Cmd+K), filtrage par notre moteur | `entries: SearchEntry[]`                          |

## Moteur de recherche (`src/features/search/`)

- `types.ts` — contrat `SearchEntry` / `SearchOptions` : l'UI ne dépend que de lui.
- `search.ts` — `searchEntries(entries, query, options)` : fonction pure (Fuse.js), testée.
- `entries.ts` — `buildSearchEntries()` : construit l'index depuis les référentiels au build ; s'enrichira des fiches, termes, documents et quiz.

## Modèle d'entrée

### `NomDuComposant`

Rôle en une phrase.

```tsx
<NomDuComposant prop="valeur" />
```
