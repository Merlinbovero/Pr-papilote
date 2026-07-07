# Règles éditoriales

## Standards de qualité (toute fiche publiée)

- **Claire** : une idée par paragraphe, paragraphes courts, listes et tableaux dès que la donnée s'y prête.
- **Synthétique d'abord** : « L'essentiel » (≤ 250 mots) est autosuffisant — l'utilisateur pressé repart avec le principal en deux minutes.
- **Détaillée ensuite** : « Approfondir » suit le modèle du type ; « Maîtriser » accueille l'expertise sans alourdir le reste.
- **Sourcée** : au moins une source, la principale officielle chaque fois que possible ; les chiffres portent leur source et leur date.
- **Illustrée** : selon l'exigence du modèle (schéma design system de préférence, droits vérifiés sinon).
- **Parcourable** : titres de sections fidèles au modèle, sommaire, encarts générés — jamais de mur de texte.

## Règles de rédaction

### Ton et posture

- **Neutre et factuel** : ni lyrisme, ni marketing, ni jugement. Le prestige des sujets se suffit.
- **Faits ≠ analyses** : toute interprétation vit dans un encadré « Analyse » visuellement distinct (obligatoire en géopolitique, recommandé ailleurs).
- Pas de « nous », pas d'adresse au lecteur dans le corps documentaire ; l'impératif est réservé aux consignes d'exercices.
- Présent de l'indicatif par défaut ; passé pour l'historique.
- Interdits : superlatifs gratuits (« le meilleur chasseur du monde »), spéculation opérationnelle, information non publique, sensationnalisme (RETEX en particulier).

### Précision technique

- Sigles développés à la première occurrence + entrée au dictionnaire ; ensuite le sigle seul.
- Le **terme du dictionnaire fait foi** : une seule graphie canonique dans tout le site (« Rafale M », pas « Rafale Marine » un coup sur deux).
- Unités : SI + unités aéronautiques d'usage explicitées (kt, ft, hPa, NM) ; chiffres en Geist Mono dans les tableaux ; ordres de grandeur plutôt que fausse précision quand la source est approximative.
- Dates au long en prose (« 12 juin 2024 »), ISO dans les métadonnées.

### Économie

- Pas de répétition entre strates : chaque niveau ajoute, ne reformule pas.
- Pas de formule creuse (« il est important de noter que », « comme chacun sait ») : supprimer, le fait reste.
- Une information déjà portée par l'infobox n'est pas paraphrasée dans le texte — le texte explique, l'infobox chiffre.

## Relecture avant fusion (checklist)

1. Le modèle du type est respecté (sections, infobox, illustration exigée).
2. Les métadonnées passent la validation (le build l'impose de toute façon).
3. « L'essentiel » tient seul et tient en 250 mots.
4. Chaque chiffre et affirmation vérifiable a une source ; `verifiedAt` est posé.
5. Les relations sont déclarées (prérequis, approfondit, variante-de…) — pas de fiche orpheline.
6. Le vocabulaire suit le dictionnaire ; les sigles nouveaux ont leur terme candidat.
7. Au moins une question candidate accompagne toute fiche-notion nouvelle.
