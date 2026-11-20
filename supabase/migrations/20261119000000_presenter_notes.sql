-- Notas do apresentador: o que o autor escreve no painel, por cena da sequência.
-- Só o servidor lê e grava (service role), e só para quem tem acesso de apresentador.
-- Nunca vão ao telão nem ao celular.
create table public.presenter_notes (
  sequence_id text not null check (char_length(sequence_id) <= 40),
  scene_id    text not null check (char_length(scene_id) <= 80),
  body        text not null default '' check (char_length(body) <= 6000),
  updated_at  timestamptz not null default now(),
  primary key (sequence_id, scene_id)
);

alter table public.presenter_notes enable row level security;
revoke all on public.presenter_notes from anon, authenticated;
