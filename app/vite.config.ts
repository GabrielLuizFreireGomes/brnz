import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: o mesmo build roda num subdomínio, numa subpasta do Pages ou empacotado num APK.
  base: './',
  server: { port: 4322, fs: { allow: ['..'] } },
});
