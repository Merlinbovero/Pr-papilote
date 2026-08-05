# Grille de revue humaine — pilotes C2

> **Statut : `accepted_as_initial_standard`**
> **Relecteur :** direction produit — **Date :** 2026-08-05
>
> **Appréciation générale.** « Les rendus sont jugés visuellement réussis et
> suffisamment sérieux pour servir de standard initial aux futurs croquis
> scientifiques. »
>
> **Réserve.** « Validation définitive du rendu typographique à confirmer sur la
> prévisualisation web réelle. »
>
> Les deux modèles deviennent la référence des prochains lots.

## Ce qui a été évalué, et ce qui ne l'a pas été

Le retour reçu porte sur l'**impression d'ensemble** : rendu visuel, sérieux de
la structure, lisibilité, hiérarchie. Les questions ci-dessous n'ont **pas**
reçu de réponse individuelle. Elles restent telles quelles, marquées
`non évalué séparément`, plutôt que remplies d'après ce que la décision globale
laisse supposer : une appréciation d'ensemble n'est pas dix réponses.

La grille reste ouverte — un relecteur peut la compléter question par question
sans que la validation déjà acquise soit remise en cause.

**À remplir par une personne.** Ni le classifieur lexical, ni la garde
structurelle, ni la mesure de rendu ne répondent à ces questions : elles
mesurent des boîtes et des rapports de contraste, pas la compréhension.

Regarder les captures de `reports/croquis/revue-c2/`, et de préférence les deux
fiches réelles sur un téléphone :

- `/fondamentaux/instruments/chaine-pitot-statique`
- `/fondamentaux/meteorologie/le-vent`

Relecteur complémentaire : ……………………………………… Date : …………………………

---

## P-4 · Circuit Pitot-statique (`chaine-anemobarometrique`)

| #   | Question                                                            | Réponse                 |
| --- | ------------------------------------------------------------------- | ----------------------- |
| 1   | Ai-je compris la question pédagogique en moins de dix secondes ?    | `non évalué séparément` |
| 2   | Puis-je expliquer le phénomène sans lire la fiche ?                 | `non évalué séparément` |
| 3   | Puis-je identifier les variables et leurs relations ?               | `non évalué séparément` |
| 4   | Les caractères sont-ils confortablement lisibles sur téléphone ?    | `non évalué séparément` |
| 5   | Une flèche ou une ligne peut-elle être interprétée de deux façons ? | `non évalué séparément` |
| 6   | Une information dépend-elle uniquement de la couleur ?              | `non évalué séparément` |
| 7   | Illustration scolaire générique, ou document aéronautique sérieux ? | `non évalué séparément` |
| 8   | Quel élément doit être **supprimé** ?                               | `non évalué séparément` |
| 9   | Quel élément **manque** ?                                           | `non évalué séparément` |
| 10  | Ce croquis mérite-t-il de devenir le modèle des suivants ?          | `non évalué séparément` |

Remarques libres :

> …

---

## P-6 · Triangle des vitesses (`triangle-des-vitesses`)

| #   | Question                                                            | Réponse                 |
| --- | ------------------------------------------------------------------- | ----------------------- |
| 1   | Ai-je compris la question pédagogique en moins de dix secondes ?    | `non évalué séparément` |
| 2   | Puis-je expliquer le phénomène sans lire la fiche ?                 | `non évalué séparément` |
| 3   | Puis-je identifier les variables et leurs relations ?               | `non évalué séparément` |
| 4   | Les caractères sont-ils confortablement lisibles sur téléphone ?    | `non évalué séparément` |
| 5   | Une flèche ou une ligne peut-elle être interprétée de deux façons ? | `non évalué séparément` |
| 6   | Une information dépend-elle uniquement de la couleur ?              | `non évalué séparément` |
| 7   | Illustration scolaire générique, ou document aéronautique sérieux ? | `non évalué séparément` |
| 8   | Quel élément doit être **supprimé** ?                               | `non évalué séparément` |
| 9   | Quel élément **manque** ?                                           | `non évalué séparément` |
| 10  | Ce croquis mérite-t-il de devenir le modèle des suivants ?          | `non évalué séparément` |

Remarques libres :

> …

---

## Questions de contrôle propres à chaque pilote

Elles ne remplacent pas les dix précédentes ; elles vérifient que le croquis
tient sur le point exact où il pourrait tromper.

**P-4** — sans lire la fiche, le dessin laisse-t-il croire que la sonde Pitot
mesure une vitesse ? Que l'altimètre reçoit la pression du Pitot ? Que le
variomètre mesure directement une vitesse verticale ?

> …

**P-6** — sans lire la fiche, le vecteur vent semble-t-il pointer vers le 360°
plutôt que vers le 180° ? La dérive peut-elle être confondue avec une
déclinaison magnétique ? Les trois vecteurs semblent-ils à la même échelle ?

> …

---

## Décision

- [x] **Accepter comme standard initial** — direction produit, 2026-08-05. Les
      prochains croquis suivront ce modèle.
- [ ] Réviser encore.
- [ ] Abandonner le modèle.

**Condition qui reste attachée à cette acceptation :** la typographie doit être
confirmée sur la prévisualisation web réelle. Les mesures de ce lot ont été
prises dans un navigateur **headless**, dont la pile de polices ne contient pas
`system-ui` ; la graisse y est synthétisée, et les libellés en 600 y paraissent
creux. Ce point n'a **pas** été vérifié sur un appareil réel.

## Correction demandée à la validation, et appliquée

Le libellé du variomètre passe de « vitesse verticale » à **« vitesse verticale
indiquée »**, pour ne pas laisser croire que l'instrument mesure la vitesse
verticale réelle de l'aéronef. Il est désormais rendu sur deux lignes : mesuré,
il occupe 192,5 unités pour une boîte de 162, et la colonne des instruments a
été rééquilibrée pour lui faire place sans réduire aucun autre libellé.
