# Validação da demonstração

Rodada de implementação e teste: **30/10/2026**. Testes executados no Windows com navegador Chromium pelo ego-browser. Este registro descreve verificações reais da versão local, com dados mockados.

## Revisão atual: BRNZ Studio

A direção atual está em [DIRECAO-STUDIO.md](DIRECAO-STUDIO.md). As capturas com prefixo `studio-` representam esta revisão; os registros `redesign-*` e a primeira rodada abaixo são históricos.

O novo sistema foi inspecionado no ego-browser com capturas de Início, Clientes, Acessos, Design, Posts, Sites, Servidor, Busca, Conversas, Assinatura, Conta e Aparência. Foram removidos os arquivos dos efeitos de ponteiro e fundos animados. A inspeção encontrou e corrigiu: contraste baixo nos metadados, status duplicados, título da conta desalinhado, link de pular conteúdo ocupando espaço no topo e miniatura pequena no detalhe da peça. A imagem do detalhe agora vem antes da decisão no celular, com enquadramento completo.

- 78 estados de navegação do administrador, incluindo redirecionamentos por plano, em seis tamanhos de janela.
- 55 estados do cliente Completo em cinco tamanhos, de 320×640 a 1440×900, sem transbordamento horizontal ou ícones vazios.
- Mais 16 estados de Sites/Servidor/Busca/Conta com administrador e cliente em foco no plano Completo, em 320/390/960/1440 px: todas as rotas corretas e rodapé contido.
- Abertura de peça pela próxima entrega troca cliente e rota corretamente. Abertura pelas aprovações do cliente, formulário de ajuste e cancelamento, pedido de design, menu pessoal e editor de foto conferidos.
- Destaque azul persistiu após recarga; padrão BRNZ restaurado. O editor de foto abriu com imagem local, e Cancelar preservou o avatar.
- No chat móvel de 390×844, compositor termina em 775 px, barra inferior começa em 776 px e a página permanece em 844 px. A conversa foi inspecionada visualmente no desktop; duas tentativas de captura móvel terminaram por timeout do ego, sem impedir as medições do layout.
- TypeScript, build Vite e os quatro testes de service worker passaram.

Evidências em `.qa-brnz/`: `studio-admin-layout.json`, `studio-client-layout.json`, `studio-complete-layout.json`, `studio-home-final.png`, `studio-client-mobile-final.png`, `studio-piece-mobile-final.png`, `studio-dialog-mobile.png`, `studio-photo-editor.png`, `studio-user-menu-mobile.png` e as capturas `studio-*-desktop.png`. Arquivos gerados ficam ignorados no Git.

Não se trata de auditoria WCAG, teste em aparelhos físicos nem aprovação por clientes reais. As integrações continuam mockadas.

## Executar

Na pasta `app/`:

```bash
npm install
npm run dev
```

Abra **http://localhost:4322**. Para conferir a identidade institucional, rode `npm run dev` na raiz em outro terminal e abra **http://localhost:4321/brnz/**.

Para validar o pacote:

```bash
npm run check
npm run build
npm test
npm run preview -- --port 4323
```

Os testes de `tests/offline.test.mjs` leem o build em `dist/`; por isso o build precisa vir antes de `npm test`.

## Resultados

| Verificação | Resultado |
| --- | --- |
| TypeScript em modo strict | Passou |
| Build de produção Vite | Passou |
| Testes automatizados de PWA | 4 passaram: precache, isolamento de caches, navegação offline e recurso ausente |
| Cliente: 10 rotas × 4 larguras | 40 combinações sem overflow horizontal ou imagem quebrada detectada |
| Administrador: 12 rotas × 4 larguras | 48 combinações sem overflow horizontal após correção da Conta em 320 px |
| Larguras | 320, 390, 768 e 1440 px |
| Upload e revisão de design | Imagem enviada pela equipe, ajuste pelo cliente, nova versão e aprovação sincronizados |
| Histórico | Aprovação, ajustes e versões registrados |
| Pedidos | Criação pelo cliente visível para a equipe |
| Métricas de posts | Edição pela equipe refletida no detalhe do cliente |
| Sites | Mudança para revisão, abertura da maquete e envio de ajuste do cliente |
| Assinatura | Pagamento de teste, baixa da fatura, download de comprovante e solicitação de plano no chat |
| Clientes | Busca vazia, criação, edição e rejeição de e-mail duplicado |
| Conversa | Envio nos dois sentidos, rascunho preservado durante atualização e envio no celular |
| Menu Mais | Navegação até Sites no celular |
| Permissões | Cliente bloqueado em Acessos e em peça de outro cliente; equipe bloqueada no financeiro/administração; Largada bloqueado em Posts e Sites |
| Matriz | Revogação de Busca no Completo refletida em outra aba |
| Troca de plano | Upgrade/downgrade ao vivo, módulos liberados/revogados e estado vazio para novo escopo |
| SEO | Consultas distintas de Google/Bing, troca de período e download CSV |
| Servidor | Verificação e limpeza de cache simuladas com registro no histórico |
| Arquivo inválido | Upload de texto rejeitado com mensagem compreensível |
| Exportação | JSON do administrador e JSON do cliente com registros restritos ao seu contexto |
| PWA no navegador | Service worker ativo; recarga e navegação ao SEO com rede offline simulada |
| Última passagem no build | 10 rotas de produção sem erros de JavaScript capturados |

