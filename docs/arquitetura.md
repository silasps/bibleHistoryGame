# Arquitetura

## Decisão de stack

Next.js 16 (App Router) + Supabase + Tailwind v4 + shadcn/base-ui, em vez do SPA com Vite sugerido no prompt original. O motivo principal é a regra crítica de conteúdo: as sínteses das conexões e o roteiro do apresentador vivem em módulos com `import "server-only"`. Se um componente cliente tentar importá-los, o build falha. Esse conteúdo nunca chega ao JavaScript do navegador, nem no modo solo. A credencial do apresentador é validada em Server Actions, e a service role do Supabase fica só no servidor.

## Camadas

```
src/content/      conteúdo editorial tipado (Zod)          ← público
src/content/released/  sínteses das conexões                ← server-only
src/content/private/   roteiro do apresentador              ← server-only
src/domain/       lógica pura e testada (sem React, sem rede)
src/data/         transportes da sala (local e Supabase) + portas
src/stores/       Zustand (progresso solo, preferências)
src/fx/           efeitos (GSAP, Motion, partículas, Tone.js, vibração)
src/features/     telas (solo, arquivo, apresentação)
src/app/          rotas, Server Actions, Route Handlers
```

### Domínio (`src/domain`)

- `scene-machine.ts`: `locked → ready → active → awaiting_presenter → revealed → completed`.
- `solo-progress.ts`: progresso do modo solo, escolhas, evidências e replay. Funções puras; o store só as aplica.
- `session.ts`: reducer da sala ao vivo. Recebe comandos do apresentador (`next`, `open_poll`, `release`…) e do público (`join`, `vote`, `light`). **É o mesmo reducer na demonstração local e no servidor.**
- `projection.ts`: `toProjectorView` e `toAudienceView`, os únicos dados que telão e celular recebem. Os tipos não têm campos privados; a síntese só entra para evidências em `state.released`.
- `poll.ts`: um voto por participante, troca idempotente, enquete fechada rejeita voto.
- `timing.ts`: tempo por cena e por bloco, descontando pausas.

### Conteúdo (`src/content`)

Episódios, cenas e evidências são módulos TypeScript validados por Zod no carregamento (`schema.ts`), mais verificações cruzadas em `validateNarrative()`: ids únicos, referências bíblicas dentro do número de capítulos, pré-requisitos existentes, toda conexão com fundamento textual e toda consequência hipotética cobrindo todas as opções. Cada cena separa:

- `blocks` — texto do modo solo, cada bloco com sua natureza (`parafrase`, `interpretacao`, `analogia`, `hipotese_ficcional`, `narracao`, `texto_biblico`);
- `stage` — o que pode ir ao telão (legenda curta, nunca explicativa);
- `audiencePrompt` — o que aparece no celular;
- `releases` — id de uma evidência de conexão (a síntese fica em `released/`).

## Fluxo da apresentação

```
                 ┌──────────── painel do apresentador ────────────┐
                 │ comando (Server Action / BroadcastChannel)     │
                 ▼                                                │
   reduceHost(state, cmd)  ──►  estado do palco salvo             │
                 │                                                │
                 ├─► aviso "sync" (realtime / canal local) ───────┤
                 ▼                                                ▼
   telão: GET /api/rooms/X/projector        celular: GET /api/rooms/X/audience
          toProjectorView(state)                    toAudienceView(state, sínteses liberadas)
```

**Demonstração local:** a aba do apresentador é a autoridade (`LocalHostController`). O telão e os “celulares” são outras abas do mesmo navegador, ligadas por `BroadcastChannel` (com fallback para eventos de `storage`). As abas do público só podem enviar comandos de audiência; o host ignora qualquer outra coisa. O estado fica em `localStorage` para sobreviver a um recarregamento. Não é multiusuário real e é sempre rotulada.

**Ao vivo (Supabase):**

- `rooms.state` guarda o estado do palco (só o apresentador escreve, com controle otimista por `version`).
- `participants`, `votes` e `lights` são tabelas próprias, para que muitos votos simultâneos não disputem a mesma linha. `loadRoom` junta tudo num `SessionState` e reaproveita o mesmo reducer e as mesmas projeções.
- Depois de cada mutação, o servidor manda um aviso **sem conteúdo** (`{ scope }`) pelo Realtime Broadcast (`httpSend`). Os clientes refazem a busca da própria view.
- O celular só refaz a busca em mudanças de palco. Votos dos outros não geram tráfego em todos os celulares; só telão e painel acompanham os votos.
- Sem realtime, os clientes caem para polling a cada 4 s. Na reconexão, refazem a busca.

### Segurança

| Ameaça | Mitigação |
| --- | --- |
| Público avançar cenas ou liberar pistas | Comandos de palco só por Server Action que confere o cookie httpOnly do host contra o hash em `rooms.host_secret_hash` (comparação em tempo constante). Na demo, abas do público só emitem comandos de audiência. |
| Ler a síntese antes da hora | A síntese não está no banco nem no bundle do cliente (`server-only` + `check:bundle`). A rota `/audience` só a anexa para ids em `state.released`. |
| Acesso direto ao banco com a chave anon | RLS ligado sem policies; `revoke all` para `anon`/`authenticated`; funções só com `execute` para `service_role`. Verificado com chamadas reais à API REST: 401 em todas as tabelas e na RPC. |
| Voto duplicado | PK `(room_code, poll_id, participant_id)` + upsert; validação de enquete aberta com o mesmo reducer. |
| Dados pessoais | Sem nome, e-mail ou conta. Apelido opcional (≤ 24 caracteres). Ao encerrar, participantes, votos e luzes são apagados; salas expiram em 24 h. |
| Entrada sem validação | Zod em todas as Server Actions; códigos de sala e ids com regex. |

Limitação conhecida: sem autenticação do público, a mesma pessoa pode votar de vários navegadores. O sistema garante um voto por token anônimo, não por pessoa.

### Modo solo e sínteses

No solo, o jogador abre o selo e a síntese vem do servidor por Server Action (`fetchConnectionSynthesis`). É uma proteção anti-spoiler, não sigilo: qualquer pessoa pode jogar o solo e abrir o selo. O que se garante é que **o payload enviado ao público durante uma apresentação** não traz a síntese antes da liberação.

## Efeitos

Ver `docs/efeitos.md`. Todo efeito passa por `useFx()`, que combina a preferência do app (completo/reduzido/desligado) com `prefers-reduced-motion`; a mais restritiva vence.
