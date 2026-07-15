---
name: documentation-generator
description: Documentation du projet — architecture, composants, journal des modifications. Utiliser après tout ajout de feature significatif, création de composant partagé, ou décision d'architecture.
---

# Documentation Generator

## Emplacements

| Document               | Rôle                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| `docs/ARCHITECTURE.md` | Vue d'ensemble : stack, structure des dossiers, décisions et leurs raisons        |
| `docs/CHANGELOG.md`    | Journal des modifications (format Keep a Changelog, en français)                  |
| `docs/components.md`   | Catalogue des composants partagés (`src/components/shared` et `layout`)           |
| `AGENTS.md`            | Règles projet pour Claude Code (conventions, commandes) — importé par `CLAUDE.md` |
| JSDoc/TSDoc            | Sur les fonctions exportées de `src/lib/` et les props non évidentes              |

## Règles d'entretien

- **CHANGELOG** : chaque session de travail significative ajoute une entrée sous `## [Non publié]` dans les catégories `Ajouté / Modifié / Corrigé / Supprimé`. Une ligne par changement visible, orientée utilisateur.
- **Nouveau composant partagé** → entrée dans `docs/components.md` : nom, rôle en une phrase, props principales, exemple d'usage minimal.
- **Décision d'architecture** (choix de lib, structure de données, convention) → section datée dans `ARCHITECTURE.md` : contexte, décision, raison. Deux paragraphes maximum.
- **TSDoc** : documenter le _pourquoi_ et les contrats (unités, invariants, cas limites), pas le _quoi_ évident. Format :

```ts
/**
 * Calcule la note normalisée d'une épreuve selon le barème du concours.
 * @param brut - score brut (0 à nbQuestions)
 * @returns note sur 20, arrondie au demi-point
 */
```

- La documentation se met à jour **dans le même commit** que le code qu'elle décrit — jamais « plus tard ».
- Ne pas documenter les composants `src/components/ui/` (générés par shadcn, documentés sur ui.shadcn.com).
