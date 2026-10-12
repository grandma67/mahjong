import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('index.html');
const main = read('src/main.js');
const actionsBlock = main.match(/const ACTIONS = \{([\s\S]*?)\n\};/)[1];
const actions = [...actionsBlock.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);

test('every toolbar button has a handler and every handler a button', () => {
  const buttons = [...html.matchAll(/data-action="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual([...buttons].sort(), [...actions].sort());
});

test('keyboard shortcuts point at existing actions', () => {
  const keys = main.match(/\{ h: 'hint'[^}]*\}/)[0];
  for (const [, action] of keys.matchAll(/: '(\w+)'/g)) assert.ok(actions.includes(action), action);
});

test('every element main.js looks up by id exists in index.html', () => {
  for (const [, id] of main.matchAll(/\$\('#([\w-]+)'\)/g)) {
    assert.ok(html.includes(`id="${id}"`), `#${id} is missing from index.html`);
  }
});

test('the deploy workflow can stamp the service worker version', () => {
  assert.match(read('sw.js'), /const VERSION = 'dev'/);
  assert.ok(read('.github/workflows/pages.yml').includes("s/const VERSION = 'dev'/"));
});
