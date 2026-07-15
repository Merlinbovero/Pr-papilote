# Le moteur pédagogique — quiz, examens, carnet d'erreurs

**Doctrine officielle (Volume II, chapitre 6 — validé).** Le système de quiz n'est pas un jeu : c'est un outil d'apprentissage qui accompagne un candidat pendant des mois. Chaque décision sert cet objectif. **Mieux vaut 5 000 excellentes questions que 50 000 questions médiocres** — chaque question doit répondre à « qu'apprend-on en la ratant ? ».

## La question

Objet autonome de la banque centrale (`content/questions/`), jamais liée à une page : id gelé (`q.theme.numero`), **thème** explicite, format (`kind`), énoncé, corps propre au format, **explication obligatoire et substantielle**, **notes de distracteurs** (pourquoi chaque mauvaise réponse est fausse, quand cela apporte une valeur pédagogique), `evaluates` ≥ 1 fiche (génère « pour approfondir »), concours, difficulté 1–5, tags, sources si pertinent, workflow éditorial complet. Les questions générées depuis les données structurées portent le marqueur `generator` et passent la même validation humaine.

## Les formats (union discriminée — extensibles sans toucher aux anciennes questions)

`qcm` (choix unique **ou** multiple selon le nombre de bonnes réponses) · `vrai-faux` · `association` · `legende-schema` (image annotée) · `calcul` · **`ordre`** (chronologie/séquence) · **`texte-a-trous`** · `localisation-carte` (réservé, arrivera avec les cartes interactives). Ajouter un format = une branche au contrat, zéro modification de l'existant.

## Les niveaux

Stockés 1–5, affichés par les libellés officiels : **1 Découverte · 2 Fondamental · 3 Concours · 4 Avancé · 5 Expert**. Le niveau guide l'utilisateur, il ne le juge jamais.

## Les modes — un seul mécanisme, des sélecteurs

Entraînement libre (correction immédiate) · Révision d'un thème (tirage pondéré : jamais-vues > anciennes > récentes) · Quiz chronométré · Examen blanc · Révision des erreurs (questions dues du carnet) · Révision des favoris (questions évaluant les fiches de « ma liste de révision »). Tous réutilisent la même banque ; le mélange est **déterministe par graine** (rejouable, testable).

**Accès sans compte** : l'entraînement libre et la révision de thème sont jouables sans connexion, avec correction complète — **rien n'est enregistré** (mention discrète invitant à se connecter pour conserver ses résultats). Carnet d'erreurs, favoris et statistiques restent l'exclusivité des comptes.

## Le moteur d'examens — jamais des quiz différents

**Règle validée : les examens blancs sont générés depuis la banque, jamais écrits à part.** Un examen est une **définition paramétrique** :

```
EXAMEN = épreuves[] — chacune définie par :
  thèmes · compétences évaluées (tags) · concours · niveaux (min–max) ·
  familles d'objets · nombre de questions · durée · barème
  (points/bonne réponse, pénalité éventuelle) · consignes
```

Une seule banque ⇒ un nombre illimité d'examens. Quand un examen reproduit la **structure réelle d'un concours** (temps, répartition des thèmes, difficulté), cette structure est un contenu **sourcé et daté** comme tout le reste. Une liste explicite de questions reste possible pour reproduire un format à l'identique — l'exception, jamais la règle.

## Le carnet d'erreurs

Réponses individuelles en append-only (`question_attempts`) → toute erreur crée/réarme un `review_item` : échéances **1 j → 3 j → 7 j → 14 j → 30 j → 90 j**, réinitialisées par une nouvelle erreur. **Sortie du carnet : 3 réponses correctes consécutives et espacées** (trois succès dans la même minute ne comptent pas — c'est la mémoire à long terme qu'on mesure). Chaque correction relie l'erreur à ses fiches : erreur → lecture → re-test.

## Statistiques (mode Progression exclusivement)

Toutes **dérivées** de `question_attempts`, jamais de compteurs stockés : questions réalisées, taux de réussite (global/thème/niveau/concours), temps moyen, thèmes maîtrisés / à revoir (seuils pondérés par la fraîcheur), historique de progression, état du carnet. **Les résultats d'examens blancs alimentent exclusivement le mode Progression** — aucune statistique en mode Documentation.

## Performances et évolutions

Banque indexée au build (thème, niveau, concours, famille) : sélectionner 40 questions parmi 50 000 = intersection d'index. Moteur = fonctions pures testées (sélection, mélange par graine, scoring, barèmes). Évolutions sans refonte : répétition espacée (déjà dans le schéma), recommandations par règles explicables (thèmes faibles → fiches/quiz via le graphe), adaptativité (taux de réussite récent → difficulté proposée), parcours personnalisés (compositions de sélecteurs), nouveaux formats (branches du contrat).
