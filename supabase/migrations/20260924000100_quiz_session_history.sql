-- Private history of completed live quiz sessions.
begin;

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  quiz_title text not null,
  subject_label text not null default '',
  room_code text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  results jsonb not null default '[]'::jsonb
    check (jsonb_typeof(results) = 'array')
);

create index if not exists quiz_sessions_owner_finished_idx
  on public.quiz_sessions(owner_id, finished_at desc);

alter table public.quiz_sessions enable row level security;
revoke all on public.quiz_sessions from anon, authenticated;
grant select, insert, delete on public.quiz_sessions to authenticated;

drop policy if exists "approved teacher reads own session history" on public.quiz_sessions;
create policy "approved teacher reads own session history" on public.quiz_sessions
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

drop policy if exists "approved teacher records own completed sessions" on public.quiz_sessions;
create policy "approved teacher records own completed sessions" on public.quiz_sessions
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    ) and finished_at <= now() + interval '5 minutes'
  );

drop policy if exists "approved teacher deletes own session history" on public.quiz_sessions;
create policy "approved teacher deletes own session history" on public.quiz_sessions
  for delete to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

commit;
