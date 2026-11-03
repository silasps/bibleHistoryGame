# Espaços de reflexão (escritos pelo autor)

O app **não escreve** reflexões, perguntas de aplicação, Caráter e Natureza de Deus nem revelação pessoal. Ele só deixa os **espaços** onde você coloca o seu texto. Todos estão vazios hoje.

Arquivo: `src/content/reflections/index.ts`.

## Os espaços

| Id | Onde aparece | Modo |
| --- | --- | --- |
| `abertura` | Início da Visão Geral | apresentação |
| `s1-carater-natureza` … `s6-carater-natureza` | Fim de cada semana | apresentação e jogo |
| `s1-revelacao-pessoal` … `s6-revelacao-pessoal` | Fim de cada semana | apresentação e jogo |
| `conclusao` | Fim da Visão Geral | apresentação |
| `gn-criacao-jardim` | Gênesis 1–3, depois de “O jardim” | jogo |
| `gn-tentacao-queda` | Gênesis 1–3, depois do relato da queda | jogo |
| `gn-promessa` | Gênesis 1–3, depois da pista selada | jogo |
| `gn-hoje` | Gênesis 1–3, depois da história “A chave de casa” (aplicação) | jogo |
| `muro-fim` | Fim da analogia do muro | jogo |
| `motoristas-fim` | Fim da analogia dos motoristas | jogo |

## Como preencher

Cada espaço aceita três campos, todos opcionais:

```ts
{
  id: "s1-carater-natureza",
  // …
  pergunta: "Por que você acha que Deus fez uma aliança?",   // até 140 caracteres: vai ao telão e ao celular
  textoSolo: ["Primeiro parágrafo do seu comentário.", "Segundo parágrafo."], // só no modo jogo
  aplicacao: "Uma frase de conexão com a vida.",                 // modo jogo, rotulada “Para a vida”
}
```

Para as semanas, edite a função `semana()` ou substitua a entrada daquela semana na lista `SLOTS`.

**Notas faladas** (o que você quer dizer, mas não projetar) ficam em `src/content/private/reflections.ts`, com a chave igual ao id do espaço. Elas são privadas e aparecem só na Área de preparação (`/presenter/prep`):

```ts
export const REFLECTION_NOTES: Record<string, string[]> = {
  "s1-carater-natureza": ["Lembrar da história do meu avô…"],
}
```

## Como o app se comporta

| Situação | Apresentação | Jogo |
| --- | --- | --- |
| Espaço vazio | Pausa só com imagem (o telão fica limpo enquanto você fala) | Pulado: o jogador não vê nada |
| Com `pergunta` | A pergunta aparece no telão e no celular | Tela de pausa com a pergunta e um campo de anotação pessoal (salvo só no aparelho) |
| Com `textoSolo` / `aplicacao` | Não aparece | Aparece na tela de pausa, rotulado como “Reflexão” |

Nas semanas do jogo, as pausas preenchidas aparecem depois que o jogador abre a pista selada da semana.

Na Área de preparação, cada espaço mostra links para as suas Tasks 3 e 5 daquela semana, como referência (os links vêm de `content/sources/dbs-2026/`, que fica fora do git).

## Verificação

`npm test` confirma que nenhum episódio tem cena de reflexão escrita pelo app e que um espaço preenchido entra no lugar certo.
