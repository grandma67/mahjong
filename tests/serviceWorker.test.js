import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const SCOPE = 'https://user.github.io/mahjong/';
const abs = (req) => new URL(typeof req === 'string' ? req : req.url, SCOPE);

/** A fake GitHub Pages: every file's body names the deploy it came from, e.g. "src/core/game.js@A". */
function fakeNetwork() {
  const net = {
    deploy: 'A',
    online: true,
    fetch: async (req) => {
      if (!net.online) throw new TypeError('Failed to fetch');
      return new Response(`${abs(req).pathname.slice(new URL(SCOPE).pathname.length) || './'}@${net.deploy}`);
    },
  };
  return net;
}

/** Just enough of CacheStorage, shared by every worker version on the origin. */
function fakeCaches(net) {
  const store = new Map();
  const open = async (name) => {
    if (!store.has(name)) store.set(name, new Map());
    const files = store.get(name);
    const key = (req, ignoreSearch) => {
      const u = abs(req);
      if (ignoreSearch) u.search = '';
      return u.href;
    };
    return {
      match: async (req, opts = {}) => {
        const body = files.get(key(req, opts.ignoreSearch));
        return body === undefined ? undefined : new Response(body);
      },
      put: async (req, res) => files.set(key(req), await res.text()),
      addAll: async (reqs) => {
        for (const req of reqs) files.set(key(req), await (await net.fetch(req)).text());
      },
    };
  };
  return { open, keys: async () => [...store.keys()], delete: async (name) => store.delete(name) };
}

/** Runs sw.js as deploy `version` would ship it, then installs and activates it. */
async function startWorker(version, { caches, net }) {
  const listeners = {};
  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
    registration: { scope: SCOPE },
  };
  // Relative URLs resolve against the worker's folder, as in a browser.
  const WorkerRequest = class extends Request {
    constructor(url, init) { super(abs(url), init); }
  };
  const code = source.replace("const VERSION = 'dev'", `const VERSION = '${version}'`);
  vm.runInNewContext(code, { self, caches, fetch: net.fetch, Request: WorkerRequest, Response, URL, console });

  const lifecycle = async (type) => {
    const waits = [];
    listeners[type]({ waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);
  };
  await lifecycle('install');
  await lifecycle('activate');

  const background = [];
  return {
    /** Fetches `path` through the worker and also lets its background work finish. */
    async get(path, mode = 'no-cors') {
      let response;
      listeners.fetch({
        request: { url: abs(path).href, method: 'GET', mode },
        respondWith: (p) => { response = p; },
        waitUntil: (p) => background.push(p),
      });
      const body = await (await response).text();
      await Promise.allSettled(background);
      return body;
    },
  };
}

test('a page and its modules always come from one deploy, even after a new one goes live', async () => {
  const net = fakeNetwork();
  const caches = fakeCaches(net);
  const worker = await startWorker('A', { caches, net });

  // Deploy B goes live while worker A still runs the page. Mixing B's game.js
  // with A's generator.js broke the module import and left the board empty.
  net.deploy = 'B';
  const visits = [];
  for (let i = 0; i < 3; i++) {
    visits.push([
      await worker.get('./', 'navigate'),
      await worker.get('src/main.js'),
      await worker.get('src/core/game.js'),
      await worker.get('src/core/generator.js'),
    ]);
  }
  for (const files of visits) {
    assert.deepEqual(files.map((f) => f.split('@')[1]), ['A', 'A', 'A', 'A'], files.join(', '));
  }

  // The browser then installs deploy B's worker: everything switches together.
  const next = await startWorker('B', { caches, net });
  const files = [
    await next.get('./', 'navigate'),
    await next.get('src/core/game.js'),
    await next.get('src/core/generator.js'),
  ];
  assert.deepEqual(files.map((f) => f.split('@')[1]), ['B', 'B', 'B']);
  assert.ok(!(await caches.keys()).some((k) => k.endsWith('-A')), 'deploy A caches were deleted');
});

test('offline, any page URL in scope opens the cached game', async () => {
  const net = fakeNetwork();
  const worker = await startWorker('A', { caches: fakeCaches(net), net });
  net.online = false;
  assert.equal(await worker.get('./?source=pwa', 'navigate'), './@A');
  assert.equal(await worker.get('src/core/game.js'), 'src/core/game.js@A');
});
