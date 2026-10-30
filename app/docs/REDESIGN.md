> Histórico da primeira direção. A versão atual é BRNZ Studio: consulte [DIRECAO-STUDIO.md](DIRECAO-STUDIO.md) e [IDENTIDADE-VISUAL.md](IDENTIDADE-VISUAL.md). O motor de luz e as folhas antigas citadas abaixo foram retirados.

# Redesign UI/UX — 30/10/2026

## Direção antes da implementação

A referência principal é o site BRNZ em `http://localhost:4321/brnz/`: mosaico inclinado, azul profundo com luz, marca ampla, Sans Sara expressiva e composição com bastante respiro. A área de trabalho traduz essa identidade em superfícies discretas, conteúdo legível e ações claras.

Paleta: noite `#080a12`, superfície `#10131e`, elevado `#191d2d`, azul BRNZ `#2f3b90`, luz `#6676ff`, texto `#f3f4fb`. Inter Tight para operação e Sans Sara para títulos e marca. Cabeçalhos alinhados à esquerda; largura útil limitada; cartões com raios proporcionais à hierarquia.

```text
marca + espaço       contexto / módulo                 busca / conversa
cliente em foco      título expressivo + ação principal
navegação            composição azul do site (somente no resumo)
                     indicadores com hierarquia
conta                trabalho prioritário        mensagens / pedidos
```

O seletor de clientes deixa de ser um select nativo. O novo painel inclui busca, monograma, empresa, plano, seleção explícita, navegação pelo teclado e acesso à gestão. A mudança de cliente deve também limpar detalhes que pertençam ao cliente anterior.

## Referências pesquisadas

- [Skill frontend-design, Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design): direção específica para o assunto, tipografia deliberada, crítica antes e depois de implementar. Consultada nesta rodada, sem instalar código externo no app.
- [Redesign da Linear](https://linear.app/now/how-we-redesigned-the-linear-ui): hierarquia entre navegação, cabeçalhos e conteúdo; alinhamento e redução de ruído.
- [Radix Select](https://www.radix-ui.com/themes/docs/components/select): composição de gatilho, painel e opções, estados e legibilidade.
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines): teclado, foco visível, alvos de toque, diálogo e responsividade.

Essas fontes orientam decisões de interação; a linguagem visual vem dos arquivos institucionais da BRNZ. Não combinamos estilos prontos de bibliotecas diferentes.

## Resultado implementado

- Área de trabalho com contorno próprio, navegação do estúdio separada do trabalho do cliente e cabeçalho com contexto.
- Abertura com mosaico inclinado e feixes da identidade do site, usando a marca vetorial existente. A composição é decorativa, sem disputar atenção com o trabalho.
- Substituição do dropdown de clientes por um painel pesquisável com monograma, segmento, plano e seleção. Teclado, Escape, retorno de foco e estado vazio implementados. A busca ignora acentos.
- Busca global com Ctrl/Cmd K ou acesso pelo menu Mais. Páginas, clientes e peças seguem papel, plano e contexto. Trocar cliente a partir de uma peça fecha o detalhe antigo.
- Indicadores, listas, formulários, planos, sites e conversas com hierarquia e espaçamento comuns. Os placeholders de peças reutilizam o motivo gráfico da BRNZ em vez de blocos com siglas de formato.
- No celular, a abertura fica compacta e os indicadores gerais do estúdio usam uma faixa deslizante; o trabalho chega antes à tela. O status das peças permanece legível. A conversa mantém o compositor visível acima da navegação.

## Verificação desta rodada

Foram verificadas 40 combinações de rotas/larguras do administrador e 40 do cliente, em 320, 390, 768 e 1440 px. Também passaram os fluxos de seletor, busca por teclado, menu Mais, troca de contexto no detalhe, upload, ajuste, nova versão, aprovação, conversa e preservação de rascunho/consulta durante atualizações ao vivo. TypeScript, build e os quatro testes automatizados de PWA foram executados.

A entrada também foi medida em 320, 768 e 1440 px. Foram conferidas 12 rotas no build sem erros de JavaScript capturados, e o novo seletor e a busca foram abertos após recarregar offline. A troca de cliente preserva abas de listagem, como Publicados, e limpa apenas o detalhe de uma peça da conta anterior.

Evidências em `.qa-brnz/redesign-*.png` e `.qa-brnz/redesign-*.json`. Esta revisão não equivale a auditoria completa de acessibilidade ou a teste com clientes reais.

## Camada de efeitos

`ui/effects.ts` e `styles/effects.css` acrescentam luz sob o ponteiro em cartões, brilho discreto nos controles, grade e órbitas na composição azul e entrada curta de luz/gráficos ao trocar de página. Os textos e os cartões não inclinam ou se deslocam no hover. As camadas decorativas usam `pointer-events: none`.

O login também recebe a luz do ponteiro, os pontos luminosos, a grade e o fundo azul em movimento lento. O movimento ambiente é automático, sem botão ou configuração de ativação/desativação na interface, conforme solicitado. Preferências antigas desse controle não são mais usadas. A preferência de movimento reduzido do sistema mantém o fundo estático; a iluminação continua visível. A aba oculta pausa o movimento ambiente.

O ponteiro agenda no máximo um frame por evento, sem loop JavaScript ocioso. Entradas de títulos/gráficos terminam em até 950 ms; os planos e as luzes decorativas de fundo usam ciclos CSS lentos. A fase do fundo é mantida nas atualizações da mesma tela. Toque não usa o rastreamento do ponteiro. Blur, saída e rolagem limpam a luz temporária. Nenhum efeito intercepta cliques ou move os textos e controles.

Verificados no navegador: luz funcional sem alterar a posição/dimensão do cartão, ausência de interceptação de clique, fim das animações de gráfico, preferência de movimento reduzido e compositor de conversa visível no celular.
