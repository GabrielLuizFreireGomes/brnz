# Conta e personalização

Abra `http://localhost:4322/#/conta`. No computador, o botão com nome e avatar fica no rodapé da lateral. No celular, fica no topo. O clique abre um painel com identidade, plano quando aplicável, Meu perfil, Aparência, Conversa e Sair. O painel fecha por Escape, clique fora ou escolha de um atalho. Setas navegam entre as opções.

## Dados pessoais

Nome, e-mail, telefone, cargo e apresentação podem ser editados. Nome e e-mail são obrigatórios; o e-mail precisa ser válido e único entre os perfis de demonstração. Papel, empresa, plano e permissões não são editados neste formulário.

A foto aceita imagens de até 10 MB. O editor permite zoom e posição horizontal/vertical antes de salvar o recorte quadrado de 320 px, comprimido em JPEG. Cancelar preserva a imagem anterior; Remover foto restaura as iniciais. O avatar atualizado aparece na lateral, no menu, no login e nas conversas.

## Aparência

Em `#/conta/aparencia`, a pessoa escolhe destaque BRNZ/azul/violeta/jade, avatar arredondado/circular e densidade confortável/compacta. A direção Studio retirou a capa decorativa do perfil; preferências antigas de capa no armazenamento são inativas. A seleção é salva automaticamente por perfil. A densidade compacta ajusta listas no computador; os campos e alvos no celular mantêm os tamanhos de toque. As transições seguem automaticamente a preferência do sistema. Não existem fundos animados nem efeitos de ponteiro.

## Acesso e dados

Em `#/conta/acesso`, aparecem papel, organização, plano e atalhos das seções liberadas. Exportação, instalação quando oferecida pelo navegador e restauração administrativa permanecem disponíveis nos cartões da conta.

Os campos opcionais `photo`, `phone`, `bio` e `preferences` estão no usuário em `data/db.ts`, sem invalidar dados de demonstração existentes. `data/profile.ts` centraliza validação e alterações do usuário autenticado. `ui/avatar-editor.ts` cuida do recorte; `ui/user-menu.ts`, do painel. `screens/conta.ts` reexporta a implementação em `screens/account.ts`.

Tudo continua mockado e local ao navegador. A sessão é por aba; os dados são compartilhados entre abas da mesma origem. Não há upload remoto de foto nem autenticação real nesta etapa.
