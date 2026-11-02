<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bíblia — Por trás da história

Aplicação narrativa/educacional (Next.js 16 App Router + Supabase + Tailwind v4). Modo solo e modo apresentação ao vivo (telão, painel do apresentador, celular do público).

## Comandos

- `npm run dev` · `npm run build` · `npm test` · `npm run lint` · `npm run typecheck`
- `npm run check:bundle` (depois do build): garante que conteúdo server-only não está no JS do cliente.
- `npm run test:e2e` (Playwright, sobe `next start` na porta 3200).

## Regras de conteúdo (críticas)

- Nunca exibir "PRD" ou explicações do plano redentivo no telão (`ProjectorView`) nem no palco do apresentador. Testado em `src/domain/projection.test.ts`.
- Sínteses das conexões ficam em `src/content/released/` e notas do apresentador em `src/content/private/`, ambos com `import "server-only"`. Nunca importe esses módulos em componentes cliente.
- Texto editorial não vai hardcoded em componentes: fica em `src/content/**`, validado por Zod (`src/content/schema.ts`).
- Todo bloco tem `kind` (`parafrase`, `interpretacao`, `analogia`, `hipotese_ficcional`, `narracao`, `texto_biblico`). Sem citações da NAA, a menos que `quoteVerified: true`.
- Escolhas do jogador nunca mudam o cânon. Toda conexão tem `connection.basis` e tipo.
- Não invente datas, números, etimologias, genealogias ou falas. Interpretações contestáveis são `interpretacao`.

## Arquitetura

- `src/domain/*`: lógica pura (máquina de estados, votação, sessão ao vivo, projeções, tempo). Coberta por testes.
- `src/data/*`: transportes da sala (demo local via BroadcastChannel; Supabase).
- `src/fx/*`: efeitos (GSAP, Motion, partículas, Tone.js). Respeitam `useFx()` (movimento reduzido / sem efeitos).
