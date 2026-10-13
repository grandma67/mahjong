import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('index.html');
const safetyNet = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ORIGIN = 'https://user.github.io';

/** Runs the start-up safety net from index.html in a fake page, then fires `load`. */
async function loadPage({ ready = false, session = new Map() } = {}) {
  const calls = { fetched: [], unregistered: 0, deleted: [], reloads: 0 };
  let onLoad;
  const cacheNames = ['rh-mahjong-solitaire-precache-A', 'rh-mahjong-solitaire-fonts', 'other-app-cache'];
  const window = {
    addEventListener: (type, fn) => { if (type === 'load') onLoad = fn; },
    caches: {
      keys: async () => cacheNames,
      delete: async (name) => calls.deleted.push(name),
    },
  };
  let done;
  const reloaded = new Promise((r) => { done = r; });
  vm.runInNewContext(safetyNet, {
    window,
    caches: window.caches,
    document: { documentElement: { dataset: ready ? { app: 'ready' } : {} } },
    sessionStorage: { getItem: (k) => session.get(k) ?? null, setItem: (k, v) => session.set(k, v) },
    performance: {
      getEntriesByType: () => [
        { name: `${ORIGIN}/mahjong/src/core/game.js` },
        { name: `${ORIGIN}/mahjong/src/core/generator.js` },
        { name: 'https://fonts.gstatic.com/s/outfit.woff2' },
      ],
    },
    fetch: async (url, init) => calls.fetched.push([url, init.cache]),
    navigator: { serviceWorker: { getRegistration: async () => ({ unregister: async () => { calls.unregistered++; } }) } },
    location: { origin: ORIGIN, reload: () => { calls.reloads++; done(); } },
  });
  onLoad();
  if (!ready) await Promise.race([reloaded, new Promise((r) => setTimeout(r, 200))]);
  return calls;
}

test('main.js tells the safety net that the app started', () => {
  assert.match(read('src/main.js'), /document\.documentElement\.dataset\.app = 'ready';\s*$/);
  assert.ok(html.indexOf(safetyNet) < html.indexOf('src="src/main.js"'), 'the safety net loads before the app');
});

test('a running app is left alone', async () => {
  const calls = await loadPage({ ready: true });
  assert.deepEqual(calls, { fetched: [], unregistered: 0, deleted: [], reloads: 0 });
});

test('if the app failed to start, fresh files are fetched and the page reloads once', async () => {
  const session = new Map();
  const calls = await loadPage({ session });
  assert.deepEqual(calls.fetched, [
    [`${ORIGIN}/mahjong/src/core/game.js`, 'reload'],
    [`${ORIGIN}/mahjong/src/core/generator.js`, 'reload'],
  ]);
  assert.equal(calls.unregistered, 1);
  assert.deepEqual(calls.deleted, ['rh-mahjong-solitaire-precache-A', 'rh-mahjong-solitaire-fonts'], "other apps' caches are kept");
  assert.equal(calls.reloads, 1);

  // Still broken after the reload: stop instead of reloading forever.
  assert.equal((await loadPage({ session })).reloads, 0);
});
