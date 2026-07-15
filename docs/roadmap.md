# Feuille de route

Trois niveaux (ch. 10 §12). La séparation évite de retarder la V1 par du non-essentiel. Ce document est réévalué régulièrement ; les idées non planifiées vivent dans `docs/idees-futures.md`.

## V1 — indispensable (fondations établies + première production)

Fondations **livrées** (Volume II, ch. 1–10) :

- Design system et framework UI ; graphe documentaire ; moteur de recherche ; architecture des données ; moteur de quiz/examen paramétrique ; progression (compétences, objectifs, favoris, reprise) ; chaîne éditoriale et contrôle qualité ; SEO, accessibilité automatisée, robustesse.

Reste à faire pour la V1 :

- **Intégration Supabase réelle** : câblage lecture/écriture de la progression, des favoris et des objectifs ; authentification effective (état « non configuré » propre jusque-là).
- **Production de contenu** : cinq fiches pilotes **validées définitivement comme références officielles** (statut `publie`, 2026-07-09) ; production progressive par famille, chaque famille validée avant la suivante.
- **Banque de questions** initiale reliée aux fiches publiées (couverture surveillée par `content:check`).

### Ordre de production validé (2026-07-09)

Production **progressive**, jamais de masse. Chaque famille est validée avant de passer à la suivante ; la qualité prime.

1. **Fondamentaux aéronautiques**
2. **EOPAN**
3. **EOPN**
4. **ALAT**
5. **Dictionnaire** — en dernier : il enrichit naturellement les fiches déjà produites et réutilise leurs définitions (les deux termes pilotes `catobar` et `appontage` restent en `relecture` jusqu'à cette phase).

## V2 — améliorations importantes

- Lighthouse CI branché après le premier déploiement (budgets de `docs/qualite-technique.md`).
- Monitoring runtime (erreurs, lenteurs) et analytics anonymes respectueux, à l'intégration.
- Génération assistée de questions depuis les données structurées (marqueur `generator`, validation humaine).
- Enrichissement du graphe (nouveaux prédicats factuels) et des familles d'objets au fil du contenu.
- Génération statique incrémentale surveillée dès ~500 pages.

## V3 — innovations long terme

- Multilingue (chemin réservé sans champ mort : langue « fr » implicite, `schemaVersion`).
- Variantes de fiche par concours.
- Mode hors-ligne (explicitement hors V1).
- Recommandations pédagogiques affinées par IA (sans changer le modèle de progression dérivée).

> Toute promotion V2 → V1 ou V3 → V2 passe par le critère des trois questions (`docs/gouvernance.md` §3) et, si structurante, une ADR.
