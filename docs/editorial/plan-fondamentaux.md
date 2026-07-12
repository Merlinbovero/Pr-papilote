# Plan directeur — Fondamentaux aéronautiques

**Référence officielle de production (validée 2026-07-09).** Ce document gouverne la production de la famille **Fondamentaux aéronautiques**, première famille produite (ordre `docs/roadmap.md` : Fondamentaux → EOPAN → EOPN → ALAT → Dictionnaire). Production **progressive**, fiche par fiche, sur le gabarit officiel ; aucune production de masse ; chaque sous-bloc validé avant le suivant.

## 1. Principes

- **Base de savoir transverse** : ces fiches servent à la fois EOPAN, EOPN, ALAT et le parcours BIA — une seule base documentaire, jamais de duplication.
- **Aucune fiche-objet à infobox** : les Fondamentaux sont du _savoir_. Familles utilisées : `notion-aerodynamique`, `notion-meteo`, `notion-navigation` (famille _notion_), `concept` (notions génériques), `procedure` (savoir-faire, famille _processus_), et `evenement-historique` / `personnage-historique` (famille _contexte_, approfondissements).
- **URL / ID** : `/fondamentaux/<catégorie>/<slug>` · id gelé `fondamentaux.<catégorie>.<slug>`.
- **Relations** : registre **pédagogique** uniquement (prérequis, liées, spécialise) — les prédicats factuels sont réservés au matériel des concours.

## 2. Le BIA est un parcours, pas une catégorie

