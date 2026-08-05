# Suivi du lot C2 — croquis pilotes

Document de travail, tenu pendant l'exécution. La doctrine fait autorité
(`convention-schemas.md`), la spécification des pilotes aussi
(`pilotes-c2.md`) ; ce fichier ne fait que tracer **ce qui a été décidé en
cours de route et pourquoi**.

## Décision d'inspection — quel SVG porte quel pilote

`pilotes-c2.md` nommait deux croquis existants par pilote. L'inspection tranche
entre eux, sans en créer aucun.

| Pilote  | SVG reconstruit **en place** | SVG laissé intact        | Motif                                                                                                    |
| ------- | ---------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **P-4** | `chaine-anemobarometrique`   | `pitot-statique-sources` | C'est lui qui relie des organes — famille F7 — et il répond mot pour mot à la question pédagogique de C2 |
| **P-6** | `triangle-des-vitesses`      | `cap-route-derive`       | C'est lui qui compose des vecteurs — famille F3 ; l'autre montre des directions, il n'additionne rien    |

Aucun identifiant nouveau n'est créé : les deux concepts étaient déjà
représentés, et la consigne est de reconstruire en place plutôt que de
dédoubler.

`pitot-statique-sources` répond à une question **antérieure** — d'où viennent
physiquement les deux pressions sur la cellule — et reste donc utile dans sa
section. `cap-route-derive` vit dans une autre fiche et n'entre pas en
concurrence.

## Conséquence attendue sur une dette existante

`src/lib/content/schemas-identifiants.test.ts` fige la dernière paire
d'identifiants dupliqués du corpus : `pitot-statique-sources` et
`chaine-anemobarometrique` déclarent tous deux `id="ac"`, avec des définitions
**divergentes** (markerWidth 7 contre 6).

Reconstruire `chaine-anemobarometrique` avec des identifiants préfixés
**referme cette dette**. Le test doit donc être mis à jour — il est écrit pour
tomber aussi bien quand la dette grandit que quand elle disparaît sans que le
registre suive, et c'est exactement le second cas.

Le fichier de test le disait déjà : ce changement « doit être annoncé et non
découvert ». Il l'est ici.

## Ordre d'exécution — tenu

1. **C2-A** — sources réellement ouvertes, registre mis à jour. Aucun tracé
   n'a commencé avant que ce commit ne soit poussé.
2. **C2-B** — jetons graphiques dans les deux thèmes, contrastes mesurés par rôle.
3. **C2-C** — garde structurelle + onze fixtures négatives + banc de rendu,
   livrés avec un **registre vide** : la règle précède le dessin.
4. **C2-D** — P-4.
5. **C2-E** — P-6.
6. **Clôture** — revue visuelle, rapports, changelog.

## Ce que l'exécution a corrigé dans la spécification

| Point                      | Ce que C1 prévoyait       | Ce que C2 a établi                                                                                  |
| -------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| Domaine de validité de P-4 | « régime subsonique bas » | **≈ 250 kt**, borne sourcée (FR-01)                                                                 |
| Source française de P-4    | aucune                    | **FR-01**, DGAC/DSAC — la nomenclature n'est plus traduite au jugé                                  |
| Variomètre                 | non traité                | instrument **différentiel** à fuite calibrée (F-02 p. 8-7) — il ne mesure pas une vitesse verticale |
| Nomenclature de P-6        | F-03 seule (anglophone)   | **FR-02**, manuel BIA éduscol — cap, route, dérive, Vp, Vs, provenance du vent                      |
| Convention de préfixe      | « trigramme »             | `schemaId__`, la convention **déjà appliquée** par M10                                              |

## Deux pièges rencontrés, consignés pour ne pas les refaire

**Un serveur périmé a menti deux tours de mesure.** `pkill -f "next start"` ne
tue rien : le processus s'appelle `next-server`. J'ai mesuré deux fois un build
antérieur au correctif et j'ai failli conclure que le correctif ne marchait
pas. La parade est désormais systématique — vérifier une chaîne du nouveau
fichier **dans le HTML servi** avant toute mesure.

**Les largeurs de texte estimées à la main étaient fausses.** Elles ont produit
des libellés débordant de leurs boîtes, invisibles au contrôle de chevauchement
puisque les boîtes ne sont pas des étiquettes. Elles se mesurent maintenant avec
`getBBox` dans le navigateur.
