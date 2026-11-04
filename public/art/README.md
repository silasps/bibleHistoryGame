# Arte própria

Todas as ilustrações do app são desenhos em SVG feitos no código, inspirados na ideia das imagens das linhas do tempo do autor, sem o círculo de fundo. Você pode trocar qualquer uma por uma imagem sua (pesquisada ou gerada com IA).

1. Abra `/editor/arte` (em `npm run dev`) para ver o nome de cada ilustração.
2. Salve a imagem em `public/art/items/<nome>.webp` (também aceita `.png`, `.jpg` e `.svg`).
   Exemplo: `public/art/items/diluvio.webp`.
3. Rode `npm run art:scan` (o `npm run build` também roda sozinho).

A imagem substitui o desenho na linha do tempo, no telão, no celular e no jogo. A ficha de um personagem usa a ilustração de mesmo nome (por exemplo, `davi`).

**Formato recomendado:** quadrada, cerca de 800 × 800 px, fundo transparente, figura centralizada com alguma margem. O fundo do app é escuro, então traço claro ou colorido funciona melhor.

## Imagens das etapas

Além de `items/`, o app procura estas pastas (o `npm run art:scan` lê todas):

| Pasta | O que vai nela | Exemplo |
| --- | --- | --- |
| `cenas/` | Fundos das cenas, 16:9. A versão em pé (9:16) do celular leva `-celular` no nome | `cenas/criacao-2.webp`, `cenas/criacao-2-celular.webp` |
| `personagens/` | Personagens recortados (PNG transparente) | `personagens/adao.png` |
| `objetos/` | Objetos recortados (PNG transparente) | `objetos/arvore-vida.png`, `objetos/fruto.png` |
| `reliquias/` | Ícones das relíquias (PNG transparente) | `reliquias/semente.png` |

Os momentos da sua fala usam a ilustração do item; para trocar, salve `items/<id do momento>.webp` (por exemplo, `items/bondade-juizo.webp`).

A lista completa da Etapa 1, com os nomes dos arquivos e os prompts, está na página “Etapas da Jornada”.

**Direitos:** use só imagens que você pode usar. Anote a origem de cada uma (site, autor, licença ou ferramenta de IA) para conferir depois.

Para voltar ao desenho original, apague o arquivo e rode `npm run art:scan` de novo.
