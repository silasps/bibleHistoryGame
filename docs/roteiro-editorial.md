# Roteiro editorial

Regras e fluxo de trabalho para escrever ou revisar conteúdo. A meta é precisão antes de dramatização.

## Regras inegociáveis

1. **Nunca exibir “PRD”** nem explicações do plano redentivo no telão ou no painel de palco. As conexões aparecem no telão como imagem (semente, fio dourado, selo). A explicação é falada de memória pelo apresentador.
2. **Sínteses** das conexões ficam em `src/content/released/` (server-only). **Roteiro de fala** em `src/content/private/` (server-only), visível só na Área de preparação.
3. **Sem citações da NAA** a menos que conferidas (`kind: "texto_biblico"` exige `quoteVerified: true`). O padrão é paráfrase autoral com referência.
4. **Toda afirmação tem natureza declarada**: `parafrase` (fiel ao texto, com referência obrigatória), `interpretacao` (leitura contestável), `analogia` (história ilustrativa), `hipotese_ficcional` (simulação ou dramatização; use `label: "Dramatização"` para falas inventadas) e `narracao` (voz do jogo, sem afirmação factual).
5. **Escolhas não mudam o cânon.** A cena `canonical_reveal` é a mesma para qualquer escolha; a consequência hipotética vem marcada como “Simulação reflexiva — não é texto bíblico”.
6. **Não inventar** datas, números, etimologias, genealogias, detalhes arqueológicos ou falas. Datas incertas: `approximate`/`debated`.
7. **Conexões** sempre com `basis` (fundamento textual) e tipo: `promessa_explicita`, `profecia_direta`, `tipologia_interpretativa`, `tema_redentivo` ou `cumprimento_novo_testamento`. Não chame de profecia direta o que é leitura tipológica ou temática.

## Exemplo: Gênesis 3:15

- Primário: `promessa_explicita`. O texto anuncia a vitória da descendência da mulher sobre a serpente.
- Secundário: `tema_redentivo`.
- A identificação da descendência com Cristo é `interpretacao`. O NT não cita Gn 3:15 como cumprido; há ecos em Rm 16:20, Hb 2:14 e Ap 12:9.
- A conexão com Abraão (Gn 12:3; 22:18) e com Gl 3:16 (`cumprimento_novo_testamento`, pois Paulo faz a ligação) fica **selada** até o episódio de Abraão.

## Como escrever um episódio

1. Confira as fontes do autor em `content/sources/dbs-2026/` (resumo semanal da DBS, Manual 11S). Sem fonte, o episódio continua como `esboco_editorial` com `authorSummary.status: "pendente_fonte"`. Reflexões e aplicações não são escritas pelo app: use os espaços do autor (`docs/reflexoes.md`) no fim de cada bloco (`movements`) do episódio.
2. Crie `src/content/episodes/<id>/{episode,scenes,evidence}.ts` seguindo Gênesis 1–3. Preencha todos os campos de `Episode`: período com incerteza, referências, acontecimentos, personagens, geografia, contexto, tema, pergunta humana, caráter de Deus, princípios, conexões, lacunas e fontes de apoio.
3. Escreva as sínteses em `src/content/released/` e as notas de fala em `src/content/private/`.
4. Registre o episódio em `src/content/index.ts` (e numa sequência de apresentação, se for o caso).
5. Rode `npm test`: a validação acusa referências fora do intervalo, evidências órfãs, conexões sem fundamento e consequências que não cobrem todas as opções.
6. Revise em `/editor` e marque `reviewStatus`.

## Checklist editorial por episódio

- [ ] Toda paráfrase conferida contra a NAA (referência correta e sentido fiel)
- [ ] Interpretações contestáveis marcadas como `interpretacao`
- [ ] Nenhuma data, número ou genealogia sem fonte; incertezas marcadas
- [ ] Conexões com tipo correto e fundamento textual
- [ ] Textos de palco (`title`, `stage.caption`, `audiencePrompt`) sem explicação e sem “PRD”
- [ ] Dramatizações rotuladas
- [ ] Analogias com bloco “Limites da analogia” quando houver risco de leitura errada
- [ ] Tempo estimado por cena revisado em ensaio
- [ ] Lacunas registradas em `gaps`

## Analogias

São histórias ilustrativas, não eventos bíblicos, e vivem em `src/content/analogies/`. Encaixe editorial sugerido: Ato 2.

- **Muro e trem:** aborda a aliança antes da Lei (Êx 19–20). Tem um bloco obrigatório de limites da analogia: santidade, culto, justiça, identidade e aliança.
- **Cinco motoristas:** o público avalia os quatro primeiros candidatos antes de conhecer o quinto (Lv 19:2; Dt 30:19–20; Pv 4:14–15; 1Ts 4:3–7). Ressalvas obrigatórias: não é salvação por esforço, e nem toda proximidade com o difícil é pecado.
