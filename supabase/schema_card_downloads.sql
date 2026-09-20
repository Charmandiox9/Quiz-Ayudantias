-- Tabla de registro de certificados de cartas coleccionables
-- Cumple con la Ley N° 21.719 (Proteccion de Datos Personales en Chile)
-- No almacena datos personales sensibles ni RUTs

create table if not exists public.card_downloads (
  id text primary key,
  quiz_title text not null,
  accuracy integer not null default 100,
  score integer not null default 0,
  player_nickname text default 'Estudiante',
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.card_downloads enable row level security;

-- Politica para permitir que los estudiantes registren su certificado descargado
create policy "Permitir insercion anonima de certificados"
  on public.card_downloads
  for insert
  with check (true);

-- Politica para permitir lectura publica del ranking / certificados emitidos
create policy "Permitir lectura publica de certificados"
  on public.card_downloads
  for select
  using (true);
