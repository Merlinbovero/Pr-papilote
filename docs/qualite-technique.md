# Qualité technique — performance, accessibilité, robustesse

**Doctrine officielle (Volume II, chapitre 9 — validé).** La qualité technique est une fonctionnalité à part entière, aussi importante que la qualité éditoriale. Ces exigences sont **permanentes** — jamais des optimisations de fin de projet. PrépaPilote doit rester rapide, stable et agréable **quel que soit le volume futur de contenus**.

## Philosophie

Avant toute fonctionnalité : est-elle réellement utile ? plus simple ? plus légère ? réutilisable ? On préfère un site **sobre et fluide** à un site spectaculaire mais lent. Toute dépendance lourde remplaçable par une solution plus simple est refusée (déjà appliqué : ni librairie de dates, ni gestionnaire d'état global).

## Objectifs de performance (budgets)

Cibles Core Web Vitals « bon » :

| Métrique | Budget   |
| -------- | -------- |
| LCP      | < 2,5 s  |
| INP      | < 200 ms |
| CLS      | < 0,1    |

- Pages documentaires **statiques / rendues côté serveur** (aucune donnée utilisateur → cache CDN maximal).
- JS initial visé **< ~150 Ko gzip** sur les pages de contenu ; `"use client"` justifié et poussé en feuille.
- Recherche à retour **< 100 ms** (index Fuse.js en mémoire).
- Transitions **≤ 200 ms**, discrètes (bibliothèque `src/lib/motion.ts`).
- **Enforcement Lighthouse CI différé** au premier déploiement réel (il faut un serveur à sonder) ; jusque-là, ces budgets sont la référence de revue.

## Images (§3)

Composant unique `ContentImage` (`src/components/shared/`) sur `next/image` : `alt` obligatoire, **dimensions explicites** (zéro CLS), `loading="lazy"` par défaut, formats modernes (AVIF/WebP) et redimensionnement gérés par Next. Aucune image de contenu ne s'intègre autrement.

## Documents (§4)

La fiche reste prioritaire : les documents volumineux ne bloquent jamais son chargement. La notice de document se consulte à sa propre URL (`/documents/[id]`, ch. 8) ; le binaire n'est chargé que lorsqu'on le consulte.

## Accessibilité (§5)

Engagement **WCAG 2.1 AA**, vérifié **automatiquement** : scan **axe** (`@axe-core/playwright`) sur les pages clés à chaque CI (`e2e/accessibility.spec.ts`) — contraste, rôles, labels, hiérarchie des titres, noms de liens. Règles permanentes : navigation clavier, focus visibles, contraste suffisant, textes alternatifs, hiérarchie des titres, labels explicites, `getByRole` dans les tests. Une régression d'accessibilité **casse la CI**.

> Le scan a d'emblée corrigé trois défauts réels : contraste de `--muted-foreground` sur fond `muted` (0.556 → 0.52), bouton de connexion icône-seule sans nom accessible sur mobile (`sr-only`), et liens de sources distingués par la seule couleur (soulignement permanent).

## Responsive (§6)

Conception desktop-first, implémentation CSS mobile-first. **Aucune fonctionnalité ne disparaît** sur mobile : seule la présentation évolue. Tests E2E Playwright sur deux profils (Desktop Chrome + Pixel 7).

## SEO (§7)

- `metadataBase` + titre par gabarit (`template`), description, `robots` par statut.
- **URL canonique** (`alternates.canonical`) et Open Graph sur fiches et documents.
- `sitemap.xml` (fiches, modules, catégories, dictionnaire, documents visibles) et `robots.txt` (espace personnel et prévisualisations exclus) générés depuis le contenu.
- Maillage interne renforcé **naturellement par le graphe documentaire**.
- URL stables et gelées (IDs de contenu) : aucune URL publiée ne meurt (redirections permanentes).

## Robustesse (§8)

Jamais d'impasse. Page 404 dédiée (`not-found.tsx`), frontières d'erreur `error.tsx` (segment, action réessayer / accueil) et `global-error.tsx` (dernier filet). Contenus manquants → `notFound()`. Liens du graphe et documents associés **validés au chargement** (build rouge si cible inexistante). Recherche à politique « zéro impasse ».

## Tests (§9)

- **Unitaires** (Vitest) : fonctions critiques (recherche, quiz, progression, graphe, fraîcheur, contrôle éditorial, contenu).
- **Intégration** : chargeurs de contenu à intégrité bloquante, résolution du graphe, référentiels.
- **Bout-en-bout** (Playwright, desktop + mobile) : parcours essentiels + accessibilité.

Les tests accompagnent chaque chapitre ; jamais de commit rouge.

## Observabilité (§10)

L'observabilité V1 est **l'intégrité au build** : `content:check` (anomalies éditoriales), validation Zod bloquante, résolution du graphe, scan axe. Le **monitoring runtime** (erreurs, lenteurs) dépend de secrets et est **différé à l'intégration** (Sentry + Vercel Analytics), avec un point d'accroche déjà présent (`console.error` dans les frontières d'erreur).

## Déploiement (§11)

Processus reproductible, aucune mise en production ne le contourne (CI sur chaque PR) :

1. `npm run check` (lint + types + format + tests) ;
2. `npm run content:check` (qualité documentaire) ;
3. `npm run build` ;
4. `npm run test:e2e` (parcours + accessibilité).

Checklist complète de mise en service : `docs/mise-en-service.md`.

## Évolutivité (§12)

Toute nouvelle fonctionnalité respecte le Design System, le graphe documentaire, la base de données et le moteur pédagogique (gouvernance dans `AGENTS.md`, règle 10). **Aucun développement isolé** qui casserait la cohérence.

## Recommandations futures

Lighthouse CI après le premier déploiement ; monitoring d'erreurs (Sentry) et analytics anonymes respectueux (sans cookies tiers) à l'intégration Supabase ; surveillance du budget de bundle dès ~500 pages.

## Règle absolue

La qualité technique est aussi importante que la qualité éditoriale. PrépaPilote reste rapide, stable et agréable, quel que soit le volume de contenus.
