# Bíblia — Por trás da história

> Uma história. Muitas escolhas. Um plano de redenção.

Aplicação web narrativa e educacional que percorre a história bíblica como uma investigação: relatos, dilemas, analogias, pistas seladas e conexões que atravessam a Escritura. Funciona em dois modos que compartilham o mesmo motor narrativo:

- **Modo solo** — jogável no celular ou no computador, com progresso salvo, Arquivo de Descobertas e replay.
- **Modo apresentação ao vivo** — três superfícies: **telão** (projetor 16:9), **painel do apresentador** e **celular do público** (entrada por QR code, sem cadastro).

## Estado atual

| Área | Situação |
| --- | --- |
| Gênesis 1–3 (12 cenas) | **Jogável** no solo e ao vivo |
| Analogias “muro e trem” e “cinco motoristas” | **Jogáveis** (catálogo) e como votação ao vivo |
| 11 atos na linha do tempo | Estrutura completa; atos 2–11 marcados **“Em desenvolvimento”** |
| Raabe, Tabernáculo, Davi, Miqueias | **Esboços editoriais** (não jogáveis), sem resumos inventados |
| Demonstração local da apresentação | **Funciona** no mesmo navegador (abas), com participantes simulados e selo “Demonstração local” |
| Apresentação multiusuário real (Supabase) | **Funciona e foi validada** com dois navegadores independentes contra o projeto Supabase configurado (ver “Testes”) |
| Resumos autorais da DBS / Manual 11S | **Pendentes** — não foram fornecidos nem lidos (ver `content/sources/README.md`) |

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
| `/solo` · `/solo/[ato]/[cena]` | Modo solo |
| `/archive` | Arquivo de Descobertas (quadro de investigação, decisões, linha do tempo, anotações) |
| `/catalog` | Catálogo de experiências (inclui as analogias) |
| `/presenter` | Criar sala (ao vivo ou demonstração local) |
| `/presenter/[sala]` | Painel do apresentador |
| `/presenter/prep` | Área de preparação (roteiro privado — **não projetar**) |
| `/projector/[sala]` | Telão |
| `/join` · `/join/[sala]` | Celular do público |
| `/editor` | Inspeção do conteúdo (só em `next dev` ou com `ENABLE_EDITOR=true`) |

### Apresentar

1. Abra `/presenter`, escolha a sequência e crie a sala.
2. Clique em **Abrir telão** e arraste a janela para o projetor (botão “Tela cheia”).
3. O público entra pelo QR code ou pelo código de 6 letras em `/join`.
4. Conduza pelo painel: setas ou espaço avançam; **P** pausa; **V** abre/fecha votação; **R** revela resultado; **L** libera a pista.

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
- **Som:** sintetizado no navegador (Tone.js), sem arquivos; começa desligado.
- **Ilustrações:** SVG/CSS autorais, sem assets externos.
- **Antifraude:** sem autenticação do público, uma pessoa pode abrir várias abas anônimas e votar mais de uma vez. O sistema garante um voto por token, não por pessoa.

## Roadmap

- Fase 5: episódios completos do Pentateuco (tabernáculo), Raabe e Davi, a partir dos resumos autorais; pipeline de ingestão manual.
- Episódio de Abraão (abre a conexão selada do capítulo 1).
- Canais realtime privados (RLS em `realtime.messages`) e autenticação opcional de apresentadores.
- Quiz de perfil para modular o tom das perguntas.

## Documentação

- `docs/arquitetura.md` — camadas, fluxo de dados, segurança, decisões
- `docs/roteiro-editorial.md` — regras de conteúdo e como escrever um episódio
- `docs/checklist-qa.md` — roteiro de QA manual
- `docs/efeitos.md` — catálogo de efeitos e acessibilidade
- `content/sources/README.md` — como adicionar os documentos autorizados da DBS
