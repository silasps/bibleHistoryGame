# Checklist de QA

Antes de cada apresentação importante, rode os automáticos e percorra o manual.

## Automático

- [ ] `npm run lint && npm run typecheck && npm test`
- [ ] `npm run build && npm run check:bundle`
- [ ] `npm run test:e2e` (com Supabase configurado, inclui o teste ao vivo com dois navegadores)

## Jornada do jogo (linha do tempo)

- [ ] `/solo`: semanas 1–6 clicáveis, 7–11 “em breve”; a linha do tempo da semana abre o item ao clicar
- [ ] Cena do item: ilustração grande, data, uma linha do resumo; setas ← → e tecla **D** (dossiê)
- [ ] Dossiê: “Do resumo” com o texto completo (trechos em revisão marcados), Contexto (quando houver), Personagem, Passagens com links para a NAA e o Bible Hub
- [ ] Itens visitados ganham a marca dourada; “Pista selada” só libera depois de visitar todos
- [ ] Pista da semana: o selo abre com o versículo e o texto do autor; as pausas do autor aparecem só se estiverem preenchidas
- [ ] Arquivo: aba Linha do tempo com o progresso por semana; aba Documentos com as pistas e os dossiês abertos
- [ ] No celular, a barra ← 3/12 → fica fixa no rodapé

## Episódios “por dentro”

- [ ] Completar Gênesis 1–3 do início ao fim, no celular e no desktop (13 cenas, incluindo “A chave de casa”)
- [ ] “Continuar” bloqueado na escolha até escolher; quiz e enquetes registram a resposta
- [ ] Faixa “Simulação reflexiva — não é texto bíblico” na consequência hipotética
- [ ] Efeito “rebobinar” ao entrar no relato canônico
- [ ] Selo de Gênesis 3:15 só abre na cena da pista; mostra classificação da conexão
- [ ] Recarregar a página retoma do mesmo ponto; “Recomeçar” zera só o episódio
- [ ] Arquivo: 6 evidências abertas, a conexão com Abraão selada e as decisões listadas

## Apresentação

- [ ] Visão Geral: o telão mostra a linha do tempo da semana, um item por vez, com **uma** linha do resumo; **D** troca para a próxima linha
- [ ] Destaque da skin aparece no telão e a ficha no celular; some ao trocar de item
- [ ] Versículo da semana: telão, painel e celular mostram o texto NAA e a referência; nenhum mostra o PRD
- [ ] Pista da semana: o telão mostra só a referência; o celular recebe o texto do autor depois de “Liberar pista”
- [ ] Espaços do autor vazios viram pausa só com imagem
- [ ] Lobby do telão com QR code legível a 5 m e código de 6 letras
- [ ] Celular entra pelo QR, com e sem apelido; recarregar não perde o participante
- [ ] Votação: abrir → votar → trocar o voto → fechar (voto tardio recusado) → revelar com contagem regressiva
- [ ] Momento de conexão: telão **só com imagem**, sem título nem texto
- [ ] Pista selada no celular antes da liberação; abre com efeito depois de “Liberar pista”
- [ ] Telão mostra só a referência (ex.: “Gênesis 3:15”), nunca a explicação
- [ ] Pausa, “Haja luz”, “Luzes do público”, candidatos e trem/muro funcionando
- [ ] Cronômetro: tempo por cena e por bloco coerente; pausa não conta
- [ ] Encerrar mostra “Obrigado” nos celulares; “Apagar sala” remove a sala
- [ ] Demonstração local exibe o selo “Demonstração local” no painel, no telão e no celular

## Acessibilidade

- [ ] Navegação só pelo teclado em todas as telas (foco visível e dourado)
- [ ] “Sem efeitos” e `prefers-reduced-motion` removem movimentos amplos, tremor e partículas animadas
- [ ] Som desligado por padrão; volume ajustável
- [ ] Texto ampliável (A / A+ / A++)
- [ ] Alvos de toque ≥ 44 px no celular
- [ ] Contraste do texto sobre o fundo escuro

## Conteúdo

- [ ] `/editor` sem problemas de integridade
- [ ] Nenhum “PRD” em tela de palco (coberto por teste, mas confira os textos novos)
- [ ] Paráfrases novas conferidas contra a NAA
