/**
 * Service worker: makes the game installable and playable offline.
 *
 * The app is hosted on a shared origin (<user>.github.io), and caches are
 * per origin, not per app. So every cache name starts with APP_ID, and this
 * worker only ever reads or deletes its own caches. It never calls the global
 * caches.match(), which would also search other apps' caches.
 *
 * Strategy:
 *  - App files (the page and every module) are precached on install and
 *    always served from that precache, so the game works offline and every
 *    file comes from the same deploy. Refreshing files one by one could mix
 *    two deploys, and an ES module importing a name an older file lacks
 *    stops the whole app (no tiles at all). A deploy changes this file,
 *    which installs a new worker with a fresh precache; the next launch
 *    uses it.
 *  - Google Fonts: cache first, since font URLs are immutable.
 */
const APP_ID = 'rh-mahjong-solitaire';
const VERSION = 'dev'; // replaced with the commit SHA by the deploy workflow
const PRECACHE = `${APP_ID}-precache-${VERSION}`; // one deploy's app files
const FONTS = `${APP_ID}-fonts`; // survives deploys: font files never change
const OWN_CACHES = [PRECACHE, FONTS];

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/main.css',
  'src/main.js',
  'src/pwa.js',
  'src/core/board.js',
  'src/core/game.js',
  'src/core/generator.js',
  'src/core/layouts.js',
  'src/core/rng.js',
  'src/core/tiles.js',
  'src/ui/boardView.js',
  'src/ui/storage.js',
  'src/ui/themes.js',
  'src/ui/timer.js',
  'src/ui/sound.js',
  'src/ui/ambience.js',
  'src/ui/faces/emoji.js',
  'src/ui/faces/index.js',
  'src/ui/faces/svg.js',
  'src/ui/faces/traditional.js',
  'assets/icons/icon.svg',
  'assets/icons/icon-maskable.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(`${APP_ID}-`) && !OWN_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Looks a request up in this app's caches only. */
async function matchOwn(request, options) {
  for (const name of OWN_CACHES) {
    const hit = await (await caches.open(name)).match(request, options);
    if (hit) return hit;
  }
  return undefined;
}

async function store(cacheName, request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

/** Serves an app file from this deploy's precache; the network is only a fallback. */
async function fromPrecache(request) {
  const cache = await caches.open(PRECACHE);
  if (request.mode === 'navigate') {
    // Any page URL in scope is the app shell; the hash never reaches the worker.
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match('./')) ?? fetch(request);
  }
  return (await cache.match(request)) ?? fetch(request);
}

async function cacheFirst(request) {
  return (await matchOwn(request)) ?? store(FONTS, request, await fetch(request));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
  } else if (request.url.startsWith(self.registration.scope)) {
    event.respondWith(fromPrecache(request));
  }
});
