import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));

const precache = JSON.parse(
  sw.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"').replace(/,\s*\]/, ']'),
);

function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    return statSync(join(root, rel)).isDirectory() ? walk(rel) : [rel];
  });
}

test('every precached file exists', () => {
  for (const url of precache.filter((u) => u !== './')) {
    assert.ok(existsSync(join(root, url)), `missing ${url}`);
  }
});

test('every app source file is precached (works offline)', () => {
  const required = [...walk('src'), ...walk('css'), ...walk('assets/icons'), 'index.html', 'manifest.webmanifest'];
  for (const file of required) assert.ok(precache.includes(file), `${file} is not in sw.js PRECACHE_URLS`);
});

test('manifest, caches and storage share one unique app id', () => {
  const appId = sw.match(/const APP_ID = '([^']+)'/)[1];
  assert.equal(manifest.id, appId);
  assert.match(readFileSync(join(root, 'src/ui/storage.js'), 'utf8'), new RegExp(`'${appId}:`));
  // Every cache name must be namespaced with the id.
  for (const [, name] of sw.matchAll(/const (?:PRECACHE|RUNTIME|FONTS) = `([^`]+)`/g)) {
    assert.ok(name.startsWith('${APP_ID}-'), name);
  }
  const code = sw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  assert.ok(!/\bcaches\.match\(/.test(code), 'use matchOwn(): global caches.match reads other apps\' caches');
});

test('manifest meets Chrome installability requirements', () => {
  assert.ok(manifest.name && manifest.short_name);
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display));
  const sizes = manifest.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'));
  assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'));
  for (const asset of [...manifest.icons, ...manifest.screenshots]) {
    assert.ok(existsSync(join(root, asset.src)), `missing ${asset.src}`);
  }
});