Le BIA n'est **pas** une catégorie-discipline. Les catégories représentent des **disciplines aéronautiques** ; le BIA est un **parcours pédagogique** qui réutilise ces mêmes fiches. Même principe pour les entrées thématiques d'EOPAN/EOPN/ALAT. Un parcours = un chemin de lecture ordonné sur des IDs de fiches existantes (conception d'URL/format à définir ultérieurement, hors de ce plan). Bénéfice : une base unique sert tous les publics.

## 3. Trois niveaux de priorité (socle ~35 fiches)

- **A — indispensables à la V1** (16) : le cœur incontournable du vol, ouvert par la fiche d'entrée SI & unités.
- **B — importantes, produites juste après** (14).
- **C — approfondissements de la V1** (6).

Au-delà du socle, une réserve d'approfondissements est différée en **V2/V3** (§7).

## 4. Compétences couvertes (référentiel fermé)

| Compétence                           | Alimentée par                                                              |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `connaissances-aeronautiques`        | aérodynamique, mécanique du vol, instruments, réglementation, performances |
| `meteorologie`                       | météorologie                                                               |
| `navigation`                         | navigation, cartographie                                                   |
| `calcul-mental`                      | mathématiques, navigation (temps-vitesse-distance)                         |
| `raisonnement-logique`               | physique, mathématiques                                                    |
| `vision-spatiale`                    | cartographie, instruments, navigation                                      |
| `anglais-aeronautique`               | anglais aéronautique, radio (phraséologie)                                 |
| `attention-concentration`, `memoire` | facteurs humains, radio                                                    |

> Les Fondamentaux nourrissent aussi les **compétences psychotechniques** (calcul mental, vision spatiale, raisonnement) : c'est le pont voulu entre savoir et aptitudes.

## 5. Le socle — 36 fiches, par catégorie et priorité

Légende : **A** indispensable · **B** importante · **C** approfondissement. Compétence principale entre parenthèses.

### Physique utile (`concept`)

- **A** Le Système international d'unités (SI) et les unités aéronautiques — **point d'entrée absolu** (`connaissances-aeronautiques`, `calcul-mental`)
- **A** Pression, forces et unités (`raisonnement-logique`, `connaissances-aeronautiques`)

### Mathématiques utiles — intégrées, jamais isolées (décision 2026-07-09)

Pas de fiche-outil de calcul indépendante. Les notions mathématiques (proportions, conversions, trigonométrie appliquée) sont **intégrées** aux fiches où elles apportent une **valeur directe** : les conversions dans la fiche SI, la règle de trois dans les calculs de navigation, la trigonométrie dans le cap et la dérive. On optimise le parcours d'apprentissage plutôt que d'isoler des outils de calcul.

### Aérodynamique (`notion-aerodynamique`)

- **A** L'air et ses propriétés · **A** La portance · **A** La traînée · **A** Le profil d'aile
- **B** L'écoulement de l'air · **B** Le décrochage aérodynamique
  _(compétence : `connaissances-aeronautiques`)_

### Mécanique du vol (`notion-aerodynamique`)

- **A** Les quatre forces · **A** Axes & gouvernes · **A** Équilibre & centrage
- **B** Le virage (facteur de charge) · **C** Décrochage & vrille
  _(compétence : `connaissances-aeronautiques`)_

### Météorologie (`notion-meteo`)

- **A** L'atmosphère standard · **A** Pression & calage (QNH/QFE) · **A** Le vent
- **B** Température & humidité · **B** Les nuages · **B** Phénomènes dangereux
  _(compétence : `meteorologie`)_

### Navigation (`notion-navigation`)

- **A** La Terre & les coordonnées · **A** Cap, route & dérive · **A** Temps-Vitesse-Distance
- **B** Déclinaison magnétique · **B** Unités de navigation
  _(compétences : `navigation`, `calcul-mental`)_

### Instruments de vol (`concept`)

- **A** L'altimètre
- **B** Chaîne Pitot-statique · **B** L'anémomètre (badin) · **B** L'horizon artificiel
- **C** Conservateur de cap / compas
  _(compétences : `connaissances-aeronautiques`, `vision-spatiale`)_

### Cartographie (`concept`)

- **C** Échelle & mesures _(compétences : `navigation`, `vision-spatiale`)_

### Réglementation publique (`concept`)

- **B** Les espaces aériens (classes A–G) _(compétence : `connaissances-aeronautiques`)_

### Facteurs humains (`concept`)

- **C** Hypoxie & altitude · **C** Désorientation & illusions _(compétences : `attention-concentration`, `memoire`)_

### Radio & communications (`concept`)

- **B** L'alphabet aéronautique OACI _(compétences : `anglais-aeronautique`, `memoire`)_

### Anglais aéronautique (`concept`)

- **C** Vocabulaire de base du vol _(compétence : `anglais-aeronautique`)_

**Répartition** : A = 16 · B = 13 · C = 6 · **total 35** (maths intégrées, non comptées comme fiches isolées).

## 6. Relations principales du graphe (et dépendances de production)

Chaîne de **prérequis** (⇒) et de **liens** (↔) — elle dicte l'ordre d'écriture :

- **Physique · Pression** ⇒ Aérodynamique (portance/traînée), Instruments (Pitot, altimètre), Météo (pression & calage)
- **Maths · Proportions** ⇒ Navigation (temps-vitesse-distance), **Maths · Trigonométrie** ⇒ Navigation (cap & dérive)
- **Aérodynamique** ⇒ **Mécanique du vol** ; _décrochage aérodynamique_ ↔ _décrochage & vrille_
- **Météo · Pression & calage** ↔ **Instruments · Altimètre** ↔ **Réglementation · Espaces aériens** (niveaux/calages)
- **Cartographie · Échelle** ⇒ **Navigation** ; **Navigation · Cap & dérive** ↔ **Météo · Le vent**
- **Instruments · Compas** ↔ **Navigation · Déclinaison magnétique**
- **Radio · Alphabet OACI** ↔ **Anglais · Vocabulaire** ; **Réglementation · Espaces** ↔ **Radio · Organismes**

## 7. Au-delà du socle (différé V2/V3)

Réserve d'approfondissements, hors des 36 : compressibilité/transsonique, domaine de vol (V-n), masses d'air & fronts, METAR/TAF, navigation à l'estime, radionavigation (VOR/GPS), variomètre, instruments gyroscopiques, projections & symboles cartographiques, règles de l'air (VFR/IFR), performances (masse/centrage, distances), physiologie détaillée, phraséologie EN, histoire de l'aviation, culture aéronautique. Ces fiches rejoignent le graphe sans refonte quand leur heure vient.

## 8. Documents publics associés (candidats — droits à établir, défaut `lien-seul`)

Peu, et seulement en **référence** : DGAC/SIA (programme BIA, réglementation) · Météo-France aviation (phénomènes, messages) · SIA cartes OACI/VAC (droits stricts) · OACI alphabet phonétique. Chaque notice suivra `docs/editorial/gestion-documentaire.md`.

## 9. Ordre de production interne

1. **Socle physique** : Physique · SI & unités (point d'entrée) → Physique · Pression, forces et unités (A). Les notions de calcul sont **intégrées** à ces fiches et aux suivantes, jamais isolées.
2. **Cœur du vol** : Aérodynamique (A) → Mécanique du vol (A) → Instruments · Altimètre → Météo (A) → Navigation (A).
3. **Compléments B** : reste aéro/météo/nav/instruments, trigonométrie, espaces aériens, alphabet OACI.
4. **Approfondissements C** du socle.
5. Puis famille suivante (EOPAN), et le **Dictionnaire en dernier**.

Chaque fiche : gabarit officiel, sources vérifiées, relations au graphe, compétences déclarées, passage `content:check` avant `publie`.

## 10. Séquence validée des dix premières fiches (2026-07-09)

Ordre pédagogique optimisé (parcours global, pas seulement des fiches isolées). Chaque fiche est prérequis de la suivante.

1. Le Système international d'unités (SI) et les unités aéronautiques — **publiée**
2. Pression, forces et unités — **publiée**
3. L'air et ses propriétés
4. L'atmosphère standard (ISA)
5. L'écoulement de l'air
6. Le profil d'aile
7. La portance
8. La traînée
9. Les quatre forces du vol
10. Le décrochage aérodynamique

**L'atmosphère standard (ISA)** est avancée en 4ᵉ position : présentée juste après les propriétés de l'air, elle sert de référence à la météorologie, aux instruments, aux performances et à une grande partie de l'aérodynamique. **L'équilibre et le centrage** suit immédiatement cette séquence (fiche 11).
