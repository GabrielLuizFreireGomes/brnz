# Estrutura técnica

## Execução

Aplicação TypeScript sem framework, Vite, CSS e SVG. O app está em `app/`; o site Astro permanece na raiz. Não há backend. O build usa caminhos relativos, compatíveis com hospedagem em subpasta e com um futuro empacotamento Capacitor.

```text
app/
  src/
    main.ts            montagem, eventos globais e ciclo de atualização
    core/
      access.ts        papéis, planos, módulos e matriz configurável
      session.ts       sessão por aba e cliente em foco
      router.ts        navegação por hash e tratamento de rota inválida
      dom.ts           templates com escape e eventos delegados
      screen.ts        contrato Screen e contexto Ctx
      format.ts        moeda, números e datas pt-BR
    data/
      db.ts            modelos, seed, persistência e sincronização
      actions.ts       peças, pedidos, conversa e conversão de imagem
      workflows.ts     autorização, sites, clientes, faturas e exportação
    screens/           módulos do produto; overview.ts implementa o início
    ui/                shell, ícones, peças, gráficos e componentes
      client-switcher.ts painel de clientes com pesquisa e teclado
      command.ts       busca global por páginas, clientes e peças
    styles/app.css     reset, base e estrutura dos módulos
    styles/studio.css  tokens e componentes do sistema BRNZ Studio
    styles/overview.css bancada de produção e início do cliente
    styles/account.css conta, foto, preferências e menu pessoal
    styles/entry.css   composição da entrada
  public/              manifest, ícones e service worker
  docs/                produto, identidade, arquitetura e validação
```

## Renderização

Uma tela implementa título, contexto, ação, view e mount opcional. A casca fornece navegação, seleção de cliente, conteúdo e avisos. `main.ts` verifica os módulos disponíveis antes de montar uma tela. O mount retorna limpeza quando possui timers ou listeners externos.

Templates `html` escapam valores por padrão. `raw` é reservado a código confiável, como ícones e SVG. Dados de usuários não devem ser inseridos em `raw`. O roteador trata escapes inválidos e redireciona módulos não autorizados ao Início. Detalhes de peças verificam a propriedade do cliente.

## Dados

`Db`: clientes, usuários, peças, pedidos, sites, servidores, SEO, faturas e mensagens. IDs criados no navegador. O seed usa datas relativas ao momento da primeira execução; os dados persistidos não avançam automaticamente a cada dia.

- `localStorage['brnz:db']`: banco de demonstração versionado.
- `localStorage['brnz:matrix']`: matriz de módulos por plano.
- `sessionStorage['brnz:session']`: identidade e contexto da aba.
- `BroadcastChannel('brnz')` e evento `storage`: atualização entre abas da mesma origem.

`mutate` mantém uma cópia anterior e reverte o cache em caso de falha ao persistir. Imagens são reduzidas antes da gravação. O armazenamento é limitado pelo navegador; erros não devem apresentar uma falsa confirmação de salvamento.

Não há transação entre abas: alterações simultâneas podem ter conflito de última gravação. Não há banco remoto, proteção criptográfica, backup automático ou controle de acesso real. Tudo que está no navegador pode ser inspecionado. As verificações locais de autorização organizam a demonstração; não substituem autorização no servidor.

## Contratos e regras

- Papel e plano definem módulos visíveis. A equipe não acessa Assinatura nem Acessos.
- Cliente atua somente nos seus registros. Aprovação/ajuste exige etapa de aprovação; equipe atualiza etapas e envia versões.
- Registro de cliente cria ou atualiza o contato de teste; não envia convite nem gera fatura.
- Troca de plano altera o acesso imediatamente; faturas anteriores mantêm os valores históricos. Cobranças futuras ainda não são geradas automaticamente.
- Revisão de site gera mensagem no chat. A publicação continua sendo uma mudança de etapa feita pela equipe.
- Google e Bing possuem consultas e páginas separadas. Recortes de 7 dias são uma aproximação determinística dos mocks de 28 dias; médias de posição permanecem ilustrativas.
- Pagamento muda uma fatura simulada e registra a data; comprovante é texto sem valor fiscal.

## Evolução para produção

1. Adicionar API autenticada e uma organização por cliente; validar papel, plano e propriedade em toda leitura e mutação.
2. Substituir o banco local por consultas assíncronas, estados de carregamento, transações, versões e canal de eventos autenticado.
3. Armazenar arquivos originais em object storage, com URLs temporárias, versões e limites por contrato; incluir vídeo, PDF e arquivos editáveis.
4. Integrar assinatura/pagamento com checkout e webhooks idempotentes. Convites, cancelamento, prorrata e recuperação de acesso exigem regras de negócio aprovadas.
5. Integrar Search Console, Bing e monitoramento pelo servidor. Segredos e tokens nunca devem ficar no cliente.
6. Definir política de retenção, notificações, auditoria e recuperação. Revisar segurança, acessibilidade e licença da fonte antes do lançamento.

PWA e Capacitor não adicionam backend nem tornam o login mock seguro. As integrações acima são deliberadamente futuras nesta etapa com dados mockados.
