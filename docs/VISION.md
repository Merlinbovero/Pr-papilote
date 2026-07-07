# PrépaPilote — Vision officielle

Document fondateur. Toute décision produit, design ou technique doit être cohérente avec ce document. Il n'est modifié que par décision explicite du propriétaire du projet.

## Le projet

**PrépaPilote** est une plateforme web professionnelle de préparation aux concours :

- **EOPAN** — Élève Officier Pilote de l'Aéronautique Navale (Marine nationale) ;
- **EOPN** — Élève Officier du Personnel Navigant (Armée de l'Air et de l'Espace) ;
- **ALAT** — Aviation Légère de l'Armée de Terre.

Objectif : devenir **la référence francophone** pour ces concours. Le projet est conçu pour évoluer pendant plusieurs années et accueillir plusieurs centaines de pages, plusieurs milliers de fiches et plusieurs dizaines de milliers de questions.

PrépaPilote n'est ni un blog, ni un forum, ni un réseau social, ni une encyclopédie généraliste, ni un site vitrine.

## Les deux missions

1. **Documentation** — retrouver n'importe quelle information publique concernant l'aéronautique militaire française en quelques secondes.
2. **Préparation** — permettre à un candidat de travailler efficacement pendant plusieurs centaines d'heures.

Les deux missions sont d'importance égale.

## Les deux modes

- **Mode documentation** : consultation libre, calme, professionnelle. Aucune statistique, aucun pourcentage, aucune progression visible. Fonctionne sans compte et sans aucune requête vers la base de données.
- **Mode progression** : espace personnel volontairement ouvert par l'utilisateur — heures de travail, quiz, notes, erreurs, historique, points forts/faibles, recommandations.

**Règle fondamentale** : contenu documentaire et progression personnelle sont séparés visuellement et fonctionnellement. Les deux modes partagent les mêmes contenus ; seule la présentation change.

## Les cinq portes d'entrée

1. EOPAN · 2. EOPN · 3. ALAT · 4. Tests psychotechniques · 5. Fondamentaux aéronautiques

Les trois modules concours partagent une structure identique (l'utilisateur ne réapprend jamais l'interface). Les Fondamentaux centralisent les connaissances communes ; les modules concours n'en gardent que les applications opérationnelles. Le module psychotechnique est un ensemble de moteurs d'exercices, avec une couche documentaire de méthodologie.

## Philosophie UX / UI

- L'utilisateur ne se demande jamais où cliquer ; chaque écran a une action évidente.
- Interface professionnelle, sobre, française, institutionnelle, aéronautique, moderne, intemporelle.
- Jamais : HUD futuriste, effets « jeu vidéo », animations spectaculaires, marketing.
- Une animation n'existe que si elle améliore la lisibilité, guide le regard ou clarifie une interaction.
- On impressionne par la facilité d'accès, jamais par la quantité.

## Philosophie des contenus

- Chaque fiche est utilisable **2 minutes ou 1 heure** : trois strates fixes et nommées, identiques sur tout le site — _L'essentiel_, _Approfondir_, _Maîtriser_.
- Le site construit une culture aéronautique, pas seulement une réussite au concours.
- Chaque contenu porte ses **sources** et sa **date de dernière vérification**, affichées.

**Périmètre éditorial** : PrépaPilote couvre tout ce qui peut être utile à la préparation des concours ou à la compréhension du métier de pilote militaire, à condition que les informations soient publiques, pertinentes et cohérentes avec la vocation pédagogique du site.

## Intelligence artificielle

L'IA n'est pas une fonctionnalité visible. L'utilisateur ne discute jamais avec une IA. Elle sert uniquement : la recherche, les recommandations, la veille documentaire, les analyses. **Aucune mise à jour de contenu assistée par IA n'est publiée sans validation humaine.**

## Arbitrages officiels

| #   | Date       | Décision                                                                                                                                                                                                               |
| --- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 2026-07-07 | **Comptes dès la V1**, synchronisés multi-appareils. Supabase (Auth + PostgreSQL + Storage), région UE. Le modèle de données ne repose jamais uniquement sur le stockage local.                                        |
| 2   | 2026-07-07 | **Contenu produit par le propriétaire avec assistance IA**, validation humaine obligatoire avant publication, contenu versionné dans le dépôt (relecture par PR/commit).                                               |
| 3   | 2026-07-07 | **Aucun modèle économique défini** ; les choix techniques ne doivent pas empêcher une évolution future (champ droits extensible dans le profil, aucune gratuité codée en dur).                                         |
| 4   | 2026-07-07 | **Frontière des modes** : contenus partagés, affichages totalement indépendants.                                                                                                                                       |
| 5   | 2026-07-07 | **Périmètre** : formulation officielle ci-dessus (« Philosophie des contenus »).                                                                                                                                       |
| 6   | 2026-07-07 | **Collecte** : uniquement pour améliorer l'expérience (statistiques anonymes de consultation, recherche, recommandations). Aucune collecte intrusive. Analytics sans cookies.                                          |
| 7   | 2026-07-07 | **Hors ligne** : pas en V1 ; l'architecture ne doit pas l'empêcher.                                                                                                                                                    |
| 8   | 2026-07-07 | **Aucune échéance stricte** : la solidité prime sur la vitesse de publication.                                                                                                                                         |
| 9   | 2026-07-07 | **Progressions par module** : cinq espaces (EOPAN, EOPN, ALAT, Fondamentaux, Psychotechnique) + un tableau de bord global agrégé. Sous-jacent : une seule source de données, les progressions sont des vues calculées. |
| 10  | 2026-07-07 | **Passerelles inter-modules symétriques** (relation `variante-de`) + pastille contextuelle « Retour : X » éphémère quand on suit une passerelle. Pas de bouton retour permanent. URL canonique unique par fiche.       |
| 11  | 2026-07-07 | **Récemment consultés** : local à l'appareil, discret, effaçable, ~10 entrées. Aucun compte requis.                                                                                                                    |
| 12  | 2026-07-07 | **Images** : placeholders libres de droits pendant le développement ; remplacement avant mise en ligne par des images dont les droits sont vérifiés. L'architecture ne dépend d'aucune image particulière.             |
| 13  | 2026-07-07 | **Le contenu vit dans le dépôt Git**, jamais en base de données. Supabase ne stocke que les données utilisateur, référencées par identifiants de contenu stables.                                                      |
| 14  | 2026-07-07 | **Hébergement Vercel**. Secrets exclusivement en variables d'environnement.                                                                                                                                            |
| 15  | 2026-07-07 | **Conception desktop-first, implémentation CSS mobile-first.** Aucune fonctionnalité ne disparaît sur mobile ; seule la disposition change.                                                                            |
| 16  | 2026-07-07 | **Référentiel des catégories** : listes des Prompts 2 §6/§7 comme base officielle, à figer définitivement avant la production de contenu ; l'ajout d'une catégorie est une opération de données, pas de code.          |

## Ce que les utilisateurs devront dire un jour

« C'est la référence pour préparer EOPAN, EOPN et ALAT. » · « Je trouve rapidement ce que je cherche. » · « Les fiches sont extrêmement complètes. » · « Les quiz sont remarquables. » · « Je peux y travailler pendant des heures. »
