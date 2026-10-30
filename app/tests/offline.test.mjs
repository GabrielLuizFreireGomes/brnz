import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const worker = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8');
function runtime(options = {}) {
  const events = {};
  const deleted = [];
  const cache = { match: async () => options.hit, put: async () => {}, addAll: async () => {} };
  const context = {
    self: { addEventListener: (name, fn) => { events[name] = fn; }, clients: { claim: async () => {} }, skipWaiting: async () => {} },
    location: { origin: 'https://example.test' }, URL, Response,
    caches: { open: async () => cache, keys: async () => ['unrelated-cache', 'brnz-app-old'], delete: async (key) => { deleted.push(key); }, match: async () => options.fallback },
    fetch: async () => { throw Error('offline'); },
  };
  runInNewContext(worker, context);
  return { events, deleted };
}

test('o build inclui os recursos locais no precache', async () => {
  const match = worker.match(/const SHELL = (\[.*?\]) \|\|/);
  assert.ok(match, 'execute npm run build antes dos testes');
  const files = JSON.parse(match[1]);
  assert.ok(files.some((file) => file.endsWith('.js')));
  assert.ok(files.some((file) => file.endsWith('.css')));
  assert.ok(files.some((file) => file.endsWith('.woff2')));
  for (const file of files.filter((file) => file !== './')) await access(new URL('../dist/' + file.slice(2), import.meta.url));
});

test('a ativação preserva caches de outras aplicações', async () => {
  const { events, deleted } = runtime();
  let pending;
  events.activate({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.deepEqual(deleted, ['brnz-app-old']);
});

test('a navegação offline usa o HTML em cache', async () => {
  const fallback = new Response('offline app');
  const { events } = runtime({ fallback });
  let pending;
  events.fetch({ request: { method: 'GET', url: 'https://example.test/', mode: 'navigate' }, respondWith: (promise) => { pending = promise; } });
  assert.equal(await (await pending).text(), 'offline app');
});

test('um recurso ausente offline retorna 503, sem resposta indefinida', async () => {
  const { events } = runtime();
  let pending;
  events.fetch({ request: { method: 'GET', url: 'https://example.test/missing.svg', mode: 'cors' }, respondWith: (promise) => { pending = promise; }, waitUntil: () => {} });
  assert.equal((await pending).status, 503);
});
