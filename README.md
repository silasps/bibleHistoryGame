# Bíblia — Por trás da história

> Uma história. Muitas escolhas. Um plano de redenção.

Aplicação web narrativa e educacional que percorre a história bíblica como uma investigação: relatos, dilemas, analogias, pistas seladas e conexões que atravessam a Escritura. Funciona em dois modos que compartilham o mesmo motor narrativo:

- **Modo apresentação ao vivo** — a **Visão Geral da Bíblia**, conduzida pela linha do tempo e feita **só com o material do autor** (linha do tempo + resumo de cada semana da DBS). Três superfícies: **telão** (projetor 16:9), **painel do apresentador** e **celular do público** (entrada por QR code, sem cadastro).
- **Modo jogo (solo)** — a mesma jornada pela linha do tempo, com mais contexto: cada item abre uma cena com a ilustração e uma linha do resumo, e um **dossiê** com o resumo completo, o contexto, a ficha do personagem e as passagens (links para a NAA e para os comentários do Bible Hub). No fim de cada semana, uma pista selada com o versículo e o texto do autor. Gênesis 1–3 e as analogias são episódios “por dentro da história”.

## Estado atual

| Área | Situação |
| --- | --- |
| Visão Geral da Bíblia (apresentação) | **Semanas 1–6**, a partir dos resumos e linhas do tempo do autor; cerca de 36 min estimados. Semanas 7–11 aparecem como “em breve” |
| Jornada do jogo (`/solo`) | **Semanas 1–6**: mapa, cena de cada item, dossiê e pista selada por semana |
| Personagens | Cerca de 37 fichas com significado do nome (Bible Hub), skin com base declarada e ligações; rede no Arquivo e destaque ao vivo |
| Gênesis 1–3 (13 cenas) | **Jogável**, com a história de hoje “A chave de casa” |
| Analogias “muro e trem” e “cinco motoristas” | **Jogáveis** |
| Reflexões, Caráter e Natureza, revelação pessoal, aplicação | **Espaços vazios para o autor** (veja `docs/reflexoes.md`) |
| Ilustrações | SVG próprios; podem ser trocados por imagens do autor (veja `public/art/README.md`) |
| Demonstração local da apresentação | **Funciona** no mesmo navegador (abas), com participantes simulados e selo “Demonstração local” |
| Apresentação multiusuário real (Supabase) | **Funciona e foi validada** com dois navegadores independentes (ver “Testes”) |

## Como rodar

Requisitos: Node 20+ (testado com Node 24), npm.

```bash
npm install
cp .env.example .env.local   # opcional: só é necessário para o modo ao vivo
npm run dev                  # http://localhost:3000
```

Rotas principais:

| Rota | O que é |
| --- | --- |
| `/` | Convite à investigação + linha do tempo dos 11 atos |
| `/solo` · `/solo?semana=N` | Mapa do jogo: escolha a semana e entre pela linha do tempo |
| `/solo/semana/[N]/[item]` | Cena de um item + dossiê (tecla **D**; setas navegam) |
| `/solo/semana/[N]/pista` | Pista selada da semana |
| `/solo/[ato]/[cena]` | Episódios “por dentro” (Gênesis 1–3, analogias) |
| `/archive` | Arquivo: linha do tempo do jogador, documentos abertos, quadro de investigação, personagens, decisões e anotações |
| `/catalog` | Catálogo de experiências (inclui as analogias) |
| `/presenter` | Criar sala (ao vivo ou demonstração local) |
| `/presenter/[sala]` | Painel do apresentador |
| `/presenter/prep` | Área de preparação (roteiro privado — **não projetar**) |
| `/projector/[sala]` | Telão |
| `/join` · `/join/[sala]` | Celular do público |
| `/editor` · `/editor/linha-do-tempo` · `/editor/arte` | Inspeção do conteúdo, correções de referência e nomes das ilustrações (só em `next dev` ou com `ENABLE_EDITOR=true`) |

### Apresentar

1. Abra `/presenter` e crie a sala da **Visão Geral da Bíblia**.
2. Clique em **Abrir telão** e arraste a janela para o projetor (botão “Tela cheia”). Clique em **Ativar som** no telão.
3. O público entra pelo QR code ou pelo código de 6 letras em `/join`.
4. Conduza pelo painel: setas ou espaço avançam; **D** aprofunda o item com a próxima linha do seu resumo; **P** pausa; **V** abre/fecha votação; **R** revela resultado; **L** libera a pista da semana (o versículo e o seu texto chegam ao celular). Nos itens com personagem, os botões da skin destacam um detalhe no telão.
5. Antes, revise o roteiro em `/presenter/prep` (privado: **não projetar**).

Na **demonstração local**, telão e “celulares” precisam estar no mesmo navegador (outras abas). Para celulares reais, use o modo ao vivo.

