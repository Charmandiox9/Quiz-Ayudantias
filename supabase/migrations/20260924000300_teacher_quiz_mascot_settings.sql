-- Teacher-controlled quiz mascot preferences.
begin;

alter table public.subjects
  add column if not exists mascot_enabled boolean;

create table if not exists public.teacher_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  quiz_mascot_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.teacher_settings enable row level security;

revoke all on public.teacher_settings from anon, authenticated;
grant select, insert, update on public.teacher_settings to authenticated;
grant select (owner_id, quiz_mascot_enabled) on public.teacher_settings to anon;

drop policy if exists "approved teacher reads own settings" on public.teacher_settings;
create policy "approved teacher reads own settings" on public.teacher_settings
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

drop policy if exists "approved teacher creates own settings" on public.teacher_settings;
create policy "approved teacher creates own settings" on public.teacher_settings
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

drop policy if exists "approved teacher updates own settings" on public.teacher_settings;
create policy "approved teacher updates own settings" on public.teacher_settings
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

drop policy if exists "public reads mascot settings for practice subjects" on public.teacher_settings;
create policy "public reads mascot settings for practice subjects" on public.teacher_settings
  for select to anon using (
    exists (
      select 1 from public.subjects s
      where s.owner_id = teacher_settings.owner_id
    )
  );

commit;
