# brnz app

Workspace do cliente e do estúdio, com uma demonstração funcional de ponta a ponta. Não exige credenciais externas.

## Documentação

- [Ideia, pessoas e funcionalidades](docs/PRODUTO.md)
- [Identidade visual e onde conferir no site](docs/IDENTIDADE-VISUAL.md)
- [Estrutura técnica, dados e evolução](docs/ARQUITETURA.md)
- [Como testar e resultados da verificação](docs/VALIDACAO.md)
- [Direção BRNZ Studio e crítica do projeto](docs/DIRECAO-STUDIO.md)
- [Conta e personalização](docs/PERFIL.md)
- [Temas e notificações gerais](docs/TEMAS-E-NOTIFICACOES.md)
- [Legibilidade, preferências e galeria de peças](docs/LEITURA-E-GALERIA.md)
- [Publicação independente no Pages](docs/PUBLICACAO.md)
- [Histórico do primeiro redesign](docs/REDESIGN.md)

App (PWA) da brnz: assinatura, posts, design, sites, servidor, busca e conversa com o time.
Usa os tokens, as fontes, o logo e os planos do site (`../src`).

```bash
npm install
npm run dev
```

Abre em http://localhost:4322. Na tela de entrada há perfis de teste (admin, equipe e um cliente de cada plano).
Os dados são de exemplo e ficam no aparelho (`src/data/db.ts`); duas abas com perfis diferentes se atualizam ao vivo.

Para testar o fluxo completo: entre como **Gabriel Gomes** em uma aba e **Rafael Tavares** em outra. Na aba de Gabriel, selecione **Clínica Sorriso Leve**. Suba uma peça em Design, peça ajuste/aprove com Rafael, converse e acompanhe os mesmos dados nas duas abas. Cada aba mantém sua própria sessão.

```bash
npm run check
npm run build
npm test
npm run preview -- --port 4323
```

O build inclui os arquivos estáticos no cache da PWA para uso offline após a primeira visita online. O service worker só é registrado na versão de produção. Teste offline em `http://localhost:4323`, não no servidor Vite de desenvolvimento.

Pagamentos, métricas, prévias de site e operações de servidor são simulados. Nenhuma cobrança ou alteração externa acontece. Dados ficam no navegador e não são protegidos por autenticação real. Exportação e restauração estão em Conta; a restauração geral é exclusiva do administrador.

## Acesso

`src/core/access.ts` define as telas (módulos), quem vê cada uma (admin, equipe, cliente) e quais o plano libera.
O admin muda a matriz plano × tela em **Acessos** e o plano de um cliente em **Assinatura**.

## Android

Sem domínio, empacotado no APK (Capacitor, precisa do Android Studio):

```bash
npm run build
npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio: Build > Build APK(s). Depois de cada mudança: `npm run build` e `npx cap sync android`.

Com uma URL HTTPS (GitHub Pages serve), o https://www.pwabuilder.com gera o APK (TWA) a partir do manifest.
