# Système éditorial — PrépaPilote

Architecture documentaire officielle. Ces documents gouvernent toute production de contenu ; aucune fiche ne se crée hors de ce cadre. La partie machine-vérifiable du système vit dans `src/lib/content/` (schémas Zod) : **un contenu qui ne passe pas la validation ne se publie pas**.

| Document                                                   | Contenu                                                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [graphe-documentaire.md](graphe-documentaire.md)           | **Le cœur du projet** : objets, familles, prédicats, niveaux de relation                           |
| [taxonomie-et-metadonnees.md](taxonomie-et-metadonnees.md) | Hiérarchie complète, identifiants, tags, dictionnaire des métadonnées                              |
| [modeles-de-fiches.md](modeles-de-fiches.md)               | Les 17 modèles de fiches (5 familles) : sections obligatoires et optionnelles                      |
| [relations-et-quiz.md](relations-et-quiz.md)               | Le graphe documentaire et la stratégie de génération des quiz                                      |
| [strategie-documentaire.md](strategie-documentaire.md)     | Pipeline d'ingestion des documents publics (enrichir avant créer)                                  |
| [regles-editoriales.md](regles-editoriales.md)             | Qualité, style, neutralité, règles de rédaction                                                    |
| [gestion-documentaire.md](gestion-documentaire.md)         | **Chaîne éditoriale (ch. 8)** : workflow, versions/motif, documents, contrôle qualité              |
| [plan-fondamentaux.md](plan-fondamentaux.md)               | **Plan de production** de la famille Fondamentaux aéronautiques (socle 36 fiches, priorités A/B/C) |

## Principes fondateurs

1. **Le contenu est une donnée** : texte structuré + métadonnées validées par schéma, versionné dans `content/`, relu avant fusion. Jamais de page écrite « à la main ».
2. **Propriété unique** : chaque contenu a un module propriétaire et une URL canonique. Les autres modules y accèdent par relations, jamais par copie.
3. **Enrichir avant créer** : une information nouvelle rejoint d'abord une fiche existante. Une fiche ne naît que si aucun ancrage n'existe.
4. **Aucune fiche isolée** : toute fiche publiée porte au moins une source et au moins une relation. Les orphelines sont signalées par la CI.
5. **La fraîcheur est une donnée** : chaque fiche affiche sa date de dernière vérification ; les catégories périssables (géopolitique, RETEX) ont une durée de validité courte.

## Stratégie d'évolution

| Besoin futur                        | Opération                                                                | Code touché                                                            |
| ----------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Nouveau concours                    | Entrée dans `modules.json` (kind `concours`) + dossier `content/<slug>/` | Aucun — les catégories concours et les Fondamentaux sont déjà partagés |
| Nouvelle catégorie / sous-catégorie | Entrée de référentiel                                                    | Aucun                                                                  |
| Fusion / déplacement de catégorie   | Entrée de référentiel + redirections dans `redirects.json`               | Aucun — les IDs gelés préservent relations et données utilisateur      |
| Nouveau contenu                     | Fichier dans `content/`, validé par schéma                               | Aucun                                                                  |
| Nouveau document public             | Notice dans `content/documents/` + binaire dans Storage                  | Aucun                                                                  |
| Nouveau type de fiche               | Modèle documenté ici + extension du schéma (versionnée)                  | `src/lib/content/` uniquement                                          |

Chaque schéma de contenu porte un `schemaVersion` ; une évolution de structure s'accompagne d'un script de migration dans `scripts/` (l'équivalent des migrations SQL, côté fichiers).

## Risques identifiés à l'échelle (et parades)

1. **Dérive taxonomique** (sous-catégories improvisées) → référentiels fermés : créer une sous-catégorie est une décision de référentiel, pas un champ libre.
2. **Relations mortes ou fiches orphelines** → script d'intégrité en CI : cible inexistante = build rouge ; fiche sans relation = avertissement au rapport.
3. **Vieillissement silencieux** (géopolitique, RETEX, conditions de concours) → `verifiedAt` obligatoire + rapport de fraîcheur trié du plus ancien au plus récent, revue périodique planifiée.
4. **Hétérogénéité de style** à plusieurs milliers de fiches → règles de rédaction + le dictionnaire comme vocabulaire canonique + relecture systématique avant fusion.
5. **Banque de questions déséquilibrée** (tout sur les appareils, rien sur la météo) → rapport de couverture questions/fiche par catégorie ; une fiche publiée sans question associée est visible dans le rapport.
6. **Duplication insidieuse entre concours** → test éditorial obligatoire avant création (« quel module propriétaire ? ») + recherche interne préalable (workflow documentaire).
7. **Droits de rediffusion des documents** → champ `droits` obligatoire dans chaque notice ; par défaut on **lie** vers la source officielle, on ne rediffuse que si le droit est établi.
8. **Temps de build** avec des milliers de pages → surveillé dès 500 pages, génération incrémentale prévue (décision déjà consignée dans ARCHITECTURE.md).

## Recommandations d'amélioration

- **Le dictionnaire d'abord** : produire le glossaire tôt — c'est le vocabulaire canonique qui homogénéise toutes les fiches et alimente recherche et infobulles.
- **Une fiche pilote par famille** (objet, notion, processus, contexte, terme) avant toute production en série : elle valide le modèle, le rendu et le coût réel de production.
- `readingTime` et `updatedAt` **calculés** au build (nombre de mots, historique Git), jamais déclarés à la main — une métadonnée manuelle finit toujours fausse.
- Script `content:report` (couverture, fraîcheur, orphelins, équilibre de la banque de questions) à créer avec le pipeline de contenu — c'est le tableau de bord éditorial du propriétaire.
- Les questions **générées** depuis les données structurées (grades, bases, infobox) portent un marqueur `generator` et passent la même validation humaine que les autres.
