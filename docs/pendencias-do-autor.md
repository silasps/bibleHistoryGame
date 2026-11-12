# O que falta você fazer

Lista para lembrar, atualizada em 4 de novembro de 2026. O estado ao vivo de cada item fica na **Área de preparação** (`/presenter/prep`), na folha de notas.

## Para a nota (folha de notas do Manual, p. 14 e 18)

- [ ] **Introdução** (3 pontos): precisa mencionar a finalidade de mostrar o PRD. Espaço `abertura` em `src/content/reflections/index.ts`; as notas faladas vão em `src/content/private/reflections.ts`.
- [ ] **Conclusão** (2 pontos): espaço `conclusao`.
- [ ] **Caráter e Natureza de Deus**, semanas 1 a 6 (10 pontos, ao longo da apresentação): espaços `s1-carater-natureza` a `s6-carater-natureza`. Material que você já tem na Task 3:
  - Semana 1: Criativo; Dá vida (Gn 2:7)
  - Semana 2: Sério (Lv 10:3); Santo (Lv 19:2)
  - Semana 3: Fiel mesmo quando não somos (Jz 2:1–2); Inclui na sua herança todo o que nele crê (Js 2:9–14)
  - Semana 4: Generoso para com um coração servo (1Rs 3:12–14); Zeloso para com seu nome
  - Semana 5: Compassivo (Jn 4:11); Soberano (Jn 2:10)
  - Semana 6: Justo (Sf 3:5); Eterno (Dn 4:34)
  - Já estão na tela, como selo, os que você citou na sua fala: santo (Queda), bom e amoroso (dilúvio), protetor e zeloso (José), cuidador da promessa (sarça) e a bondade nas vestes de pele.
- [ ] **Revelação pessoal**, semanas 1 a 6: espaços `s1-revelacao-pessoal` a `s6-revelacao-pessoal`. O Manual pede “alguma revelação pessoal” e a transformação que você viveu.
- [ ] **PRD da semana 6:** o resumo da semana 6 não tem o parágrafo “PRD -” (as outras semanas têm). Sem ele, a pista 6 abre só com o versículo (Ez 36:26). Os trechos sobre a nova aliança (Jr 31:31–33) e o coração novo (Ez 36:26) parecem ser o seu PRD; se for isso, escreva o parágrafo e eu coloco.
- [ ] **Semanas 7 a 11**: resumo, linha do tempo e texto NAA do versículo, quando chegarem (veja `docs/material-autoral.md`). A semana 7 está em andamento no Drive.
- [ ] **2 convidados de fora da escola** (20 pontos).
- [ ] **Ensaio** no fim do Antigo Testamento. **Apresentação final:** 10 e 11 de dezembro.

Como preencher os espaços: `docs/reflexoes.md`.

## Tempo: a Bíblia inteira em 45 minutos

O Manual recomenda, para cada semana, um tempo **acumulado** de compartilhamento: 10, 13, 16, 22, 25, 28, 31, 34, 37, 40 e 45 minutos. Por semana, isso dá 10, 3, 3, 6, 3, 3, 3, 3, 3, 3 e 5 minutos. A referência de cada etapa divide esses minutos pela quantidade de itens.

Hoje, só com as semanas 1 a 6, a estimativa é de **45,5 minutos** sem os minijogos opcionais (mais uns 4 min com eles); a referência até a semana 6 é de **28 minutos**. Já passou do limite de 45 da apresentação inteira. É preciso cortar perto de 16 minutos, e mais um pouco para a abertura e a conclusão, que saem do mesmo total.

| Etapa | Estimado hoje | Referência |
| --- | --- | --- |
| 1 · O começo | 7:15 | 2:00 |
| 2 · O mundo se afasta | 1:55 | 2:00 |
| 3 · A promessa | 2:25 | 3:20 |
| 4 · No Egito | 3:25 | 2:00 |
| 5 · Libertação | 0:40 | 0:40 |
| 6 · Deus no meio do povo | 4:55 | 3:00 |
| 7 · A terra | 3:00 | 1:45 |
| 8 · O reino | 6:40 | 2:15 |
| 9 · O reino dividido | 2:55 | 5:00 |
| 10 · Os profetas avisam | 5:40 | 3:00 |
| 11 · Exílio e esperança | 5:10 | 3:00 |
| 12–16 · semanas 7 a 11 | — | 3:00 cada (João: 5:00) |

- [ ] **Decidir o que encurtar.**
  - **Etapa 1:** os minijogos somam quase 5 minutos sozinhos.
  - **Onde ajustar:**
    - o tempo de cada minijogo (`seconds` em `src/content/etapas/index.ts`);
    - os momentos da sua fala (`beats`, no mesmo arquivo);
    - os itens que entram em cada etapa.
  - **Onde conferir:** a tabela da Área de preparação e o cronômetro do ensaio mostram estimado × referência.

## Imagens

- [x] **Lote 1 (Etapa 1):** 28 imagens instaladas em 4/11 (créditos em `public/art/credits.json`).
- [ ] **Lote 2 (etapas 2 a 11):** 22 imagens (cenas dos minijogos, relíquias, o cesto e Golias), com prompts na mesma página. Pode salvar sem renomear, na ordem da lista.
- [ ] **Opcional:** gerar de novo “sol, lua e estrelas” **em pé** (9:16). A que veio tem faixas borradas em cima e embaixo; por enquanto o celular mostra a versão deitada inteira.

## Para conferir

- [ ] **Minijogos das etapas 2 a 11** (`src/content/etapas/jogos.ts`): título, instrução, desfecho e relíquia de cada um. No telão eles são **opcionais** (marcados no roteiro): decida quais ficam na apresentação final.

- [ ] **Linhas da tela tiradas da sua fala** (etapas 1 a 4): veja se dizem o que você quer.
  - **Onde estão:** em `src/content/etapas/falas.ts`. A Área de preparação mostra a sua fala completa ao lado de cada momento.
- [ ] **Fatos em revisão** do relatório (`content/sources/dbs-2026/RELATORIO-DIVERGENCIAS.md`, seções 3 e 6).
  - Enquanto você não decidir, esses trechos ficam fora do palco.
- [ ] **Semana 6, Ezequiel:** “glória saindo do templo” estava como Ez 8:3–4; o app usa Ez 10:18–19 (em 8:3–4 a glória ainda está no templo). E a idade de Ezequiel (exilado aos 25, chamado aos 30) é uma leitura comum de “trigésimo ano” (Ez 1:1), mas o texto não diz a idade: a nota fica “em revisão” no dossiê.
- [ ] **“400 anos” no Egito:** Gn 15:13 diz 400; Êx 12:40 diz 430. Decida como falar.
- [ ] **Resumo da semana 2:** tem frases cortadas (“Números 16 vai mostrar claramente a seriedade do Senhor no que diz respeito”, “sensos pensando em batalhas que çkjsj”).

## Opcional

- [ ] **Código de apresentador na Vercel:** defina `PRESENTER_ACCESS_CODE` para só você criar salas ao vivo.
