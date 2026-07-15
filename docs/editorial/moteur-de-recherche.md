# Le moteur de recherche — accès principal à la connaissance

**Doctrine officielle (Volume II, chapitre 4 — validé).** La recherche est le moyen principal d'accéder à la base documentaire : l'utilisateur décrit ce qu'il cherche, jamais où le chercher.

## Architecture

Une **recherche unique** (accueil, header, modules — même index, même normalisation, même classement partout) servie par un indexeur au build : chaque objet documentaire produit une entrée d'index **sans être modifié**. L'implémentation évolue derrière l'interface `SearchEntry`/`searchEntries` : mémoire aujourd'hui, index statique séparé vers ~2 000 objets, index fragmenté + Web Worker au-delà de ~5 000 — sans refonte.

## Normalisation française (index ET requête)

Accents pliés (`é→e`), casse ignorée, ponctuation/traits d'union neutralisés, **pluriels ramenés au singulier** (règle simple s/x sur les tokens). « Porte avion », « Porte-avions », « PORTE-AVIONS » → même clé. Fautes de frappe : correspondance floue bornée (distance d'édition).

## Alias

Trois sources, toutes menant à l'**URL canonique unique** (les alias sont des clés d'entrée, jamais des doublons de résultats) :

1. champ `aliases[]` de l'objet (ex. Charles de Gaulle : CDG, Porte-avions, R91) ;
2. synonymes du référentiel de tags ;
3. sigles et synonymes des termes du dictionnaire.

## Classement (jamais alphabétique)

Score composite : **correspondance** (exact > préfixe > contenu > flou ; titre > alias > tags > résumé) + **type d'objet** (fiche/terme > document/quiz > catégorie/module) + **contexte** (module courant = boost, jamais filtre) + **priorité éditoriale** optionnelle. La **popularité interne** rejoindra le score comme facteur plafonné quand les métriques auront des données — jamais au lancement (démarrage à froid, classement toujours explicable).

## Résultat riche (Design System)

Chaque résultat : icône de famille (Lucide) · badge de type · titre · résumé d'une ligne · catégorie. Même composant dans la palette et sur `/recherche`.

## Zéro impasse

La page « Aucun résultat » est interdite. À la place, dans l'ordre : **correction** (« Vouliez-vous dire… », plus proche titre/alias par distance d'édition) · **recherche élargie** automatique et annoncée · **objets proches** · les portes d'entrée des modules. Chaque requête sans résultat est comptée anonymement (capteur de contenu manquant).

## Filtres (jamais obligatoires)

`/recherche` : affinage par module et par type d'objet ; d'autres facettes (niveau, date, armée) s'ajouteront quand les objets les porteront en volume.

## Métriques — sobres et anonymes (différées)

Uniquement : requêtes fréquentes, requêtes sans résultat, requêtes corrigées, objets ouverts depuis la recherche. **Aucun identifiant, aucun cookie, aucune IP conservée** — compteurs agrégés (une ligne par requête normalisée), écrits par rôle de service. Activation à l'intégration Supabase réelle ; le moteur fonctionne intégralement sans.

## Évolutions (sans toucher aux objets)

Plein texte fragmenté (type Pagefind) → synonymes enrichis → multilingue (un index par langue) → sémantique (embeddings au build, statiques) → assistance IA (reformulation/re-classement **en surcouche**, jamais en remplacement).
