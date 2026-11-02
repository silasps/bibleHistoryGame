-- Bíblia — Por trás da história · salas de apresentação ao vivo
--
-- Modelo de segurança: RLS ligado em todas as tabelas e NENHUMA policy para
-- anon/authenticated. Só o servidor Next (service_role) lê e escreve. O
-- público nunca acessa as tabelas diretamente; recebe apenas views
-- sanitizadas pelas rotas /api/rooms/[code]/*.
-- Conteúdo editorial (sínteses das conexões) NÃO fica no banco: está em
-- módulos server-only do app e só é anexado à resposta depois da liberação.

create extension if not exists pgcrypto;

create table public.rooms (
  code             text primary key check (code ~ '^[A-Z2-9]{6}$'),
  host_secret_hash text not null,
  sequence_id      text not null,
  -- Estado do palco (cena, enquetes, liberações, momento, tempos). Votos,
  -- participantes e luzes ficam em tabelas próprias para evitar disputa.
  state            jsonb not null,
  version          integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '24 hours',
  ended_at         timestamptz
);

create table public.participants (
  id           uuid primary key default gen_random_uuid(),
  room_code    text not null references public.rooms (code) on delete cascade,
  token_hash   text not null unique,
  nickname     text check (nickname is null or char_length(nickname) between 1 and 24),
  join_order   integer not null,
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_code, join_order)
);
create index participants_room_idx on public.participants (room_code);

create table public.votes (
  room_code      text not null references public.rooms (code) on delete cascade,
  poll_id        text not null check (char_length(poll_id) <= 80),
  participant_id uuid not null references public.participants (id) on delete cascade,
  option_id      text not null check (char_length(option_id) <= 40),
  updated_at     timestamptz not null default now(),
  -- Um voto por participante por enquete; trocar de opção é um upsert.
  primary key (room_code, poll_id, participant_id)
);

create table public.lights (
  room_code      text not null references public.rooms (code) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  lit_at         timestamptz not null default now(),
  primary key (room_code, participant_id)
);

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.votes enable row level security;
alter table public.lights enable row level security;

revoke all on public.rooms, public.participants, public.votes, public.lights from anon, authenticated;

-- Entrada atômica: a ordem de chegada (usada na "onda de luz") não se repete.
create or replace function public.join_room(p_code text, p_token_hash text, p_nickname text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order integer;
  v_id uuid;
begin
  perform 1 from rooms
   where code = p_code and ended_at is null and expires_at > now()
   for update;
  if not found then
    raise exception 'room_unavailable' using errcode = 'P0002';
  end if;
  select coalesce(max(join_order) + 1, 0) into v_order from participants where room_code = p_code;
  insert into participants (room_code, token_hash, nickname, join_order)
  values (p_code, p_token_hash, nullif(trim(p_nickname), ''), v_order)
  returning id into v_id;
  return v_id;
end;
$$;

-- Retenção mínima: apaga salas vencidas (e, em cascata, participantes, votos e luzes).
create or replace function public.purge_expired_rooms()
returns integer
language sql
security definer
set search_path = public
as $$
  with deleted as (delete from rooms where expires_at < now() returning 1)
  select count(*)::integer from deleted;
$$;

revoke execute on function public.join_room(text, text, text) from public, anon, authenticated;
revoke execute on function public.purge_expired_rooms() from public, anon, authenticated;
grant execute on function public.join_room(text, text, text) to service_role;
grant execute on function public.purge_expired_rooms() to service_role;
