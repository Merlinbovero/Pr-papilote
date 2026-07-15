# Audit de préproduction — V1 testable

Réalisé le 2026-07-15 (phase 5 du plan V1). Verdict global : **prêt pour
une mise en ligne de test**, sous réserve des trois actions humaines
listées en fin de document (Vercel, Supabase, domaine).

## Contrôles automatisés — résultats

| Contrôle                     | Méthode                                                        | Résultat                                                                                      |
| ---------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Navigation et pages          | crawl des 312 URL du sitemap                                   | **312/312 en 200**                                                                            |
| Liens internes               | extraction des 320 hrefs uniques de toutes les pages, re-crawl | **0 lien cassé**                                                                              |
| Tests unitaires              | vitest                                                         | **162/162**                                                                                   |
| Tests e2e (desktop + mobile) | Playwright                                                     | **76 verts, 2 skip assumés**                                                                  |
| Accessibilité                | 9 scans axe WCAG A/AA (dont BIA, examen, entraînement, carte)  | **0 violation** — un `nested-interactive` réel trouvé sur la carte et corrigé pendant l'audit |
| Build                        | Next 16, 327 pages statiques                                   | vert                                                                                          |
| Contenu                      | schémas Zod + graphe + relations validés au build              | vert (150 fiches, 799 questions, 62 termes)                                                   |

## Sécurité et configuration

- **Secrets** : aucun secret en dur ; seules des variables `NEXT_PUBLIC_*`
  côté client ; `.env*` ignoré par git ; `.env.example` documente les deux
  variables Supabase requises. Le build et les tests passent **sans**
  configuration (état « non configuré » propre — règle 9 vérifiée par la CI).
- **Données de développement** : les prévisualisations `/design-system`
  renvoient 404 en production (garde d'environnement) et sont exclues de
  `robots.txt`, comme l'espace personnel et l'authentification.
- **Cartes** : données publiques, localisation communale uniquement, aucun
  fond de carte ni requête externe.
- **SEO** : sitemap complété pendant l'audit (BIA, matières, examen,
  entraînement, cartes) ; metadata présentes sur toutes les routes V1 ;
  pages d'erreur et error boundaries en place (ch. 9).

## Performances

Pages les plus lourdes (HTML pré-rendu, non compressé) : examen blanc
449 Ko (dont ~150 Ko de viviers sérialisés), dictionnaire 354 Ko, socle
courant ~290 Ko. Servies compressées (brotli Vercel), ces pages passent
sous ~60 Ko transférés — acceptable pour la V1. **Optimisation notée pour
après** : charger les viviers d'examen à la demande.

## Limites connues et assumées de la V1 (à tester en connaissance)

1. Le carnet d'erreurs et les historiques (examen BIA, psychotechnique)
   sont **locaux à l'appareil** — le branchement Supabase
   (`question_attempts`) viendra après les premiers retours ;
2. l'examen blanc est un pur QCM (fidèle à l'épreuve réelle) — les
   questions association/ordre/calcul vivent dans les quiz généraux ;
3. psychotechnique : lecture d'instruments graphique et multi-tâches
   reportés (générateurs SVG à venir) ;
4. cartes : pas d'implantations outre-mer ni historiques dans ce premier
   jeu de données (le contrat les prévoit — champ `statut`).

## Mise en ligne — actions restantes (humaines)

1. **Vercel** — importer le dépôt GitHub (framework Next.js autodétecté,
   aucune configuration spéciale requise ; `npm run build` est la commande
   par défaut). Recommandé : brancher la production sur `main` et fusionner
   la branche de travail ;
2. **Variables d'environnement Vercel** — `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (projet Supabase région UE ; appliquer
   les migrations `supabase/migrations/000*.sql` via le dashboard ou la
   CLI). Sans elles, le site fonctionne en mode non connecté — acceptable
   pour les tout premiers tests ;
3. **`NEXT_PUBLIC_SITE_URL`** — l'URL de production (sitemap et
   métadonnées absolues).

Le protocole de test personnel et le journal des retours sont prêts dans
`docs/retours-v1.md`.
