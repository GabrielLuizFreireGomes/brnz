# BRNZ — produto e experiência

Referência do escopo: proposta de Gabriel Napo em 30/10/2026. Esta versão é uma aplicação de demonstração com dados mockados, persistidos no navegador.

## A ideia

A BRNZ reúne o trabalho criativo e a operação digital de cada cliente num único espaço. O cliente acompanha o que contratou, aprova peças, pede ajustes, consulta resultados e conversa com quem executa. A equipe organiza entregas, publica versões e acompanha os mesmos registros. O administrador gerencia clientes, planos e acessos.

O produto deve responder rapidamente: o que precisa de mim, o que está sendo feito, o que já foi entregue, como está funcionando e com quem falar.

## Pessoas e navegação

| Perfil | Experiência |
| --- | --- |
| Cliente | Seu próprio negócio, módulos do plano, aprovações, pedidos, conversa e assinatura |
| Equipe | Fila do estúdio, clientes, produção e conversas; sem financeiro e sem administração de acessos |
| Administrador | Operação completa, cadastro de clientes, financeiro e matriz de planos |

No desktop, navegação lateral com cliente em foco. No celular, barra superior, atalhos inferiores e menu Mais. A visão do estúdio reúne a fila geral; a visão do cliente apresenta seu andamento.

## Módulos implementados

| Módulo | Fluxos |
| --- | --- |
| Início | Resumo, fila, próximas entregas, aprovações e atalhos de contexto |
| Design | Solicitar design, acompanhar pedido, atualizar situação, subir peça/versão, aprovar ou pedir ajuste, consultar histórico e baixar imagem |
| Posts | Produção por etapa, busca e filtro, cotas do mês, peças publicadas e métricas por peça |
| Sites | Cadastrar/editar projeto, atualizar etapas, abrir maquete ilustrativa e enviar revisão do cliente |
| Servidor | Disponibilidade, latência, SSL, uso de recursos, histórico, verificação e limpeza de cache simuladas |
| Busca | Google/Bing separados, 7/28 dias, gráfico, pesquisas, páginas e exportação CSV |
| Conversa | Uma conversa por cliente, texto, imagens e contagem de mensagens não lidas |
| Assinatura | Plano, escopo, faturas, simulação de pagamento, comprovante de exemplo e pedido de mudança pelo chat |
| Clientes | Buscar, cadastrar contato, editar empresa/plano e abrir seu contexto |
| Acessos | Matriz módulo × plano e consulta das permissões de cada papel |
| Conta | Perfil, saída, exportação de dados, instalação quando suportada e restauração da demonstração pelo administrador |

## Jornada principal

1. O cliente entra com um perfil de teste e identifica pendências no Início.
2. Faz um pedido de design com formato, prazo e briefing.
3. A equipe acompanha o pedido e envia uma imagem para aprovação.
4. O cliente vê a atualização em outra aba deste mesmo navegador, abre a peça e aprova ou descreve ajustes.
5. Uma versão nova mantém o histórico; o retorno também entra na conversa.
6. A equipe atualiza a etapa. Peças publicadas passam ao acervo com resultados simulados quando disponíveis.

Nos sites: estrutura → design → desenvolvimento → revisão → no ar. A aprovação de revisão comunica o aceite; a equipe continua responsável por mudar a etapa. A maquete é ilustrativa e não corresponde a um site entregue.

## Regras da demonstração

- Planos Largada, Presença e Completo seguem a referência comercial do site; preços e quantidades ainda são amostras, sem compromisso comercial.
- Login por e-mail/perfil é uma simulação, sem senha, autenticação ou proteção de servidor.
- Sessão por aba; dados compartilhados por origem no navegador. Não existe sincronização entre aparelhos ou contas reais.
- Pagamentos, servidor, métricas e domínios são simulados. Não há cobrança, publicação ou mudança em infraestrutura real.
- Upload atual aceita imagens até 10 MB, reduzidas para até 1080 px e JPEG. Não preserva arquivo original, transparência ou animação. Vídeo, PDF, arquivos editáveis e versionamento binário são trabalho futuro.
- Mensagens não recebem respostas automáticas fictícias: teste o atendimento com outra aba no perfil da equipe.

## Para a versão com backend

Implementar autenticação e autorização no servidor, isolamento de organizações, armazenamento de arquivos, sincronização transacional, auditoria, pagamentos com webhooks, integrações Google/Bing e monitoramento real. Nenhuma credencial deve ser inserida no bundle do navegador. Consulte `ARQUITETURA.md` para os limites e os pontos de substituição.
