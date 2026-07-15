# Checklist de mise en service

À dérouler intégralement avant l'ouverture publique. Rien ne se lance tant qu'une case bloquante reste ouverte.

## Données et sauvegardes (bloquant)

- [ ] Projet Supabase créé en **région UE** ; clés fournies via variables d'environnement Vercel (jamais dans le code).
- [ ] Migrations appliquées ; politiques RLS testées (un utilisateur A ne lit pas les données de B).
- [ ] **PITR (point-in-time recovery) Supabase activé.**
- [ ] **Versioning des buckets Storage activé** (documents, images).
- [ ] Test de restauration effectué une fois (base + un binaire).

## Contenus (bloquant)

- [ ] Les fiches destinées au lancement sont en statut `publie` (validation propriétaire).
- [ ] Aucune image sans **licence vérifiée** ; crédits affichés ; placeholders retirés.
- [ ] Documents publics : droits contrôlés (`lien-seul` par défaut).
- [ ] Rapport éditorial passé : zéro objet orphelin, zéro relation morte, fraîcheur à jour.

## Plateforme

- [ ] `NEXT_PUBLIC_SHOW_DRAFTS` **absent** de l'environnement de production.
- [ ] `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM` absent de la production.
- [ ] `sitemap.ts` et `robots.ts` en place ; domaine et URL canoniques configurés.
- [ ] Page mentions légales / confidentialité publiée.
- [ ] Audit Lighthouse ≥ 90 (performance, accessibilité, SEO) sur accueil, un hub, une fiche.

## Mesure (différé accepté)

- [ ] Analytics sans cookies choisi et branché (arbitrage 6) — ou explicitement reporté.
- [ ] Métriques de recherche anonymes activées — ou explicitement reportées.
