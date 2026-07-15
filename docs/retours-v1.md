# Suivi des retours — V1 testable

Journal des constats faits pendant les tests personnels de la V1. Un
retour = une ligne ; on ne supprime jamais une ligne, on change son statut.

Gravité : **bloquant** (empêche l'usage) · **majeur** (dégrade nettement) ·
**mineur** (gêne) · **idée** (amélioration).
Statut : **ouvert** · **en cours** · **corrigé** (avec le lot) · **refusé**
(avec la raison).

| #   | Date       | Problème                                                                                                        | Page concernée            | Gravité | Reproduction           | Correction envisagée                                                                                       | Statut                                                                                                                |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- | ------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | —          | (exemple) Le chronomètre de l'examen reste visible sous le clavier mobile                                       | /bia/examen-blanc         | mineur  | iPhone, clavier ouvert | repositionner le bandeau                                                                                   | ouvert                                                                                                                |
| 2   | 2026-07-15 | Mise en forme jugée peu intuitive — le testeur « n'est pas fan », il faut une navigation beaucoup plus évidente | tout le site              | majeur  | —                      | refonte UX par lots : accueil, hiérarchie visuelle, parcours d'entrée                                      | en cours (lot R1 : accueil 3 temps + navigation header/tiroir ; hubs, catégories et fiches à suivre)                  |
| 3   | 2026-07-15 | Pas d'images réelles : l'accueil, les blocs de modules et les sous-catégories sont uniquement textuels          | accueil + hubs de modules | majeur  | —                      | intégrer de vraies photos sous licence de libre réutilisation, avec crédits (jamais d'images inventées/IA) | corrigé (lot R1 : accueil + hubs modules ; crédits sur /credits-photos ; illustrations de catégories/fiches à suivre) |

## Comment tester efficacement

Parcours conseillés pour une session de test :

1. **Découverte** — accueil → un module → une catégorie → une fiche →
   suivre 3 liens de graphe → retour par le fil d'Ariane ;
2. **Recherche** — chercher un sigle (SNA), un appareil (Rafale), une
   faute de frappe volontaire ;
3. **BIA complet** — hub → une matière → quiz thématique → examen blanc
   entier (chronométré) → correction → suivre un lien « à réviser » ;
4. **Psychotechnique** — session courte, puis session ciblée après un
   score faible volontaire ;
5. **Cartes** — chaque carte, filtres, marqueur → fiche → retour ;
6. **Compte** — inscription, connexion, favoris, progression, déconnexion ;
7. le tout **sur téléphone**, en **thème sombre**, et au **clavier seul**.
