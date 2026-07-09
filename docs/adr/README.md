# Décisions d'architecture (ADR)

Registre des décisions majeures (ch. 10 §9). Pour chaque décision structurante : **problème**, **options étudiées**, **choix retenu**, **raisons**. Les futurs contributeurs comprennent ainsi le contexte, pas seulement le résultat.

Les décisions antérieures à ce registre restent tracées dans le **journal de `docs/ARCHITECTURE.md`** et les **arbitrages de `docs/VISION.md`**. Les ADR ci-dessous formalisent les choix les plus transverses ; toute nouvelle décision structurante ajoute un fichier `NNNN-titre.md`.

## Modèle

```
# ADR-NNNN — Titre
- Statut : accepté / remplacé par ADR-XXXX / déprécié
- Date : AAAA-MM-JJ
## Problème
## Options étudiées
## Choix retenu
## Raisons
## Conséquences
```

## Index

| ADR                                             | Décision                                         | Statut  |
| ----------------------------------------------- | ------------------------------------------------ | ------- |
| [0001](0001-contenu-en-git.md)                  | Le contenu vit en Git, jamais en base            | accepté |
| [0002](0002-identifiants-geles.md)              | Identifiants de contenu stables et gelés         | accepté |
| [0003](0003-progression-derivee-sans-streak.md) | Progression dérivée, jamais stockée, sans streak | accepté |
| [0004](0004-examens-parametriques.md)           | Examens blancs générés par moteur paramétrique   | accepté |
