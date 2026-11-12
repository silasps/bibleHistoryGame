# Material do autor: como acrescentar uma semana

A **apresentação** (Visão Geral da Bíblia) usa **só** o seu material: a linha do tempo (Task 1) e o resumo (Task 2) de cada semana. O **jogo** usa a mesma linha do tempo e acrescenta o contexto (Task 4), as fichas de personagens (com o Bible Hub) e os links para a NAA.

Hoje as semanas 1–6 têm material. As semanas 7–11 aparecem como “em breve”.

## Onde está cada coisa

| Arquivo | O que guarda |
| --- | --- |
| `src/content/etapas/index.ts` e `falas.ts` | As etapas (itens, versículos, minijogos) e as suas falas nos momentos |
| `src/content/overview/timeline.ts` | `WEEKS` (título, período, versículo para memorizar com o texto NAA, cor, status) e `ITEMS` (eventos e personagens da linha do tempo, com datas do Manual) |
| `src/content/overview/resumos/semana-0N.ts` | O seu resumo dividido em trechos |
| `src/content/released/overview.ts` | Parágrafos do PRD — **server-only** |
| `src/content/overview/contexto.ts` | “Descobrindo o contexto” (Task 4), para o dossiê do jogo |
| `src/content/overview/corrections.ts` | Referências do seu material que o app mostra corrigidas |
| `src/content/characters/index.ts` | Fichas dos personagens (significado do nome, skin, ligações) |
| `src/content/reflections/index.ts` | Espaços para as suas reflexões (veja `docs/reflexoes.md`) |
| `content/sources/dbs-2026/` | Seus arquivos originais. **Fora do git**, nunca vão para o repositório |

## Passo a passo (exemplo: semana 7)

1. **Fontes.** Salve o resumo, a linha do tempo e o contexto em `content/sources/dbs-2026/` (`w7-resumo.txt`, `w7-linha-do-tempo.pdf`, `w7-contexto.txt`).
2. **Semana.** Em `timeline.ts`, na entrada da semana 7, troque `status` para `"com_material"` e preencha `sources`.
3. **Itens da linha do tempo.** Ainda em `timeline.ts`, acrescente os itens da semana em `ITEMS`:
   ```ts
   { id: "volta-do-exilio", week: 7, kind: "evento", label: "Volta do exílio", from: -538, color: "oliva", art: "volta-do-exilio", refs: [ref("Ezra", 1, 1, 4)] },
   ```
   - Anos a.C. são **negativos**. Use as datas do Manual, sem etiquetas. `approx: true` mostra “±”.
   - `kind`: `evento` e `potencia` ficam embaixo do eixo; `personagem` fica em cima; `tema` é uma parada do resumo sem data (precisa de `anchor`).
   - Itens com o mesmo ano aparecem com o personagem antes do evento. Se a história pede outra ordem, use `seq` (menor vem antes). Exemplo: a Criação tem `seq: -1` para vir antes de Adão e Eva.
   - `art`: o nome da ilustração. Se ainda não existir, aparece um círculo tracejado até haver arte (veja `public/art/README.md`).
4. **Resumo.** Crie `resumos/semana-07.ts` copiando o formato da semana 6 e importe-o em `src/content/overview/index.ts`. Cada trecho tem:
   - `text`: o seu texto, fiel (só correção ortográfica mínima);
   - `stageLine`: até 140 caracteres, condensada **das suas frases**. É o que vai ao telão;
   - `refs`: referências NAA. Se a do material estiver errada, use a correta e registre em `corrections.ts`;
   - `itemIds`: os itens da linha do tempo que o trecho sustenta. Trecho sem item vira abertura da semana;
   - `pendingFact`: marque quando houver um fato a conferir. Trechos marcados não vão ao palco e aparecem “em revisão” no dossiê.
5. **Versículo e PRD.**
   - **Versículo para memorizar:** em `timeline.ts`, na entrada da semana, preencha `memoryVerseText` com o texto NAA conferido em bibliaonline.com.br/naa, um texto por referência de `memoryVerse`. Ele é público: aparece no telão e no celular na cena “versículo para memorizar”.
   - **PRD:** em `released/overview.ts`, acrescente `{ week: 7, blocks }`. O prefixo “PRD -” não entra. Esse texto só sai do servidor depois da liberação (ao vivo) ou da abertura do selo (jogo), e nunca aparece no telão.
6. **Contexto (jogo).** Em `contexto.ts`, acrescente as notas da Task 4 com `itemIds`.
7. **Personagens (jogo, opcional).** Em `characters/index.ts`: significado do nome conferido no Bible Hub (com o link), skin com base declarada (`texto` com referência, `contexto` com fonte ou `licenca_artistica`) e ligações.
8. **Reflexões.** Inclua a semana 7 em `[1, 2, 3, 4, 5, 6].flatMap(semana)` no arquivo de reflexões, para ganhar os espaços daquela semana.
9. **Verifique.** Rode:
   ```bash
   npm test && npm run build && npm run check:bundle
   ```
   Os testes conferem referências, ids, orçamento de texto do palco, tempo total estimado da apresentação (30–45 min) e se o PRD ficou só no servidor. Depois, abra `/editor/linha-do-tempo` e `/presenter/prep` para revisar.

Se a apresentação passar de 45 minutos estimados (sem os minijogos opcionais), o teste mostra um aviso e a Área de preparação marca o tempo em vermelho: reduza itens ou trechos de profundidade, ou ajuste as estimativas em `src/content/overview/sequence.ts`.

## Etapas: como a história aparece na tela

A apresentação corre por **etapas**, não por semanas (`src/content/etapas/index.ts`). As semanas continuam nos seus arquivos e na folha de notas da Área de preparação; no telão e no celular só aparecem as etapas.

- **Itens da etapa:** `itemIds` reúne itens das linhas do tempo de semanas diferentes. A ordem é cronológica, a mesma das semanas.
- **Versículo (PRD):** `prd` diz depois de qual item entra o versículo de cada semana. A pista daquela semana vem logo depois do último versículo dela.
- **Abertura:** `intros` são os trechos de abertura do resumo (sem item) que abrem a etapa.
- **Minijogos:** a Etapa 1 tem os seus em `games`; as etapas 2 a 11 têm um cada em `src/content/etapas/jogos.ts` (título, instrução, desfecho, relíquia e a mecânica: juntar, segurar, ritmo, vedar, funda ou raspar). No telão, esses entram como cenas **opcionais** de cerca de 25 segundos.
- **Momentos da sua fala:** `beats` são gatilhos visuais depois de um item. O texto de cada um fica em `src/content/etapas/falas.ts`: a sua frase em `text`, a linha da tela em `stageLine` (até 140 caracteres, das suas palavras), linhas extras em `steps` (aparecem com **D**) e o Caráter de Deus em `cn` (vira um selo). Leituras suas que vão além do texto ficam com `kind: "interpretacao"`.

Para uma semana nova (7–11), troque a etapa provisória `semana-N` por uma ou mais etapas com os itens dela.

## Regras que valem sempre

- Na apresentação, só entra o que está no seu resumo e na sua linha do tempo.
- “PRD” e a explicação do plano redentivo nunca aparecem no telão nem no palco do apresentador.
- Nada de datas, números, etimologias, genealogias ou falas inventadas. Interpretação contestável é marcada como `interpretacao`.
- Citação literal da NAA só com `quoteVerified: true`, depois de conferida.

Divergências encontradas no material (referências, fatos a conferir, diferenças de datas e de versão) estão em `content/sources/dbs-2026/RELATORIO-DIVERGENCIAS.md`.
