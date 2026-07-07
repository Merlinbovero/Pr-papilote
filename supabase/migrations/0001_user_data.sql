-- =============================================================================
-- PrépaPilote — Migration fondatrice : données utilisateur.
--
-- Principes (docs/ARCHITECTURE.md) :
--   * Le CONTENU (fiches, questions, quiz…) vit dans le dépôt Git, jamais ici.
--     Les colonnes *_id en texte référencent des identifiants de contenu
--     stables et gelés (ex. 'eopn.appareils.rafale-b') — pas de clé
--     étrangère possible, l'intégrité est garantie côté contenu (CI).
--   * RLS sur TOUTES les tables, politique par défaut « refuser » :
--     un utilisateur ne lit et n'écrit que ses propres lignes.
--   * question_attempts est la table maîtresse append-only ; carnet
--     d'erreurs et progressions sont des vues calculées dessus.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Profils (extension de auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- Concours préparés (slugs de modules : eopan, eopn, alat)
  prepared_concours text[] not null default '{}',
  preferences jsonb not null default '{}',
  -- Droits/offre futurs (arbitrage 3) : extensible sans migration lourde
  entitlements jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Sessions de travail (alimente « heures de travail »)
-- -----------------------------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_slug text not null,
  activity text not null check (activity in ('lecture', 'quiz', 'psychotechnique')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);

create index study_sessions_user_started_idx
  on public.study_sessions (user_id, started_at desc);

-- -----------------------------------------------------------------------------
-- Tentatives de quiz
-- -----------------------------------------------------------------------------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id text not null,
  module_slug text not null,
  score numeric not null,
  max_score numeric not null,
  duration_seconds integer,
  completed_at timestamptz not null default now()
);

create index quiz_attempts_user_completed_idx
  on public.quiz_attempts (user_id, completed_at desc);

-- -----------------------------------------------------------------------------
-- Réponses individuelles — LA source de vérité (append-only)
-- -----------------------------------------------------------------------------
create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  quiz_attempt_id uuid references public.quiz_attempts (id) on delete set null,
  is_correct boolean not null,
  duration_ms integer,
  answered_at timestamptz not null default now()
);

create index question_attempts_user_answered_idx
  on public.question_attempts (user_id, answered_at desc);
create index question_attempts_user_question_idx
  on public.question_attempts (user_id, question_id);

-- -----------------------------------------------------------------------------
-- Répétition espacée (état par question échouée)
-- -----------------------------------------------------------------------------
create table public.review_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  due_at timestamptz not null,
  consecutive_successes integer not null default 0,
  last_result boolean,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index review_items_user_due_idx on public.review_items (user_id, due_at);

-- -----------------------------------------------------------------------------
-- Avancement de lecture (action volontaire, jamais de tracking implicite)
-- -----------------------------------------------------------------------------
create table public.fiche_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  fiche_id text not null,
  status text not null check (status in ('commencee', 'terminee')),
  updated_at timestamptz not null default now(),
  primary key (user_id, fiche_id)
);

-- -----------------------------------------------------------------------------
-- Résultats des exercices psychotechniques
-- -----------------------------------------------------------------------------
create table public.psychotech_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  params jsonb not null default '{}',
  score numeric not null,
  max_score numeric,
  duration_seconds integer,
  completed_at timestamptz not null default now()
);

create index psychotech_results_user_exercise_idx
  on public.psychotech_results (user_id, exercise_id, completed_at desc);

-- -----------------------------------------------------------------------------
-- Agrégats anonymes par question (écrits par le rôle de service uniquement)
-- -----------------------------------------------------------------------------
create table public.question_stats (
  question_id text primary key,
  attempts_count bigint not null default 0,
  correct_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Horodatage automatique de mise à jour
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger review_items_updated_at
  before update on public.review_items
  for each row execute function public.set_updated_at();
create trigger fiche_progress_updated_at
  before update on public.fiche_progress
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security : activée partout, refus par défaut.
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.question_attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.fiche_progress enable row level security;
alter table public.psychotech_results enable row level security;
alter table public.question_stats enable row level security;

-- Profils : lecture/mise à jour de son propre profil (création par trigger)
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Tables de travail : CRUD limité à ses propres lignes
create policy "study_sessions_select_own" on public.study_sessions
  for select using ((select auth.uid()) = user_id);
create policy "study_sessions_insert_own" on public.study_sessions
  for insert with check ((select auth.uid()) = user_id);
create policy "study_sessions_update_own" on public.study_sessions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select using ((select auth.uid()) = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check ((select auth.uid()) = user_id);

-- Append-only : pas de politique update/delete sur les réponses
create policy "question_attempts_select_own" on public.question_attempts
  for select using ((select auth.uid()) = user_id);
create policy "question_attempts_insert_own" on public.question_attempts
  for insert with check ((select auth.uid()) = user_id);

create policy "review_items_select_own" on public.review_items
  for select using ((select auth.uid()) = user_id);
create policy "review_items_insert_own" on public.review_items
  for insert with check ((select auth.uid()) = user_id);
create policy "review_items_update_own" on public.review_items
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "review_items_delete_own" on public.review_items
  for delete using ((select auth.uid()) = user_id);

create policy "fiche_progress_select_own" on public.fiche_progress
  for select using ((select auth.uid()) = user_id);
create policy "fiche_progress_insert_own" on public.fiche_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "fiche_progress_update_own" on public.fiche_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fiche_progress_delete_own" on public.fiche_progress
  for delete using ((select auth.uid()) = user_id);

create policy "psychotech_results_select_own" on public.psychotech_results
  for select using ((select auth.uid()) = user_id);
create policy "psychotech_results_insert_own" on public.psychotech_results
  for insert with check ((select auth.uid()) = user_id);

-- Agrégats anonymes : lecture pour tous les connectés, écriture réservée
-- au rôle de service (aucune politique insert/update → refus par défaut)
create policy "question_stats_select_authenticated" on public.question_stats
  for select to authenticated using (true);
