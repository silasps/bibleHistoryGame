-- Bible Show com um celular por equipe: o estado da partida fica numa linha.
-- Só o servidor Next (service_role) lê e escreve; os celulares recebem o
-- estado pelas ações do servidor e pelo aviso do realtime.
create table public.show_rooms (
  code       text primary key check (code ~ '^[A-Z2-9]{6}$'),
  state      jsonb not null,
  version    integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

alter table public.show_rooms enable row level security;
revoke all on public.show_rooms from anon, authenticated;
