# Temas e notificações

## Aparência

Em Conta → Aparência há três opções: Claro, Escuro e Sistema. O botão de sol/lua no topo alterna diretamente entre claro e escuro, no computador e no celular. A escolha é salva por usuário e permanece após recarga ou nova entrada. Sistema acompanha `prefers-color-scheme`, inclusive quando a preferência do dispositivo muda com a aplicação aberta.

Os temas compartilham os mesmos componentes e tokens semânticos. `themes.css` define superfície, texto, contornos, estados e adaptações de gráficos e navegação. Os botões principais usam sempre o azul BRNZ `#2f3b90`; o destaque pessoal muda a navegação, as abas, os vínculos e detalhes da abertura. `theme.ts` resolve a preferência e mantém o atalho acessível com nome da ação seguinte. Trocar o tema preserva os campos marcados com `data-keep` e não navega para outra página. Veja [LEITURA-E-GALERIA.md](LEITURA-E-GALERIA.md).

O cadastro de usuário ganhou `preferences.theme`, com padrão claro para perfis antigos. Nenhum reset de dados é necessário.

## Notificações gerais

O sino substitui o antigo atalho de conversa no cabeçalho. O contador representa notificações não lidas, e o painel permite abrir o destino ou marcar todas como lidas.

Eventos derivados dos dados locais:

- Mensagens não lidas, agrupadas por conversa.
- Peças para aprovação do cliente e ajustes solicitados à equipe.
- Pedidos novos de design para equipe e administradores.
- Faturas disponíveis e vencidas para quem possui acesso à Assinatura.
- Sites prontos para revisão do cliente.

Clientes recebem somente eventos da própria empresa. A equipe não recebe eventos financeiros. Administradores recebem eventos das empresas às quais o mock permite acesso. A matriz de módulos também é respeitada. O destino troca o cliente em foco quando necessário, antes de abrir a tela correta.

A leitura das notificações fica em `User.notificationRead`. Ela é independente da leitura da conversa; dispensar um aviso não responde nem altera a mensagem. Uma nova mensagem ou versão de peça recebe um identificador novo. O código fica em `data/notifications.ts` e `ui/notifications.ts`. Não são notificações push do sistema nem uma integração externa.

## Ajustes de interface

O primeiro elemento do caminho no topo volta ao dashboard. Sair usa texto e ícone vermelhos. Papel e organização no perfil são metadados de texto sem chips. Pagar fatura usa botão primário padrão; Paga usa o estado azul padrão. O aviso de demonstração foi retirado da abertura da Assinatura; o processamento continua local e o diálogo de confirmação descreve seu comportamento atual.

## Verificação

Conferidos no ego-browser: persistência do tema, mudança de Sistema entre claro/escuro por emulação, atalho móvel, preservação do rascunho, contador e leitura após recarga, navegação pela notificação, isolamento por cliente/papel, retorno pelo caminho no topo, cores dos botões mesmo com destaque Jade e Sair vermelho.

Foram verificados layouts entre 320 e 1477 px. O tema escuro passou por 40 estados de tela no plano Completo, sem transbordamento horizontal ou ícones vazios. Conta, início, assinatura, painel de notificações, servidor e busca foram inspecionados por capturas. Evidências geradas estão na pasta ignorada `.qa-brnz/`, com prefixo `theme-` e relatório `dark-theme-layout.json`.
