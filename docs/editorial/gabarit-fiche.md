# Gabarit officiel de fiche

**Modèle de référence de toute fiche PrépaPilote** (validé). Toutes les futures fiches respectent ce gabarit, sauf justification exceptionnelle consignée. Prévisualisation vivante : route interne `/design-system/fiche`.

## Les quatre niveaux de lecture (philosophie directrice)

Chaque fiche est pensée pour quatre lectures — c'est cette grille qui décide de la position de chaque élément :

| Niveau | Durée             | Objectif                                        | Zones du gabarit                                                                            |
| ------ | ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **1**  | 30 secondes       | Comprendre immédiatement de quoi parle la fiche | Titre + résumé + infobox + « L'essentiel » — sans scroll en desktop                         |
| **2**  | 5 minutes         | Assimiler l'essentiel pour une révision rapide  | + sommaire + parcours des intertitres, tableaux et encadrés d'« Approfondir »               |
| **3**  | 20–30 minutes     | Étudier en détail                               | + lecture complète, illustrations, schémas interactifs, tableaux, « Pièges », « Maîtriser » |
| **4**  | Approfondissement | Explorer au-delà de la fiche                    | + sources, documents officiels, fiches liées, notions connexes, dictionnaire, quiz associés |

## Structure (desktop ≥ 1024 px : deux colonnes)

1. **Contexte** — fil d'Ariane ; pastille « ← Retour : X » uniquement en arrivée par passerelle inter-modules (éphémère, arbitrage 10).
2. **En-tête** — H1 · résumé (1–2 phrases mises en valeur) · badges module/type/niveau · temps de lecture (calculé) · **badge « Vérifié le »** (passe en `warning` si le cycle de fraîcheur est dépassé) · bouton « Version PDF » (vue impression).
3. **Colonne de lecture (~72ch)** — image officielle (ratio fixe, légende, crédit obligatoire) → **« L'essentiel »** (encadré liseré `primary`, ≤ 250 mots, puces « À retenir ») → sections **Approfondir** (H2 du modèle du type ; tableaux, schémas zoom/pan, encadrés `info`/« Analyse », termes du dictionnaire en souligné pointillé avec infobulle) → **« Pièges et erreurs fréquentes »** (encadré `warning`, si le modèle du type le prévoit) → **Maîtriser** (badge « expert » sobre et discret — jamais dominant, contenu visible, non replié) → **appareil documentaire** (documents associés et téléchargeables avec type/poids ; sources numérotées `[1]` ancrées depuis le texte, « consulté le » affiché) → **« S'entraîner »** (nombre de questions associées + lancement d'un quiz sur cette fiche — pont volontaire vers le mode préparation).
4. **Colonne latérale sticky** — infobox (fiches-objet) · sommaire « Sur cette fiche » avec section active · encarts de relations générés du graphe (Notions préalables · Notions liées · Voir également · Applications).
5. **Pied de fiche** — fiche précédente/suivante dans l'ordre du hub · retour à la catégorie · traçabilité complète (créée, mise à jour, vérifiée, auteur, ID) · « Signaler une erreur ».

## Mobile (< 1024 px)

Ordre linéaire, aucune fonctionnalité retirée : contexte → en-tête → image → **L'essentiel → infobox** (la lecture 30 s reste complète sans scroll profond — arbitrage validé) → sommaire en accordéon → Approfondir → Pièges → Maîtriser → relations → documents et sources → entraînement → pied. Infobulles au tap, cibles ≥ 44 px, tableaux à défilement interne.

## Impression / PDF

Vue `print` dédiée : chrome masqué (header, footer, sommaire, boutons, entraînement) · une colonne · **infobox convertie en tableau sous le titre** · sources intégrales · pied de page « PrépaPilote · ID · vérifiée le … ». Déclenchée par le bouton « Version PDF » (impression navigateur, zéro dépendance).

## Règles arbitrées

1. **Séparation stricte des modes** : la fiche n'affiche jamais pourcentage, progression, statistiques, temps passé ni « marquer comme étudiée ». Seule action personnelle admise, pour un utilisateur connecté : **« Ajouter à ma liste de révision »**, très discrète, sans jamais perturber la lecture ni transformer la fiche en tableau de bord. Toute la progression vit exclusivement dans l'espace Progression. (Cette action arrivera avec l'intégration Supabase réelle.)
2. **« Maîtriser » visible et badgé** : badge sobre, jamais dominant ; le contenu documentaire reste prioritaire.
3. **Infobox** : latérale sticky en desktop, juste après « L'essentiel » en mobile.

## Composants du gabarit (catalogue)

`FicheHeader` · `VerifiedBadge` · `Infobox` · `EssentialBlock` · `FicheSection` (avec badge de strate) · `PitfallsBlock` · `TableOfContents` · `RelationBlock` · `SourceList` · `DocumentList` · `TrainingBlock` · `FicheNav` · `TermTooltip` · `CrossModuleReturn`. Tous prop-pilotés, sans dépendance à une page, documentés dans `docs/components.md`.

Le **format de fichier du contenu** des fiches (corps des sections) sera arrêté avec les cinq fiches pilotes — les composants du gabarit n'en dépendent pas : ils reçoivent des props typées.
