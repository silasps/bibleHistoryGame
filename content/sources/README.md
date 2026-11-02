# Fontes autorizadas (DBS)

O conteúdo deste projeto é inspirado na estrutura de uma apresentação de visão geral de uma DBS (Discipleship Bible School): os resumos semanais autorais e as orientações do **Manual DBS do Estudante 11S**.

**Esses documentos não estão no repositório e não foram lidos** na construção do MVP. Nenhum resumo semanal foi inventado: os episódios marcam `authorSummary.status: "pendente_fonte"` e `manualRequirement.status: "pendente_fonte"`.

## Como adicionar

1. Confirme que você tem autorização para usar o material.
2. Coloque os arquivos nesta pasta, um por semana ou ato, por exemplo:
   - `content/sources/semana-01-origens.md`
   - `content/sources/manual-dbs-11s.pdf`
3. Se o material não puder ser público, **não faça commit**: adicione o caminho ao `.gitignore` ou guarde fora do repositório.
4. Para cada episódio, registre no módulo do episódio:
   - `authorSummary: { status: "em_revisao", source: "semana-01-origens.md" }`
   - `manualRequirement: { status: "em_revisao", note: "…" }`
5. Siga o fluxo de `docs/roteiro-editorial.md`. Paráfrases novas devem ser conferidas contra a NAA.

## Outras referências

- **NAA (Nova Almeida Atualizada):** conferência de versículos. Não reproduza trechos longos.
- **BibleProject:** organização literária e temática. Não copie roteiros, artes ou vídeos.
- **Bible Hub:** comparação de comentários e contexto.