## Correções encontradas durante o teste

- A barra inferior cobria o compositor da conversa no celular. A tela agora usa a altura disponível e mantém o compositor acima das abas; envio confirmado em 390 × 844 px.
- Botão longo da Conta do administrador provocava largura de 333 px em viewport de 320 px. O texto agora quebra dentro do botão.
- Cadastro novo buscava um usuário sem cliente e preenchia o contato do administrador. A busca do contato agora só acontece ao editar um cliente existente.
- Fontes e bundle não eram pré-carregados na primeira instalação da PWA. O build agora gera o precache de todos os recursos locais.
- O service worker removia caches alheios da mesma origem. A limpeza agora se restringe ao prefixo do aplicativo.
- Sessão compartilhada como fallback impedia uma entrada independente em aba nova. A sessão agora fica apenas no `sessionStorage`.
- Busca no Bing mostrava consultas do Google. Fontes, dados exibidos e exportação agora correspondem à aba selecionada.
- A edição de métricas alterava a data usada na cota mensal de publicação. O modelo agora separa `publishedAt` de `updatedAt`.

## Roteiro para repetir os fluxos principais

1. Abra duas abas no mesmo endereço e navegador. Entre como Gabriel na primeira e Rafael na segunda. Selecione Clínica Sorriso Leve no seletor de Gabriel.
2. Na aba do cliente, faça um novo pedido em Design. Na equipe, atualize sua situação e suba uma imagem com título e prazo.
3. No cliente, abra a peça e peça um ajuste. Na equipe, envie outra imagem por Subir versão nova. Aprove no cliente e confira o histórico.
4. Troque mensagens nos dois sentidos. Digite um rascunho antes de receber uma mensagem e confirme que ele continua disponível.
5. Na equipe, altere um site para Revisão. No cliente, abra a prévia e envie sua revisão. Na equipe, leia o retorno.
6. Na Assinatura do cliente, simule um pagamento e baixe o comprovante. Solicite outro plano e confira a mensagem na Conversa.
7. Consulte Google e Bing e compare 7/28 dias. Exporte o CSV. Na equipe, execute as operações simuladas de Servidor.
8. Em Acessos, desative um módulo de um plano e confirme a mudança na aba do cliente. Restaure a opção após o teste.

Para testar offline, visite o **build** em `http://localhost:4323`, aguarde o service worker controlar a página, ative Offline nas ferramentas do navegador e recarregue. O modo dev não registra service worker. A primeira visita sempre precisa de rede.

## Evidências locais

Na raiz do repositório, `.qa-brnz/` contém os scripts desta rodada, as medições JSON, downloads de exemplo e screenshots. É uma pasta ignorada pelo Git para não versionar dados gerados.

- `responsive.json`: 40 medições do cliente.
- `admin-responsive.json`: 48 medições do administrador.
- `inicio-390.png`, `inicio-1440.png`, `sites-390.png`, `sites-desktop.png`: composição revisada.
- `chat-mobile-final.png`: compositor corrigido e envio confirmado.
- `busca-bing-7-1440.png`: fonte e período de SEO.
- `production-offline.png`: build aberto sem rede.
- `final-app.png`: composição final no build de produção.
- `runtime.json`: última passagem pelas rotas de produção.

As capturas ocorreram ao longo da rodada; os mocks nelas incluem alterações feitas nos testes. Para voltar ao seed, entre como administrador e use Conta → Restaurar demonstração. A restauração apaga as alterações de exemplo de todas as abas dessa origem.

## Limites da verificação

### Revisão de conta e interface — 30/10/2026

- Formulário: persistência após salvar; e-mail duplicado rejeitado sem alterar o registro; nome longo sem escapar do rodapé. Dados usados nos testes foram devolvidos aos valores anteriores.
- Imagem: upload de PNG, recorte em diálogo, gravação, recarga e avatar atualizado na lateral; remoção restaura iniciais.
- Preferências: destaque jade e capa aurora persistiram após recarregar; padrão BRNZ/mosaico restaurado em seguida.
- Menu: clique abre painel sem navegar; atalhos, Escape, saída e entrada em outro perfil verificados. Painel móvel permanece dentro do viewport de 320 px.
- Conta: 320×640, 390×844, 768×1024, 960×600, 1024×640 e 1375×804 sem transbordamento; rodapé contido no desktop. Navegação longa da equipe rola separadamente do rodapé.
- Passagem pelas rotas de administrador em 320/390/960/1375 px; Sites, Servidor e Busca conferidos também com cliente do plano Completo. Corrigida a largura mínima do cartão de site em 320 px.
- Evidências adicionais em `.qa-brnz/`: `account-desktop.png`, `account-mobile.png`, `workspace-home.png`, `posts-desktop-new.png`, `appearance-mobile.png` e scripts `profile-*.mjs`. Capturas intermediárias podem conter valores de teste.

### Escopo dos testes

Não foram feitos deploy público, cobrança real, integração com plataformas, compilação de APK, instalação em aparelho físico, teste de Safari/iOS, auditoria WCAG completa, teste de carga ou avaliação com clientes reais. Os testes de navegador e de service worker não validam serviços que ainda não existem. Consulte `PRODUTO.md` e `ARQUITETURA.md` para os limites funcionais da etapa mockada.