## Comandos

```bash
npm run dev           # servidor de desenvolvimento
npm run build         # build de produção
npm start             # serve o build
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm test              # Vitest (domínio, conteúdo, componentes, fluxo solo)
npm run check:bundle  # depois do build: garante que conteúdo server-only não está no JS do cliente
npm run test:e2e      # Playwright (sobe build + next start na porta 3200)
npm run db:push       # aplica supabase/migrations no projeto do .env.local
```

Para rodar o E2E contra um servidor já aberto: `E2E_BASE_URL=http://localhost:3000 npm run test:e2e`. Na primeira vez, instale o navegador: `npx playwright install chromium`.

## Supabase (modo ao vivo)

1. Crie um projeto no Supabase.
2. Preencha no `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Para aplicar as migrations, preencha `SUPABASE_DB_URL` com a connection string do **pooler em modo sessão** (IPv4) e `SUPABASE_DB_PASSWORD`, e rode `npm run db:push`. A conexão direta `db.<ref>.supabase.co` costuma ser só IPv6 e falha em redes sem IPv6.
4. Em produção, defina `NEXT_PUBLIC_SITE_URL` (QR code) e `PRESENTER_ACCESS_CODE` (protege a criação de salas e a Área de preparação).

Modelo de segurança (detalhes em `docs/arquitetura.md`):

- Todas as tabelas têm RLS ligado e **nenhuma policy**: a chave anon não lê nem escreve nada. Só o servidor Next, com a service role, acessa o banco.
- O apresentador recebe um segredo em cookie httpOnly; o banco guarda só o hash. Todo comando de palco é validado no servidor.
- O público recebe um token anônimo em cookie httpOnly (apelido opcional). Um voto por participante por enquete; trocar de opção é idempotente.
- As sínteses das conexões **não estão no banco nem no JavaScript do cliente**: ficam em módulos `server-only` e só são anexadas à resposta do celular depois que o apresentador libera a pista.
- Ao encerrar a sala, participantes, votos e luzes são apagados. Salas expiram em 24 h (`purge_expired_rooms()` remove as vencidas).

## Testes

- **Unitários e de componentes (Vitest):** máquina de estados, votação (duplicidade, fechamento, idempotência), reducer da sessão, tempos, integridade do conteúdo, e o **teste de vazamento**: o telão e o painel são renderizados em todas as cenas × estados, e nenhum texto pode conter “PRD”, “plano redentivo”, sínteses ou notas privadas. O fluxo solo completo de Gênesis também é testado, com retomada após recarregar.
- **`check:bundle`:** varre `.next/static` atrás de qualquer trecho das sínteses e notas privadas.
- **E2E (Playwright):** solo completo + retomada; demonstração local com painel, telão e celular; e **ao vivo com Supabase**, com dois contextos de navegador independentes (cookies separados). Esse teste verifica votos, o payload do celular sem a síntese antes da liberação e com ela depois, o payload do telão sem PRD, 403 para quem não é apresentador e o encerramento.

## O que é simulado

- **Demonstração local:** participantes “sim-*” e seus votos são fictícios e gerados no navegador do apresentador; tudo é rotulado.
- **Som:** sintetizado no navegador (Tone.js), sem arquivos: música generativa por clima (cada semana tem o seu) e efeitos. Começa desligado; depois de ligado, volta a tocar no primeiro clique após recarregar.
- **Ilustrações:** SVG/CSS próprios, sem assets externos, até o autor colocar as suas imagens.
- **Antifraude:** sem autenticação do público, uma pessoa pode abrir várias abas anônimas e votar mais de uma vez. O sistema garante um voto por token, não por pessoa.

## Roadmap

- Semanas 7–11, conforme o autor entregar resumos e linhas do tempo (`docs/material-autoral.md`).
- Reflexões do autor nos espaços já criados (`docs/reflexoes.md`).
- Episódio de Abraão (abre a conexão selada do capítulo 1).
- Canais realtime privados (RLS em `realtime.messages`) e autenticação opcional de apresentadores.
- Quiz de perfil para modular o tom das perguntas.

## Documentação

- `docs/material-autoral.md` — como o material do autor vira apresentação e jogo; como acrescentar uma semana
- `docs/reflexoes.md` — espaços de reflexão do autor: onde ficam e como preencher
- `public/art/README.md` — como trocar as ilustrações por imagens próprias
- `docs/arquitetura.md` — camadas, fluxo de dados, segurança, decisões
- `docs/roteiro-editorial.md` — regras de conteúdo e como escrever um episódio
- `docs/checklist-qa.md` — roteiro de QA manual
- `docs/efeitos.md` — catálogo de efeitos e acessibilidade
- `content/sources/README.md` — onde ficam os documentos do autor (fora do git)
