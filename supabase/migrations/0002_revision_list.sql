-- =============================================================================
-- PrépaPilote — Migration 0002 : liste de révision (favoris).
--
-- Alimentée par l'action discrète « Ajouter à ma liste de révision » du
-- gabarit de fiche (chapitre 7). Référence le contenu par ID stable,
-- sans clé étrangère vers le contenu. RLS : chacun ne voit que sa liste.
-- =============================================================================

create table public.revision_list (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- ID de contenu stable et gelé (fiche, terme…), jamais de FK vers le contenu.
  content_id text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index revision_list_user_added_idx on public.revision_list (user_id, added_at desc);

alter table public.revision_list enable row level security;

create policy "revision_list_select_own" on public.revision_list
  for select using ((select auth.uid()) = user_id);
create policy "revision_list_insert_own" on public.revision_list
  for insert with check ((select auth.uid()) = user_id);
create policy "revision_list_delete_own" on public.revision_list
  for delete using ((select auth.uid()) = user_id);
