-- Private teacher catalog. Run once in the Supabase SQL editor.
begin;

create table if not exists public.teacher_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  code text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  questions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subjects_owner_idx on public.subjects(owner_id);
create index if not exists quizzes_owner_subject_idx on public.quizzes(owner_id, subject_id);

alter table public.teacher_access enable row level security;
alter table public.subjects enable row level security;
alter table public.quizzes enable row level security;

revoke all on public.teacher_access, public.subjects, public.quizzes from anon, authenticated;
grant select on public.teacher_access to authenticated;
grant select, insert, update on public.subjects, public.quizzes to authenticated;

drop policy if exists "teacher can verify own access" on public.teacher_access;
create policy "teacher can verify own access" on public.teacher_access
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "approved teacher reads own subjects" on public.subjects;
create policy "approved teacher reads own subjects" on public.subjects
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );
drop policy if exists "approved teacher creates own subjects" on public.subjects;
create policy "approved teacher creates own subjects" on public.subjects
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );
drop policy if exists "approved teacher updates own subjects" on public.subjects;
create policy "approved teacher updates own subjects" on public.subjects
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );

drop policy if exists "approved teacher reads own quizzes" on public.quizzes;
create policy "approved teacher reads own quizzes" on public.quizzes
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  );
drop policy if exists "approved teacher creates own quizzes" on public.quizzes;
create policy "approved teacher creates own quizzes" on public.quizzes
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    ) and exists (
      select 1 from public.subjects s where s.id = quizzes.subject_id and s.owner_id = (select auth.uid())
    )
  );
drop policy if exists "approved teacher updates own quizzes" on public.quizzes;
create policy "approved teacher updates own quizzes" on public.quizzes
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.teacher_access ta where ta.user_id = (select auth.uid())
    ) and exists (
      select 1 from public.subjects s where s.id = quizzes.subject_id and s.owner_id = (select auth.uid())
    )
  );

commit;
