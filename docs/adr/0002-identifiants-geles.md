# ADR-0002 — Identifiants de contenu stables et gelés

- Statut : accepté
- Date : 2026-07-07

## Problème

Comment relier durablement les données utilisateur (progression, favoris) et le graphe documentaire au contenu, alors que titres, slugs et catégories évolueront ?

## Options étudiées

1. **Référencer par slug/URL** : simple, mais toute réorganisation casse les liens et les données.
2. **Identifiant stable gelé à vie** (ex. `eopan.appareils.rafale-m`), distinct du slug d'URL.

## Choix retenu

Option 2. Chaque objet porte un `id` **gelé à vie** ; le slug d'URL peut changer, l'ID jamais. Les données utilisateur et les arêtes du graphe ne référencent que l'ID.

## Raisons

- Une recatégorisation (ex. Charles de Gaulle → Navires) préserve le graphe et les données ; les URL cassées sont couvertes par des redirections permanentes (`redirects.json`).
- Garantie de pérennité sur plusieurs années sans perte de données utilisateur.

## Conséquences

- Renommer un fichier ou déplacer une catégorie n'impacte jamais l'ID.
- Toute rupture d'URL exige une entrée de redirection permanente (démontré sur les pilotes).
