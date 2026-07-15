# Gouvernance, principes et évolution

**Doctrine officielle (Volume II, chapitre 10 — validé).** À partir de ce chapitre, les fondations de PrépaPilote sont **établies**. Les décisions des chapitres 1 à 9 constituent la doctrine du projet. Toute évolution future **respecte cette doctrine ou justifie explicitement son évolution** (nouvelle ADR). PrépaPilote est conçu pour évoluer sur plusieurs années ; cette évolution reste maîtrisée.

> Règle absolue : PrépaPilote n'a pas vocation à être le site le plus complexe, mais **la référence**. Chaque évolution renforce cette ambition.

## 1. Principes fondateurs (priment sur toute fonctionnalité)

1. La **qualité** avant la quantité.
2. La **simplicité** avant la complexité.
3. La **cohérence** avant la nouveauté.
4. La **performance** avant les effets visuels.
5. La **documentation** avant l'improvisation.
6. L'**évolutivité** avant la solution rapide.

## 2. Cadres non négociables

Toute nouvelle interface, tout nouveau contenu s'inscrit dans les cadres existants :

- **Design System** (`docs/design-system.md`, `docs/ui-framework.md`) : construire exclusivement avec le catalogue. Créer un composant est **exceptionnel** — il faut d'abord vérifier qu'aucun existant ne convient, puis l'intégrer au Design System **avant** de l'utiliser.
- **Graphe documentaire** (`docs/editorial/graphe-documentaire.md`) : aucune fiche, aucun document, aucune question, aucune image **isolée**. Chaque objet porte des relations explicites.
- **Recherche** (`docs/editorial/moteur-de-recherche.md`) : tout contenu publié est **immédiatement indexable** ; toute nouvelle famille d'objets doit être retrouvable.
- **Contenu** (`docs/editorial/gestion-documentaire.md`) : l'actif principal. Avant publication, vérifier structure, sources, illustrations, documents, liens internes, compétences, niveau de qualité. **Une excellente fiche vaut mieux que dix médiocres.**
- **Base de données** et **moteur pédagogique** : frontière des données (contenu en Git, données utilisateur en PostgreSQL) et banque de questions unique.

## 3. Critère d'évolution (les trois questions)

Toute nouvelle fonctionnalité répond à **trois questions**. Si l'une reçoit « non », elle est repensée :

1. Résout-elle un problème **réel** ?
2. Respecte-t-elle la **philosophie** de PrépaPilote ?
3. Peut-elle être **maintenue** sur plusieurs années ?

## 4. Idées futures, dette et décisions

- **Idées futures** : consignées dans `docs/idees-futures.md` (décrites, justifiées, priorisées, réévaluées) — jamais développées à chaud. Cela évite l'accumulation de fonctionnalités inutiles.
- **Dette technique** : `docs/dette-technique.md`. Toute simplification provisoire est **documentée** et visible. Une petite dette connue vaut mieux qu'une architecture compliquée et incomprise.
- **Décisions d'architecture (ADR)** : `docs/adr/`. Chaque décision majeure consigne problème, options étudiées, choix retenu, raisons. Le journal de `docs/ARCHITECTURE.md` et les arbitrages de `docs/VISION.md` complètent l'historique.

## 5. Contributions

Une contribution n'est intégrée qu'après validation et respect de : Design System, graphe documentaire, conventions de code (`AGENTS.md`), conventions éditoriales (`docs/editorial/`), contrôles qualité (`npm run check`, `npm run content:check`, `npm run build`, `npm run test:e2e`).

## 6. Documentation

La documentation fait **partie du projet**. Toute évolution importante met à jour, dans le même commit, les documents d'architecture, les conventions et les référentiels concernés (`AGENTS.md`, règle 7). **Un code non documenté est incomplet.**

## 7. Feuille de route

Trois niveaux, pour ne jamais retarder la V1 par du non-essentiel : **V1** indispensable · **V2** améliorations importantes · **V3** innovations long terme. Détail dans `docs/roadmap.md`.
