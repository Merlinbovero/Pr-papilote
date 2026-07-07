# Stratégie documentaire — ingestion des documents publics

Le corpus grandit par **enrichissement**, pas par accumulation. Ce pipeline s'applique à chaque document public ajouté (arrêté, rapport, brochure, dossier de presse, documentation officielle).

## Le pipeline en sept étapes

```
Document public fourni par le propriétaire
  1. NOTICE        → content/documents/ : titre, émetteur, date, type, droits,
                     lien officiel ; binaire dans Storage uniquement si le
                     droit de rediffusion est établi (sinon : lien seul)
  2. ANALYSE       → extraction assistée (Claude) des informations factuelles
                     candidates, chacune avec sa localisation dans le document
  3. DÉDOUBLONNAGE → recherche interne (IDs, tags, dictionnaire) : l'information
                     existe-t-elle déjà ? est-elle contredite ? plus récente ?
  4. RAPPORT       → proposition structurée : enrichissements de fiches
                     existantes (diff), fiches nouvelles (uniquement si aucun
                     ancrage), questions candidates, termes candidats
  5. VALIDATION    → relecture humaine du propriétaire, par PR — RIEN ne se
                     publie sans elle (VISION.md, arbitrage 2)
  6. INTÉGRATION   → chaque fait ajouté porte la relation `source` vers la
                     notice ; `verifiedAt` mis à jour sur les fiches touchées
  7. TRAÇABILITÉ   → le commit référence le document ; l'historique Git est
                     l'audit trail documentaire
```

## Règles de décision

- **Enrichir avant créer** : une fiche nouvelle exige la démonstration qu'aucune fiche existante ne peut accueillir l'information (recherche préalable obligatoire, étape 3).
- **Le plus récent et le plus officiel gagne** : en cas de contradiction entre sources, prévaut la source officielle la plus récente ; la fiche le signale si l'écart est notable (« chiffre 2024, précédemment X en 2021 »).
- **Question candidate** : toute information nouvelle qui se prête à une vérification de connaissance (chiffre, date, appellation, procédure) produit une question candidate — c'est ainsi que la banque croît au rythme du corpus.
- **Terme candidat** : tout sigle ou terme technique rencontré sans entrée au dictionnaire produit un terme candidat.
- **Un document jamais exploité est un document en attente**, listé au rapport éditorial — la bibliothèque ne doit pas devenir un grenier.

## Droits

Champ `droits` obligatoire sur chaque notice : `lien-seul` (défaut) · `rediffusion-autorisee` (licence ouverte, mention) · `rediffusion-accordee` (autorisation explicite archivée). Le binaire d'un document `lien-seul` ne va **jamais** dans le Storage public.
