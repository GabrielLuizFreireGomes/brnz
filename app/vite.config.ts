import { defineConfig } from 'vite';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Caminhos relativos: o mesmo build roda num subdomínio, numa subpasta do Pages ou empacotado num APK.
  base: './',
  plugins: [{
    name: 'brnz-offline-shell',
    async closeBundle() {
      const output = fileURLToPath(new URL('./dist/', import.meta.url));
      const files = (await readdir(output, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name !== 'sw.js')
        .map((entry) => './' + `${entry.parentPath}/${entry.name}`.slice(output.length).replace(/\\/g, '/').replace(/^\//, ''));
      const shell = ['./', ...files.sort()];
      const hash = createHash('sha256').update(JSON.stringify(shell));
      for (const file of files.sort()) hash.update(await readFile(output + file.slice(1)));
      const revision = hash.digest('hex').slice(0, 12);
      const worker = await readFile(new URL('./public/sw.js', import.meta.url), 'utf8');
      await writeFile(output + '/sw.js', worker.replace('brnz-app-v1', `brnz-app-${revision}`).replace('/*__PRECACHE__*/', JSON.stringify(shell) + ' || '));
    },
  }],
  server: { port: 4322, fs: { allow: ['..'] } },
});
