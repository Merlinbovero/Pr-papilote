# Idées futures

Registre des évolutions envisagées (ch. 10 §7). Les idées y sont **décrites, justifiées, priorisées et réévaluées** — jamais développées à chaud. Une idée n'entre dans la feuille de route (`docs/roadmap.md`) qu'après avoir passé le critère des trois questions (`docs/gouvernance.md` §3).

## Format d'une entrée

```
### [ID] Titre court
- Description : ce que c'est, concrètement.
- Justification : quel problème réel cela résout.
- Priorité : V2 / V3 / à réévaluer.
- Risques / coût : dépendances, complexité, dette potentielle.
- Statut : proposée / acceptée / rejetée / réalisée (date).
```

## Registre

### IF-001 Génération assistée de questions

- Description : produire des questions depuis les données structurées (infobox, grades, bases) avec marqueur `generator` et validation humaine.
- Justification : accélère la constitution de la banque sans sacrifier la relecture.
- Priorité : V2.
- Risques : qualité pédagogique variable ; garde-fou = même validation humaine que les questions écrites.
- Statut : proposée.

### IF-002 Lighthouse CI

- Description : mesurer les budgets de performance en continu après déploiement.
- Justification : rendre les budgets de `docs/qualite-technique.md` exécutoires.
- Priorité : V2 (nécessite un déploiement réel à sonder).
- Statut : proposée.

### IF-003 Multilingue

- Description : servir le contenu en plusieurs langues.
- Justification : élargir l'audience à terme.
- Priorité : V3. Chemin déjà réservé (langue « fr » implicite, `schemaVersion`), aucun champ mort aujourd'hui.
- Statut : proposée.

### IF-004 Variantes de fiche par concours

- Description : une même notion déclinée selon le concours préparé.
- Justification : contextualiser sans dupliquer.
- Priorité : V3. Exprimable par IDs stables dédiés.
- Statut : proposée.

### IF-005 Mode hors-ligne

- Description : consultation sans connexion.
- Justification : usage en mobilité.
- Priorité : V3 (explicitement hors V1, arbitrage Prompt 1).
- Statut : proposée.

> Réévaluation : à chaque fin de cycle de production de contenu, ce registre est relu et repriorisé.
