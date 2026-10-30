# brnz app

App (PWA) da brnz: assinatura, posts, design, sites, servidor, busca e conversa com o time.
Usa os tokens, as fontes, o logo e os planos do site (`../src`).

```bash
npm install
npm run dev
```

Abre em http://localhost:4322. Na tela de entrada há perfis de teste (admin, equipe e um cliente de cada plano).
Os dados são de exemplo e ficam no aparelho (`src/data/db.ts`); duas abas com perfis diferentes se atualizam ao vivo.

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
