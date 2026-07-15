-- =============================================================================
-- PrépaPilote — Migration 0002 : favoris (notion unique).
--
-- Une seule notion de favori (chapitre 7, delta validé) : l'utilisateur met
-- de côté n'importe quel contenu — fiche, document, carte, quiz. « Réviser
-- mes favoris » n'est qu'une VUE de cette table, pas un mécanisme distinct.
-- Alimentée par l'action discrète « Ajouter à mes favoris » du gabarit.
-- Référence le contenu par ID stable et gelé, sans clé étrangère vers le
-- contenu. RLS : chacun ne voit que ses favoris.
-- =============================================================================

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Nature du contenu mis en favori (vocabulaire fermé côté application).
  content_type text not null check (content_type in ('fiche', 'document', 'carte', 'quiz')),
  -- ID de contenu stable et gelé, jamais de FK vers le contenu.
  content_id text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index favorites_user_added_idx on public.favorites (user_id, added_at desc);
create index favorites_user_type_idx on public.favorites (user_id, content_type);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using ((select auth.uid()) = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check ((select auth.uid()) = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using ((select auth.uid()) = user_id);
