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

## Gabarit de fiche (`src/components/content/` — voir docs/editorial/gabarit-fiche.md)

Prévisualisation vivante : `/design-system/fiche`. Tous prop-pilotés (contrats dans `types.ts`), indépendants du futur format de fichier du contenu.

| Composant           | Rôle                                                                                 | Quand ne pas l'utiliser                                     |
| ------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `FicheHeader`       | En-tête normalisé : H1, résumé, badges, temps de lecture, vérification, bouton PDF   | Hors d'une fiche — les hubs ont leur propre en-tête         |
| `VerifiedBadge`     | Badge de confiance « Vérifié le » (`success`/`warning` selon fraîcheur)              | Pour tout autre statut (utiliser `Badge`)                   |
| `Infobox`           | Données structurées d'une fiche-objet (`card` latérale/mobile, `table` impression)   | Pour du texte libre — l'infobox ne contient que des données |
| `EssentialBlock`    | « L'essentiel » : lecture 30 s + puces « À retenir »                                 | Jamais deux par fiche                                       |
| `FicheSection`      | Section H2 ancrée, badge « Expert » si strate `maitriser`                            | Hors du corps de fiche                                      |
| `PitfallsBlock`     | « Pièges et erreurs fréquentes » (encadré `warning`)                                 | Si le modèle du type ne le prévoit pas                      |
| `TableOfContents`   | Sommaire « Sur cette fiche » avec section active (client, IntersectionObserver)      | Pages courtes sans sections                                 |
| `RelationBlock`     | Encart de relations du graphe (préalables, liées, voir également) ; nul si vide      | Pour des liens libres hors graphe                           |
| `SourceList`        | Sources numérotées ancrées, « consulté le » public                                   | —                                                           |
| `DocumentList`      | Documents associés/téléchargeables avec type et poids                                | —                                                           |
| `TrainingBlock`     | Pont volontaire vers le quiz de la fiche (désactivé tant que le moteur n'existe pas) | Jamais de statistiques personnelles ici                     |
| `FicheNav`          | Pied de fiche : précédent/suivant, retour, traçabilité, signalement                  | —                                                           |
| `TermTooltip`       | Terme du dictionnaire : souligné pointillé + définition en infobulle (client)        | Pour un lien ordinaire                                      |
| `CrossModuleReturn` | Pastille « Retour : X » éphémère de passerelle inter-modules                         | Jamais permanent, jamais dans l'URL canonique               |
| `PrintButton`       | Déclenche la vue impression (client)                                                 | —                                                           |

## Moteur pédagogique (`src/features/quiz/`)

- `engine.ts` — fonctions pures testées : `seededShuffle`/`createRng` (mélange déterministe par graine), `filterQuestions`/`selectQuestions` (sélection pondérée jamais-vues > anciennes > récentes), `isCorrect` (scoring par format), `scoreEpreuve` (barème d'examen, plancher zéro).
- `quiz-player.tsx` — lecteur au design system : question, réponses (choix unique/multiple), correction pédagogique (explication + notes de distracteurs + fiches à approfondir), chronomètre facultatif, progression, restitution ; jouable sans compte. Prévisualisation : `/design-system/quiz`.
- Examen blanc : `examSchema` (contrat) — moteur paramétrique sur la banque, jamais une collection statique.

## Moteur de recherche (`src/features/search/`)

- `types.ts` — contrat `SearchEntry`/`SearchOptions`/`SearchOutcome` : l'UI ne dépend que de lui.
- `normalize.ts` — normalisation française (accents, casse, pluriels) + distance d'édition bornée, testée.
- `search.ts` — scorer pondéré (correspondance × champ × type × contexte × priorité) + flou Fuse.js + `suggestCorrection` + `searchWithFallback` (zéro impasse), testés.
- `entries.ts` — indexeur de build (`buildSearchEntries`, mémoïsé) : modules, catégories, fiches (alias, priorité), termes.
- `search-result-item.tsx` — résultat riche du design system : icône de famille, badge de type, titre, résumé, contexte. Utilisé par la palette et `/recherche`.
- `search-command.tsx` — palette unique (variantes `compact` header / `hero` accueil), boost contextuel via l'URL, correction dans l'état vide.

## Modèle d'entrée

### `NomDuComposant`

Rôle en une phrase.

```tsx
<NomDuComposant prop="valeur" />
```
