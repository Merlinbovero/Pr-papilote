# État actuel — référence courante

**Ce document a vocation à bouger.** Il existe pour que les documents datés —
[`cloture-planche.md`](cloture-planche.md), les constats du lot M3 dans
[`roadmap.md`](roadmap.md) — puissent rester figés. Un procès-verbal qu'on
rectifie a posteriori ne prouve plus rien de ce qu'il attestait ; c'est ici, et
seulement ici, que l'on lit l'état du jour.

Chaque nombre est donné **avec sa définition**. Deux chiffres différents sur le
même sujet ne sont pas nécessairement une erreur : le plus souvent, ils ne
comptent pas la même chose.

Dernière vérification : **2026-07-31**, sur `b19cac7` (commit servi en
production) et sur la branche de recette qui le prolonge.

---

## Le Banc — avancement

| Route                 | Registre | Lot |
| --------------------- | -------- | --- |
| `/entrainement/eopan` | **Banc** | F2a |
| `/reviser`            | **Banc** | F2b |

Vérifié en production : ces deux routes seules portent le marquage `.banc`, et
aucune route témoin ne l'a reçu par accident.

## Le décompte des appelants — trois définitions, trois nombres

La confusion vient de ce que trois documents comptent trois choses.

### 1. Composants qui importent et rendent `QuizPlayer` — **six**

| Composant                                | État                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `features/revision/revision-session.tsx` | **migré** (F2b)                                                                      |
| `features/quiz/pool-quiz.tsx`            | **mixte** — `banc` sur `/entrainement/eopan`, `legacy` sur `eopn`, `alat`, `anglais` |
| `features/quiz/notion-quiz.tsx`          | legacy                                                                               |
| `features/cours/course-experience.tsx`   | legacy                                                                               |
| `features/bia/matiere-quiz.tsx`          | legacy                                                                               |
| `app/(site)/design-system/quiz/page.tsx` | legacy — vitrine interne, hors surface publique                                      |

### 2. « Cinq autres appelants » de `design-system.md` — **cohérent**

Ce sont les **composants non migrés**, `revision-session` exclu. Le chiffre est
juste dans sa définition ; `pool-quiz` y compte pour un, bien qu'il serve les
deux registres.

### 3. Registre `AUTRES_APPELANTS` — **six routes témoins**, pas six composants

`e2e/banc-route-pilote.spec.ts` liste des **routes** servant de témoins de
non-régression, à raison d'une par surface à surveiller. Comparer ce nombre à
celui des composants n'a donc pas de sens.

> **Lacune connue, non comblée.** Le registre ne contient **aucune route
> `/cours/`**, alors que `/cours/[slug]` rend `CourseExperience`, donc un
> `QuizPlayer` en rendu historique. **Quatorze cours** sont ainsi dépourvus de
> témoin de non-régression. Relevé le 2026-07-31 ; combler cette lacune relève
> d'un lot de test, pas d'une correction documentaire.

## Campagnes de tests

| Mesure                                  | Valeur                                                      |
| --------------------------------------- | ----------------------------------------------------------- |
| Tests découverts                        | **744** en 39 fichiers, deux projets (`chromium`, `mobile`) |
| Dernière campagne complète, sans filtre | **730 réussis, 14 ignorés, 0 échec, 0 flaky**               |
| Tests unitaires (`npm run check`)       | **821** en 54 fichiers                                      |

La suite s'exécute sur une **compilation de production**, jamais sur le serveur
de développement — voir le commentaire de `playwright.config.ts` pour les quatre
dépendances au mode de compilation que ce choix réveille.

**Une campagne se rapporte toujours avec sa liste de flaky**, jamais comme
simplement verte : un test repris compte séparément des réussites, et le taire
reviendrait à masquer une instabilité.

## Routes fonctionnelles historiques

`cloture-planche.md` en annonce **48** à la clôture de M10. Ce nombre n'a **pas
été revérifié** depuis, et il ne doit pas être recopié comme s'il l'avait été.
Il sera repris ici quand un comptage aura été refait, avec sa définition.

## État de la production

|                  |                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| URL              | <https://pr-papilote.vercel.app>                                                                                      |
| Commit servi     | `b19cac7`                                                                                                             |
| Recette complète | voir le rapport du 2026-07-31 — 29 routes en 200, index de recherche servi (477 entrées), aucune fuite de `localhost` |

Défauts ouverts relevés à cette recette et **non corrigés à ce jour** : en-têtes
de sécurité absents (CSP, `Referrer-Policy`, `Permissions-Policy`,
`X-Content-Type-Options`, `X-Frame-Options`), version de cache du service worker
figée à `v1` sur des fichiers non empreintés, trois routes `/entrainement/*`
indexables mais absentes du sitemap, et l'index de recherche sérialisé deux fois
sur `/recherche`.
