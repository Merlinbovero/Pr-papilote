# Modèles de fiches

## Socle commun à toutes les fiches

Toute fiche, quel que soit son type, suit la même ossature — c'est ce qui rend des milliers de fiches navigables sans réapprentissage :

1. **En-tête** : titre, résumé, badges (module, concours concernés), date de vérification, temps de lecture.
2. **Infobox** (familles objet uniquement) : données structurées à droite (desktop) / en tête (mobile).
3. **L'essentiel** — obligatoire, ≤ 250 mots, autosuffisant : l'utilisateur pressé s'arrête là et sait le principal.
4. **Approfondir** — obligatoire : le développement structuré en sections propres au type.
5. **Maîtriser** — optionnel : le niveau expert (détails fins, cas limites, culture avancée).
6. **Encarts générés automatiquement** (jamais rédigés à la main) : Notions préalables · Notions complémentaires · Voir également · Questions associées (nombre) · Documents · Sources.

Une illustration est **exigée** quand le type la déclare (voir tableaux) ; à défaut, la fiche reste en `relecture` avec un marqueur « illustration manquante ».

## Famille 1 — Fiches-objet (avec infobox)

Types : `appareil`, `base-aerienne`, `ban`, `regiment`, `escadron`, `armement`.

| Type            | Infobox (structurée)                                                                                                                    | Sections obligatoires (Approfondir)                              | Optionnelles                                             | Illustration                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| `appareil`      | constructeur, rôle, armée(s), mise en service, statut, équipage, motorisation, vitesse max, plafond, rayon d'action, armement principal | Rôle et missions · Caractéristiques · Versions · Unités et bases | Historique · Engagements · Culture (surnoms, traditions) | photo/silhouette + trois-vues SVG souhaitée |
| `base-aerienne` | nom complet, code (BA/OACI), localisation, armée, unités stationnées, appareils présents                                                | Missions · Unités stationnées                                    | Historique · Particularités                              | carte de localisation                       |
| `ban`           | idem base, spécificités Marine (BAN, rattachement)                                                                                      | Missions · Flottilles                                            | Historique                                               | carte de localisation                       |
| `regiment`      | appellation, subordination, garnison, appareils, missions, insigne                                                                      | Missions · Appareils · Implantation                              | Historique et traditions                                 | insigne                                     |
| `escadron`      | appellation, base, appareils, missions, insigne (idem flottille pour la Marine)                                                         | Missions · Appareils · Base                                      | Historique et traditions                                 | insigne                                     |
| `armement`      | type, guidage, portée (classe), porteurs, statut                                                                                        | Emploi · Porteurs · Caractéristiques                             | Historique                                               | photo ou schéma                             |

Les infobox sont des **données** (validées par schéma) : elles alimentent les tableaux comparatifs et la génération de questions (« Quel est le porteur du… »).

## Famille 2 — Fiches-notion (pédagogiques)

Types : `notion-bia`, `notion-meteo`, `notion-navigation`, `notion-aerodynamique` (+ physique/maths utiles via `notion-bia` élargi ou tag).

| Section                         | Statut                         | Contenu                                                                   |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| Définition                      | obligatoire (dans L'essentiel) | La notion en langage clair                                                |
| Explication                     | obligatoire                    | Le mécanisme, avec schéma                                                 |
| Formules et ordres de grandeur  | si pertinent                   | En Geist Mono, unités explicites (SI + unités aéro d'usage : kt, ft, hPa) |
| Pièges et confusions fréquentes | fortement recommandée          | **C'est le vivier des questions de quiz**                                 |
| Applications opérationnelles    | recommandée                    | Liens vers les modules concours (relation `approfondit` inverse)          |

Illustration : **quasi obligatoire** (schéma SVG design system). Une notion sans schéma doit le justifier.

## Famille 3 — Fiches-processus

Types : `procedure`, `mission`, `retex`.

- `procedure` : Contexte d'application (obligatoire) · Déroulé étape par étape numéroté (obligatoire) · Points de vigilance / erreurs fréquentes (recommandé) · schéma de flux (React Flow) si > 6 étapes.
- `mission` (type de mission : PO, CAS, SAR, PolMar…) : Définition · Acteurs et moyens · Déroulement type · Exemples réels (liens vers événements/RETEX).
- `retex` : Contexte · Faits établis · Enseignements (obligatoires). **Sources publiques officielles uniquement** (rapports BEA-É, communiqués) ; ton factuel et respectueux, jamais de sensationnalisme ; distinction stricte faits/analyse.

## Famille 4 — Fiches-contexte

Types : `geopolitique`, `evenement-historique`, `personnage-historique`.

- `geopolitique` : Contexte · Acteurs · Enjeux · Place de la France (obligatoires). Encadré « Analyse » **visuellement distinct des faits**. `verifiedAt` ≤ 12 mois exigé.
- `evenement-historique` : infobox (date, lieu, acteurs) · Déroulé · Conséquences · Portée pour la culture concours.
- `personnage-historique` : infobox (dates, armée, faits marquants) · Parcours · Postérité. Neutralité : ni hagiographie ni anachronisme.

## Famille 5 — Terme du dictionnaire

Type : `terme`. Micro-fiche sans strates : définition en 1 à 3 phrases · développement du sigle le cas échéant · équivalent anglais · synonymes · renvoi vers la fiche complète si elle existe. Le terme est **le vocabulaire canonique** du site : les fiches emploient le terme du dictionnaire, l'infobulle au survol affiche sa définition.

## Règle d'ajout d'un type

Un 18e type de fiche = une entrée dans ce document + une extension du schéma (versionnée) + un gabarit de rendu. Jamais un type improvisé dans un fichier de contenu.
