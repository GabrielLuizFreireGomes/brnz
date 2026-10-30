# Identidade visual BRNZ Studio

## Referência da marca

O site institucional está em `http://localhost:4321/brnz/`, iniciado com `npm run dev` na raiz. Logo, azul primário `#2f3b90`, tipografia de marca e planos vêm do mesmo repositório. O workspace roda em `http://localhost:4322/` e tem linguagem operacional própria: navegação azul, área clara e foco nas peças.

A revisão atual substitui a proposta escura anterior. O plano, a crítica antes da implementação e a referência metodológica estão em [DIRECAO-STUDIO.md](DIRECAO-STUDIO.md).

## Sistema de cores

| Papel | Valor | Uso |
| --- | --- | --- |
| BRNZ | `#2f3b90` | Navegação, botões primários e assinatura |
| Tinta | `#202641` | Títulos e texto principal |
| Papel | `#f5f6fa` | Área de trabalho |
| Superfície | `#ffffff` | Formulários, listas, diálogos e documentos |
| Contorno | `#e2e5ee` | Separação entre áreas |
| Sucesso | `#28725b` | Aprovações e disponibilidade |
| Atenção | `#966115` | Pendências com fundo âmbar claro |

Textos auxiliares são azul acinzentado e foram escurecidos durante a inspeção visual. Estados têm rótulos, além de cor. O destaque pessoal pode variar sem trocar o azul institucional da navegação.

## Tipografia, espaço e componentes

Inter Tight Variable em navegação, títulos, formulários e números. Títulos de página de 27–30 px, chamadas de trabalho de 30–42 px e conteúdo de 14–16 px. Campos móveis usam 16 px. A Sans Sara fica na composição tipográfica da entrada e nos elementos de marca existentes.

O conteúdo segue uma grade alinhada à esquerda. O início traz produção, aprovação e próxima entrega; o resumo de métricas é uma faixa, sem repetir cinco cartões iguais. No celular, o cartão redundante da próxima entrega sai da abertura, pois a lista logo abaixo já apresenta as entregas. Peças para aprovação aparecem antes.

Raios de 7–8 px em controles, 12 px em listas e 14–16 px em composições maiores. Sombras ficam nos painéis flutuantes e diálogos. Botões principais e alvos móveis têm 44 px; listas e campos mantêm espaço de leitura. Ícones seguem traço único de 1,7 px em grade de 24 px.

## Movimento

Foram removidos luz seguindo o mouse, partículas, órbitas, brilhos e fundos em movimento. As transições de 140–160 ms acompanham abertura de painel, seleção e confirmação. A preferência `prefers-reduced-motion` desativa movimento automaticamente. Não há controle visível de animação.

## Código e manutenção

O tema escuro usa papel `#101521`, superfície `#192131`, tinta `#e7edf8` e contorno `#303b50`. A troca está disponível no topo e em Conta → Aparência, com opções Claro/Escuro/Sistema. Os botões principais mantêm o azul BRNZ em ambos os temas. Consulte [TEMAS-E-NOTIFICACOES.md](TEMAS-E-NOTIFICACOES.md).

- `styles/app.css`: reset, contratos estruturais e componentes básicos.
- `styles/studio.css`: tokens e componentes operacionais da direção atual.
- `styles/overview.css`: bancada de produção e início do cliente.
- `styles/account.css`: conta, preferências, foto e menu pessoal.
- `styles/entry.css`: composição da entrada.
- `styles/themes.css`: temas, tokens semânticos e troca rápida.
- `styles/notifications.css`: sino, contador e painel de notificações.
- `ui/icons.ts`: logo e ícones; `ui/parts.ts`: avatar, miniaturas e status.

Os caminhos acima são relativos a `app/src/`. As folhas da direção anterior e o motor de efeitos foram removidos. Não adicionar novas folhas de correção por cima do sistema: alterar o componente responsável e rever seus estados em desktop e celular.
