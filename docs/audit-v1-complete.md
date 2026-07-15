# Audit consolidé — de la V1 testable à la V1 complète

> Phase 0 du programme « V1 complète ». État des lieux daté du 2026-07-15,
> base de référence pour les lots suivants. Ce document est vivant : chaque lot
> majeur en coche les écarts traités.

## 1. Alignement technique

| Élément               | Valeur                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| Dernier commit `main` | `bba9326` (merge PR #11 — illustration des 150 fiches)                  |
| Déploiement Vercel    | Auto sur `main` (production = `bba9326`)                                |
| Branche de travail    | `claude/setup-professional-dev-environment-3hbmzv` (repartie de `main`) |
| Tests unitaires       | 162 verts (dernier run CI PR #11)                                       |
| E2E Playwright        | 82 (dont 18 scans axe), 2 skips assumés                                 |
| Build                 | vert                                                                    |
| Migrations Supabase   | `0001_user_data`, `0002_favorites`, `0003_objectives`                   |

**Constat d'alignement.** La production est bien sur le dernier code de `main`.
Les captures « plus anciennes » observées auparavant venaient du délai de
déploiement Vercel, pas d'un décalage de source. Rien à corriger côté alignement
(étape 3 de l'ordre d'exécution : soldée).

**Persistance encore locale (`localStorage` uniquement).**

- `src/features/bia/exam-player.tsx` — historique des examens blancs
- `src/features/psychotech/training-session.tsx` — historique des sessions

→ Aucune persistance Supabase branchée côté produit malgré les 3 migrations.
Les tables existent, la progression réelle n'y écrit pas encore. **Écart majeur
Phase 9.**

## 2. Couverture éditoriale

**Totaux.** 150 fiches (toutes `publie`) · 799 questions · 62 termes · **0 document**.

Toutes les fiches ont au moins une question et une photo. Aucune fiche sous
250 mots (médiane 470, min 259, max 773).

### 2.1 Répartition par module / catégorie

| Module              | Fiches | Catégories les plus fournies / les plus creuses                                                  |
| ------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| **fondamentaux**    | 68     | anglais-aéro 18 · aéro 7 · méca-vol 7 · météo 7 — physique 2, carto 2, réglementation 2, radio 2 |
| **eopan**           | 34     | unités 7 · appareils 6 · BAN 4 · concepts 4 — histoire 1, missions 1, culture 1                  |
| **eopn**            | 23     | appareils 8 · bases 5 · organisation 3 — histoire 1, missions 1, sélection 1                     |
| **alat**            | 16     | appareils 5 · unités 4 · organisation 3 — histoire 1, missions 1, présentation 1                 |
| **psychotechnique** | 9      | exercices 8 · méthodologie 1                                                                     |

### 2.2 Écarts éditoriaux prioritaires

- **Histoire** partout squelettique (1 fiche/module) alors que la Phase 6.3
  demande un gabarit immersif — chantier à fort levier.
- **Missions** et **sélection** sous-dotées sur les trois armées.
- **Géopolitique** : catégorie **inexistante** (Phase 6.4 = création de famille).
- **RETEX** : catégorie **inexistante** (Phase 6.5 = création de filière).
- **Appareils** mélangent actuels / historiques / futurs sans hiérarchie de
  statut (Phase 6.2). Aujourd'hui l'infobox appareil est minimale
  (constructeur, rôle, armées, mise en service, statut, équipage) — la Phase 6.1
  exige une infobox technique riche + statuts structurés.
- **Flottilles / unités** quasi identiques (259–336 mots, gabarit répété) —
  candidates à enrichissement (Phase 7).

### 2.3 Photos — dette de précision

36 images uniques pour 150 fiches. Réutilisation forte des images « passe-partout » :

| Réutilisations | Image                                          | Effet                                               |
| -------------- | ---------------------------------------------- | --------------------------------------------------- |
| 27×            | `module-psychotechnique.jpg` (planche de bord) | notions abstraites (instruments, physique, anglais) |
| 12×            | `module-fondamentaux.jpg`                      | fondamentaux divers                                 |
| 10×            | `fiche-rafale-m.jpg`                           | concepts / unités marine                            |
| 8×             | `theme-meteo` / `theme-tour`                   | météo / réglementation                              |

→ Fidèles au sujet mais génériques. **Phase 5** : remplacer progressivement par
des images plus précises (par notion), et prévoir des points focaux
responsive (`focalCard`/`focalHero`) pour EOPAN/EOPN.

## 3. Dictionnaire

62 termes, schéma `{ title, definition, sigleExpansion, synonyms, ficheId, tags }`.
**Aucune catégorie, aucun domaine, aucune traduction, aucun exemple.** Interface
= liste de blocs uniformes. Objectif Phase 12/13 : structurer (catégorie, sigle,
FR/EN, prononciation, exemple, sources, date) et viser ~500 termes utiles +
corpus anglais dédié. **Écart majeur.**

## 4. Fonctions d'entraînement / progression

- **Quiz** : 799 questions, moteur pur en place, mais **pas de mini-quiz par
  fiche depuis la fiche** (le bloc « tester cette notion » manque). Quiz par
  sous-catégorie/catégorie/module transverses à finir (Phase 8).
- **Progression** : moteur de dérivation présent (`src/lib`), dashboard existant,
  mais alimenté par des historiques **locaux** → pas de continuité multi-appareils
  (Phase 9 + Supabase).
- **BIA** : 1 examen blanc (composé par graine). Manquent 4 examens blancs de
  100 questions calibrés, le mode long 200, l'examen dynamique, et la
  vérification de couverture par matière (Phase 10). Banque actuelle 799 Q — à
  auditer par matière pour éviter la répétition sur 4 examens.
- **Psychotechnique** : 7 familles génératives. Manquent dominos, vision
  spatiale, rotation mentale, double tâche, multitâche, 4 niveaux de difficulté
  homogènes, modes découverte/simulation (Phase 11).

## 5. Coquilles & navigation (UX structurelle)

- **Panneau latéral** (`module-sidebar-nav.tsx`) : fonctionnel mais proche d'une
  liste de liens — Phase 2 (regroupements par famille, compteurs, progression,
  accès quiz/glossaire, sticky/scroll, tablette/mobile).
- **Pages autonomes** (BIA, psycho, cartes, dictionnaire, progression, recherche)
  n'ont pas de coquille commune (`max-width`, marges, hero, breadcrumb) — Phase 3
  (`StandalonePageShell`).
- **Hubs / CategoryCard / FicheCard** : une seule variante chacun — Phase 4
  (variantes compacte / éditoriale / technique / historique / appareil).
- **Hiérarchie visuelle** : traitements par nature d'information (définition,
  donnée technique, chronologie, piège, source, exercice…) à créer — Phase 1.

## 6. Confiance & cadre légal

Routes absentes : mentions légales, confidentialité, CGU, contact, avertissement
« projet indépendant non officiel ». `/compte` existe mais export/suppression de
données à vérifier. **Phase 15.**

## 7. Cartes

Fond SVG régions IGN + cartouches outre-mer (9 bases). Manquent : villes
repères, anti-collision des labels, regroupement de marqueurs, mini-cartes
géographiques réelles par territoire d'outre-mer, photo dans le panneau. **Phase 14.**

## 8. Ordre de traitement retenu (par levier / risque)

Le programme fixe l'ordre (étapes 1→25). Regroupement en lots livrables :

1. **Lot A — Audit** (ce document) ✅ + alignement production confirmé.
2. **Lot B — Design system : hiérarchie visuelle** (Phase 1) : composants
   « bloc par nature » (définition, technique, chronologie, piège, source,
   à-retenir, à-vérifier), tokens, doc design-system.
3. **Lot C — Panneau latéral** (Phase 2).
4. **Lot D — StandalonePageShell** (Phase 3) appliqué aux 6 pages autonomes.
5. **Lot E — Hubs / cartes de catégorie & de fiche** (Phase 4) + cadrages
   EOPAN/EOPN responsive (Phase 5).
6. **Lot F — Gabarits spécialisés** (Phase 6) : appareil (infobox technique +
   statuts structurés 6.1/6.2), histoire (chronologie 6.3), puis familles
   géopolitique (6.4) et RETEX (6.5) — schéma + rendu, contenu ensuite.
7. **Lot G — Quiz reliés aux fiches** (Phase 8) : mini-quiz « tester cette
   notion ».
8. **Lot H — Progression + Supabase** (Phase 9).
9. **Lot I — BIA maxé** (Phase 10) : couverture matières, 4 examens 100 Q,
   mode 200, examen dynamique.
10. **Lot J — Psychotechniques** (Phase 11).
11. **Lot K — Dictionnaire + anglais** (Phases 12/13).
12. **Lot L — Cartes** (Phase 14).
13. **Lot M — Légal / confiance** (Phase 15).
14. **Lot N — Performance** (Phase 16).
15. **Lot O — Production éditoriale massive** (Phase 17), gabarits stabilisés.
16. **Lot P — Nouvel audit de production** (étape 25).

Chaque lot : objectif, fichiers, décisions, tests, contrôle visuel, CHANGELOG,
commit, push — et n'est « terminé » que fonctionnel, relié, testé, accessible,
responsive, cohérent, persistant si nécessaire.
