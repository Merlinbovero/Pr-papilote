# Mise en ligne Supabase — runbook

Procédure pour activer l'espace authentifié (progression, favoris, objectifs,
révision espacée) en production. Tant que ces étapes ne sont pas faites, le site
fonctionne normalement en **mode « non configuré »** : toute la consultation
documentaire est intacte, seuls les écrans authentifiés affichent un état neutre.

**Frontière des données (rappel)** : Supabase ne stocke **que les données
utilisateur**. Le contenu (fiches, exercices…) reste dans le dépôt. Activer
Supabase n'affecte donc ni le contenu ni le déploiement habituel.

## Ce dont l'application a besoin

- Deux variables d'environnement :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Les **3 migrations SQL** appliquées, dans l'ordre :
  1. `supabase/migrations/0001_user_data.sql` (profils, sessions, quiz, révision, progression…)
  2. `supabase/migrations/0002_favorites.sql` (favoris)
  3. `supabase/migrations/0003_objectives.sql` (objectifs personnels)
- Authentification : **e-mail + mot de passe** (déjà codée côté application).

Toutes les tables sont protégées par **RLS** (Row Level Security) : chaque
utilisateur ne peut lire et écrire **que ses propres données**.

## Étapes (à faire une fois)

### 1. Créer le projet Supabase (région UE)

1. Sur [supabase.com](https://supabase.com), créer un projet.
2. **Région : Union européenne** (ex. `Frankfurt (eu-central-1)` ou `Paris`) —
   exigence du projet (données UE).
3. Noter le **mot de passe** de la base (conservé par Supabase, utile plus tard).

### 2. Récupérer les deux clés

Dans le projet Supabase → **Settings → API** :

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Project API keys → `anon` / `public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> La clé `anon` est **publique** (destinée au navigateur) : elle ne donne accès
> qu'à ce que les politiques RLS autorisent. Ne **jamais** utiliser la clé
> `service_role` dans l'application.

### 3. Appliquer les migrations

Dans le projet Supabase → **SQL Editor** → « New query » :

- Coller le contenu de `0001_user_data.sql`, exécuter (**Run**).
- Recommencer avec `0002_favorites.sql`, puis `0003_objectives.sql`, **dans cet
  ordre**.

Vérifier ensuite dans **Table Editor** que les tables sont créées
(`profiles`, `study_sessions`, `favorites`, `objectives`, …) et que « RLS
enabled » est bien affiché sur chacune.

### 4. Configurer l'authentification

Dans **Authentication → Providers → Email** : le fournisseur e-mail est activé
par défaut.

- **Site URL** (Authentication → URL Configuration) : l'URL de production Vercel
  (ex. `https://prepapilote.vercel.app` ou le domaine personnalisé).
- **Redirect URLs** : ajouter la même URL (pour les liens de réinitialisation de
  mot de passe).
- **Confirmation d'e-mail** : pour un usage personnel, on peut **désactiver**
  « Confirm email » (compte utilisable immédiatement). Pour ouvrir à d'autres
  utilisateurs plus tard, la laisser active et configurer un **SMTP** (le service
  d'e-mail intégré de Supabase est limité en volume).

### 5. Renseigner les variables sur Vercel

Dans le projet Vercel → **Settings → Environment Variables**, ajouter pour
**Production** (et Preview si souhaité) :

| Nom                             | Valeur                   |
| ------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | l'URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé `anon`            |

Puis **redéployer** (les variables `NEXT_PUBLIC_*` sont injectées au build).

### 6. Vérifier de bout en bout

1. Ouvrir le site déployé → `/inscription` : créer un compte.
2. Se connecter via `/connexion`.
3. Faire une session de quiz / psychotechnique, mettre une fiche en favori,
   définir un objectif.
4. Se déconnecter, se reconnecter : la progression, les favoris et les objectifs
   doivent **persister**.
5. Vérifier sur un **autre appareil / navigateur** que la même progression est
   retrouvée après connexion.

## Développement local (optionnel)

Pour tester en local : copier `.env.example` en `.env.local` et y renseigner les
deux clés. `.env.local` n'est **jamais** commité. Sans ces valeurs, `npm run dev`
fonctionne aussi (mode non configuré).

## Rappels

- Le **build et les tests ne dépendent jamais** des secrets : la CI reste verte
  sans configuration Supabase.
- Une évolution **du schéma** (nouvelle table/colonne) se fait par une **nouvelle
  migration** `supabase/migrations/000X_*.sql`, appliquée de façon **additive**
  pour ne pas casser les données existantes.
