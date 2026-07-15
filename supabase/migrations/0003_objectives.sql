-- =============================================================================
-- PrépaPilote — Migration 0003 : objectifs personnels.
--
-- Objectifs volontairement simples (chapitre 7, delta validé), strictement
-- personnels — aucune comparaison, aucun classement. Cinq types fermés ;
-- l'AVANCEMENT n'est jamais stocké ici : il est dérivé à la demande des
-- tentatives, sessions et lectures (comme toute la progression). Cette table
-- ne mémorise que l'intention et, le cas échéant, la date de complétion.
-- RLS : chacun ne voit que ses objectifs.
-- =============================================================================

create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in ('terminer-domaine', 'reviser-concours', 'examen-blanc', 'consulter-fiches', 'effectuer-quiz')
  ),
  label text not null,
  -- Cible : nombre pour les objectifs de comptage, 100 (%) pour la couverture.
  target integer not null check (target >= 1),
  -- Portée facultative (ID de module ou de concours, contenu par ID stable).
  module_slug text,
  concours text,
  created_at timestamptz not null default now(),
  -- Renseignée quand l'utilisateur marque l'objectif atteint (l'avancement reste dérivé).
  completed_at timestamptz
);

create index objectives_user_idx on public.objectives (user_id, created_at desc);

alter table public.objectives enable row level security;

create policy "objectives_select_own" on public.objectives
  for select using ((select auth.uid()) = user_id);
create policy "objectives_insert_own" on public.objectives
  for insert with check ((select auth.uid()) = user_id);
create policy "objectives_update_own" on public.objectives
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "objectives_delete_own" on public.objectives
  for delete using ((select auth.uid()) = user_id);
