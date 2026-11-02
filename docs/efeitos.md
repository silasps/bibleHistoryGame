# Efeitos e momentos de surpresa

| Efeito | Onde | Tecnologia |
| --- | --- | --- |
| Título revelado letra a letra | Abertura, títulos de cena, telão | GSAP SplitText |
| Fio dourado que se desenha | Conexões, pista aberta, quadro do Arquivo | GSAP DrawSVG + MotionPath |
| Semente caindo + fio em loop | Momento de conexão (Gn 3:15) | Motion + GSAP |
| Selo de cera que racha | Pista selada (solo, celular, telão) | Motion + partículas + vibração + som |
| Rebobinar para o cânon | Da simulação para o relato | Motion (scanlines, deslocamento RGB) |
| Batida de coração | Escolhas | Tone.js |
| Votos com contagem regressiva | Telão e celular | Motion |
| “Haja luz” | Telão escurece; celulares acendem em onda pela ordem de entrada | Motion + vibração |
| Luzes do público | Cada toque vira uma estrela no telão | Motion |
| Carro chegando à borda / câmera recuando | Cinco motoristas | Motion + SVG |
| Trem passando por trás do muro + tremor | Muro e trem | Motion + Tone.js |
| Partículas (estrelas, vaga-lumes, brasas) | Fundos das cenas | Canvas próprio |
| Iluminação que cresce | Fundo, por cena (`illumination`) | CSS (`--illumination`) |

## Acessibilidade

- `useFx()` combina a preferência do app (Completos / Reduzidos / Sem efeitos) com `prefers-reduced-motion`; a mais restritiva vence.
- **Reduzidos:** sem movimento contínuo, sem tremor, partículas estáticas; o conteúdo aparece direto.
- **Sem efeitos:** sem partículas e sem animações CSS (`data-fx="off"`).
- Nada pisca mais de 3 vezes por segundo.
- **Som:** começa desligado e só carrega o Tone.js quando o usuário liga (exigência de autoplay). O volume fica nas preferências.
- **Vibração:** `navigator.vibrate`; no iOS não faz nada, sem erro.
