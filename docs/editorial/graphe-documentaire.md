# Le graphe documentaire — cœur du projet

**Doctrine officielle (Volume II, chapitre 3 — validé).** PrépaPilote n'est pas un ensemble de pages : c'est une base de connaissances ; le site n'est que l'interface qui l'explore. Toute décision technique future respecte cette philosophie.

## L'objet documentaire

Tout contenu est un **objet** : identifiant stable gelé, **famille**, identité (titre, résumé, synonymes), métadonnées (sources, vérification, statut, tags, concours), **relations**, corps selon le gabarit de sa famille. Une page n'existe pas en soi — c'est la projection d'un objet à travers le gabarit de sa famille. Ajouter une connaissance = ajouter un objet et ses arêtes, jamais « créer une page ».

Le dictionnaire, les documents, les questions et les schémas sont des objets comme les autres ; `/dictionnaire`, les hubs et la recherche ne sont que des vues.

## Les familles d'objets

La famille détermine gabarit, modèle d'infobox, métadonnées et prédicats admis :

| Famille                                                                                                                                              | Implémentation                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Appareil · Hélicoptère · Navire · Base · BAN · Régiment · Escadron · Flottille · Armement                                                            | Types de fiches-objet existants                                                                                         |
| **Organisation** (Marine nationale, AAE, ALAT, escadres…) · **Unité** (générique) · **Grade** · **Infrastructure** (catapulte, brin d'arrêt, piste…) | Nouveaux types de fiches-objet (ajoutés au contrat)                                                                     |
| **Concept** (CATOBAR, portance…)                                                                                                                     | Nouveau type de la famille notion — les `notion-*` (BIA, météo, navigation, aéro) en sont les déclinaisons pédagogiques |
| Procédure · Mission · Événement · Personne                                                                                                           | Types existants (processus/contexte)                                                                                    |
| Terme · Document · Question/Quiz · Schéma                                                                                                            | Entités existantes                                                                                                      |

Ajouter une famille = entrée au contrat (versionnée) + gabarit — jamais une improvisation dans un fichier de contenu.

## Les deux registres de relations

**Registre factuel** — entre objets du monde réel, via des **prédicats issus d'un référentiel fermé** (`content/_referentiels/predicats.json`). Chaque prédicat déclare : libellé, **libellé inverse** (une arête déclarée d'un côté est lisible des deux), familles autorisées en source et cible, poids par défaut. Ajout d'un prédicat = PR sur le référentiel, comme une catégorie.

**Registre pédagogique** — inchangé (Prompt 5) : `prerequis` (acyclique), `approfondit`, `complementaire`, `illustre`, `evalue`, `source`, `variante-de` (symétrique).

Validation CI de chaque arête : prédicat existant · familles source/cible compatibles · cible existante. Le rapport éditorial signale les objets pauvres en relations.

## Les trois niveaux de relation et les liens intelligents

Aucune liste de liens n'est rédigée : les encarts sont **calculés** du graphe.

| Niveau             | Alimenté par                                                                                             | Présentation                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Forte**          | `variante-de`, `prerequis`, `embarque-sur`, `dote-de`, `mis-en-oeuvre-par`, `affecte-a` + leurs inverses | Infobox (valeurs-liens), encarts hauts de la colonne latérale                  |
| **Moyenne**        | `approfondit`, `applique`, `fait-partie-de`, documents (`source`), quiz (`evalue`)                       | Encarts latéraux standards                                                     |
| **Complémentaire** | `complementaire`, tags forts partagés, second degré                                                      | « Pour aller plus loin », en fin de fiche, borné — jamais au-dessus du contenu |

Le poids par défaut vient du prédicat ; une arête peut le surcharger (justifié). Les liens sont **déterministes** — relations déclarées et validées, pas d'inférence magique ; l'IA propose des arêtes à l'ingestion, l'humain valide.

## Recherche

L'index couvre tous les objets (le contrat `SearchEntry` le prévoit). « HUD » remonte le terme, la fiche concept, les documents, les quiz et les notions liées, groupés par famille.

## Évolution

Nouveau concours / armée / pays = objets + arêtes, zéro structure. Nouvelle famille ou prédicat = entrée de référentiel/contrat versionnée. Nouvelles langues = dimension de traduction par objet (IDs neutres inchangés) — la structure le permet, le coût réel est la production du contenu traduit.

## Limites assumées et parades

1. Coût déplacé vers la **modélisation** → rapport des objets isolés, checklist de relecture (« quelles arêtes ? »).
2. **Bruit** potentiel → plafonds d'affichage par niveau, complémentaires bornés en bas.
3. **Dérive des prédicats** → référentiel fermé, PR justifiée.
4. **Performance** → résolution au build, sans souci jusqu'à des dizaines de milliers de nœuds ; pré-calcul incrémental prévu ensuite sans changer le modèle.
5. Le graphe **ne remplace pas la taxonomie** : modules/catégories restent la projection de navigation et l'URL canonique. Structure de connaissance (graphe) et plan d'accès (taxonomie) coexistent.
