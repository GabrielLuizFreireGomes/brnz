# Leitura, aparência e galeria de peças

## Legibilidade

O tema claro usa texto principal `#17233d`, secundário `#465571` e auxiliar `#52627c`. Títulos dos cards, pedidos e conversas usam a cor principal. Metadados das entregas foram ampliados. O tema escuro mantém os tokens claros próprios, sem aplicar o cinza do tema claro.

Os status agora têm ícone, texto e contorno sutil, com tamanho mínimo de 27–29 px. A etapa do cliente foi encurtada para “Para aprovar”. Cores de sucesso/atenção/erro continuam semânticas; a cor pessoal de destaque não muda o significado de uma pendência.

## Preferências com resultado visível

- Cor: muda a navegação, os destaques da abertura, abas, vínculos e foco. Azul BRNZ continua como padrão e nos botões primários.
- Formato: aplica 50% ou 27% de raio aos avatares reais, inclusive perfil e navegação.
- Densidade: ajusta painéis, formulários, listas, tabelas e altura das prévias. No celular, mantém os alvos de toque e reduz apenas espaços que não prejudicam o uso.
- Tema: Claro, Escuro e Sistema permanecem independentes da cor escolhida.

A escolha é salva por usuário e persiste após recarga. O foco retorna ao rádio selecionado depois da renderização, permitindo continuar a seleção pelo teclado. Rascunhos e filtros de etapa são preservados em atualizações da mesma tela.

O aviso de confirmação fica no canto inferior direito. No celular, aparece acima da navegação inferior, sem ocupar o centro da aplicação. O texto “Ambiente de demonstração” foi retirado do rodapé lateral.

## Galeria e mockups

Início e Posts usam `ui/review-card.ts`: formato e estado no cabeçalho, prévia completa, título, prazo, responsável e ação de revisão. Publicados também incluem métricas. Busca e filtro de etapa trabalham sobre as peças da galeria; clicar abre o detalhe correspondente.

As capas anteriores com publicidade dos serviços BRNZ foram substituídas por exemplos locais coerentes com os clientes. Os SVGs próprios ficam em `src/assets/demo/`; `ui/demo-artwork.ts` resolve a capa e produz variações tipográficas para outros títulos mockados. Imagens efetivamente enviadas pelo usuário têm precedência. Visualização e download usam o mesmo arquivo e extensão. Isso não acrescenta vídeo real ou integração externa.

## Verificação

No ego, as quatro cores produziram valores distintos na navegação e na aba ativa. O avatar alternou entre 50%/27%, e a densidade alterou o padding do painel de 28 para 20 px no desktop. As escolhas permaneceram após recarga. A confirmação ficou a 24 px do canto no desktop e a 18 px da direita, acima das abas, no celular.

Busca por “fornada” retornou somente a peça correspondente; filtro de aprovação retornou as duas peças esperadas. A capa do detalhe e o download usaram a mesma origem SVG. Foram verificados 42 estados entre 320 e 1477 px, sem transbordamento, imagens quebradas ou rodapé fora da tela. Evidências locais, ignoradas pelo Git, usam o prefixo `.qa-brnz/refined-` e o relatório `refinement-layout.json`.
