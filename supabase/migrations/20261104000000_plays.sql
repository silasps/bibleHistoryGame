-- Minijogos das etapas: o resultado de cada pessoa em cada jogo da sala.
-- O progresso só aumenta (o servidor valida com o mesmo reducer da demo).
create table public.plays (
  room_code      text not null references public.rooms (code) on delete cascade,
  game_id        text not null check (char_length(game_id) <= 40),
  participant_id uuid not null references public.participants (id) on delete cascade,
  value          integer not null default 0 check (value >= 0 and value <= 1000),
  done           boolean not null default false,
  updated_at     timestamptz not null default now(),
  primary key (room_code, game_id, participant_id)
);

alter table public.plays enable row level security;
revoke all on public.plays from anon, authenticated;
