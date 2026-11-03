# Arte própria

Todas as ilustrações do app são desenhos em SVG feitos no código, inspirados na ideia das imagens das linhas do tempo do autor, sem o círculo de fundo. Você pode trocar qualquer uma por uma imagem sua (pesquisada ou gerada com IA).

1. Abra `/editor/arte` (em `npm run dev`) para ver o nome de cada ilustração.
2. Salve a imagem em `public/art/items/<nome>.webp` (também aceita `.png`, `.jpg` e `.svg`).
   Exemplo: `public/art/items/diluvio.webp`.
3. Rode `npm run art:scan` (o `npm run build` também roda sozinho).

A imagem substitui o desenho na linha do tempo, no telão, no celular e no jogo. A ficha de um personagem usa a ilustração de mesmo nome (por exemplo, `davi`).

**Formato recomendado:** quadrada, cerca de 800 × 800 px, fundo transparente, figura centralizada com alguma margem. O fundo do app é escuro, então traço claro ou colorido funciona melhor.

**Direitos:** use só imagens que você pode usar. Anote a origem de cada uma (site, autor, licença ou ferramenta de IA) para conferir depois.

Para voltar ao desenho original, apague o arquivo e rode `npm run art:scan` de novo.
