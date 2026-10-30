# BRNZ Studio — revisão visual

## Plano antes da implementação

O produto é a mesa compartilhada de um estúdio de design com seus clientes. O elemento memorável será o contraste entre uma navegação azul BRNZ e uma área de trabalho clara onde as peças, prazos e ações têm prioridade. A interface precisa funcionar para pessoas pouco habituadas a software.

Paleta: BRNZ `#2f3b90`, tinta `#202641`, papel frio `#f5f6fa`, branco `#ffffff`, borda `#e2e5ee`, sucesso `#28725b`. Os estados de atenção usam âmbar escuro em fundos claros, sempre com texto. Não usar gradientes, brilhos ou partículas.

Tipografia: Inter Tight já existente na marca, com pesos 400/500/600, texto de 14–16 px e títulos de 28–34 px. A Sans Sara fica exclusivamente em uma composição gráfica da entrada. Sem etiquetas decorativas em caixa alta, sem microtextos ornamentais.

Layout: conteúdo alinhado à esquerda; navegação estável; busca no topo; resumos compactos e área maior para o trabalho concreto. A conta se organiza como configurações pessoais e não como uma capa de rede social.

```text
Navegação BRNZ | Cliente / página                  Busca
              | Título                    Ação principal
              | Resumo de trabalho          Próxima entrega
              | Fila com peças e prazos     Conversas
              |                            Solicitações
```

## Crítica do plano

Uma troca de cores mantendo o hero promocional e cinco cartões idênticos repetiria a proposta rejeitada. Por isso o início será reconstruído como uma bancada de produção: prioridades, peças e entregas; o perfil perde o banner com mosaico; a entrada usa uma composição tipográfica própria. As superfícies têm raios conforme a função, sem sombra em cada bloco. O azul concentra a identidade na lateral e em ações reais.

Os efeitos respondem a abertura, seleção e confirmação. Não há efeitos seguindo o mouse, movimento infinito de fundo ou controles para desligar animações. Navegação por teclado, redução de movimento, contraste e alvos de toque fazem parte do sistema.

Referência metodológica consultada: [frontend-design, Anthropic](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). A skill `/frontend` não estava instalada; foi consultada a versão pública, sem instalar dependências de interface.
