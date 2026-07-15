# Framework UI — Doctrine officielle

Philosophie du Framework UI de PrépaPilote (Volume II, chapitre 1 — validé). Ce document gouverne la conception de **tout** composant et de **toute** page. Il complète `design-system.md` (tokens, inventaire) : ici le _pourquoi_ et les règles de décision, là le _quoi_.

## Le principe directeur

PrépaPilote est une plateforme documentaire : **le contenu est le produit, l'interface le sert**. Un composant met le contenu en valeur, jamais l'inverse. Le design inspire confiance, rigueur, professionnalisme, efficacité — jamais l'épate. L'utilisateur ne voit jamais la complexité : la simplicité perçue est le résultat d'une architecture soignée, pas d'une architecture pauvre.

## Les six questions avant toute décision

Est-ce évolutif ? Cohérent ? Maintenable ? Réutilisable ? Compréhensible dans cinq ans ? Documentable ?
**Un seul « non » disqualifie la solution.**

## Composants

- Tout écran est une **composition** de composants existants. Jamais d'assemblage improvisé.
- Avant de créer : chercher dans `src/components/ui/`, `shared/`, `layout/`, `features/` et le catalogue `docs/components.md`. **Créer un composant exige de justifier, dans la PR, pourquoi les existants ne suffisent pas.**
- Les composants du framework (destinés au catalogue) sont conçus **génériques d'emblée** : pilotés par props et tokens, sans référence à une page, à un module ou à un contenu particulier.
- Les compositions propres à une route (`_components/`) restent locales et ne prétendent pas à la généricité ; elles sont promues au catalogue à la **deuxième utilisation réelle** — la généricité se prouve par l'usage, elle ne se décrète pas. (Nuance assumée à la règle « un composant mono-page est un mauvais composant » : au niveau du framework elle est vraie ; au niveau des pages, généraliser sans deuxième cas d'usage produit des abstractions fausses, plus coûteuses qu'une duplication temporaire.)

## Pages

Une page assemble des composants, des données et de la navigation — **presque aucune logique**. Toute logique vit dans `src/lib` ou `src/features/*/`. Critère de recette : un nouveau développeur comprend n'importe quelle page en moins de deux minutes. Si une page dépasse ~100 lignes ou contient un calcul, quelque chose est au mauvais endroit.

## Animations

Jamais décoratives. Une animation existe pour : signaler l'interactivité, guider le regard, expliquer une transition, rendre une interaction naturelle. Interdits : spectaculaire, rotations gratuites, effets futuristes, surcharge. Règles techniques dans `design-system.md` (150–300 ms, transform/opacity, `motion-safe`).

## Couleurs = information

Chaque couleur porte un sens, jamais un caprice esthétique :

| Sens                                           | Token                           |
| ---------------------------------------------- | ------------------------------- |
| Navigation, action, lien                       | `primary` (bleu institutionnel) |
| Validation, réponse juste, vérifié             | `success` (vert)                |
| Attention, à re-vérifier                       | `warning` (orange)              |
| Erreur, danger, réponse fausse                 | `destructive` (rouge)           |
| Contenu secondaire                             | `muted` (gris)                  |
| Identité de concours (badge/liseré uniquement) | `concours-*`                    |

Une couleur sans signification définie ici n'entre pas dans l'interface.

## Typographie et espace

- Le texte est l'élément principal du site ; le confort de lecture prime sur tout effet. Hiérarchie stricte (échelle de `design-system.md`), largeur de lecture bornée, un seul `h1`.
- **Le vide est un composant** : chaque marge suit l'échelle 4/8 et une règle nommée (rythme de section, de bloc, de carte). Un chiffre d'espacement « au jugé » est un défaut de revue.

## Performance et dépendances

La performance fait partie de l'expérience. Avant toute nouvelle dépendance : peut-on faire plus simple, plus léger, sans ? **Toute dépendance ajoutée est justifiée dans `docs/ARCHITECTURE.md`** (besoin, alternatives écartées, coût). Écrire cinquante lignes vaut mieux que charger une bibliothèque. Les dépendances lourdes déjà actées (React Flow, Recharts, Framer Motion) se chargent dynamiquement, jamais dans le bundle commun.

## Accessibilité et responsive

L'accessibilité est un critère de qualité de conception, pas une étape finale : clavier, lecteur d'écran, contraste, focus — natifs dans chaque composant (les primitives Radix y pourvoient ; toute composition doit les préserver). Desktop first en conception, excellence mobile exigée : la disposition s'adapte, **aucune fonctionnalité ne disparaît**.

## Code et documentation

Le code est un produit relu pendant des années : lisibilité d'abord ; un commentaire nécessaire à la compréhension signale souvent un code améliorable (les commentaires expliquent les contraintes et les _pourquoi_, pas les _comment_). Chaque décision importante — architecture, composant, convention, dépendance — est documentée (`ARCHITECTURE.md`, `components.md`, ce document).

## Définition de « terminé » pour le Framework UI

Le framework est complet quand **chacun des onze gabarits de pages** (ARCHITECTURE.md §Routes) peut être construit exclusivement avec le catalogue, sans créer de composant. Toute future page se construit avec cette boîte à outils ; un nouveau composant exige la démonstration que les existants ne suffisent pas.
