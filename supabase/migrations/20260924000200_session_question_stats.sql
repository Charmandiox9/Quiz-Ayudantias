-- Add anonymous aggregate response metrics to the completed session history.
begin;

alter table public.quiz_sessions
  add column if not exists question_stats jsonb not null default '[]'::jsonb
    check (jsonb_typeof(question_stats) = 'array');

commit;
