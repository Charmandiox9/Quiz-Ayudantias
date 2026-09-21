-- Public, read-only practice catalog.
begin;

alter table public.quizzes
  add column if not exists practice_enabled boolean not null default false;

-- Preserve the practice access that previously existed for already-published quizzes.
update public.quizzes
set practice_enabled = true
where status = 'published';

grant select on public.subjects, public.quizzes to anon;

drop policy if exists "public reads subjects with practice quizzes" on public.subjects;
create policy "public reads subjects with practice quizzes" on public.subjects
  for select to anon using (
    exists (
      select 1
      from public.quizzes q
      where q.subject_id = subjects.id
        and q.status = 'published'
        and q.practice_enabled = true
    )
  );

drop policy if exists "public reads practice quizzes" on public.quizzes;
create policy "public reads practice quizzes" on public.quizzes
  for select to anon using (status = 'published' and practice_enabled = true);

commit;
