import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THEMES, getTheme, themeStyle, applyTheme } from '../src/ui/themes.js';

test('at least six themes with unique ids', () => {
  assert.ok(THEMES.length >= 6);
  assert.equal(new Set(THEMES.map((t) => t.id)).size, THEMES.length);
});

test('every theme defines the same token set', () => {
  const keys = Object.keys(THEMES[0].tokens).sort();
  for (const t of THEMES) assert.deepEqual(Object.keys(t.tokens).sort(), keys, t.id);
});

test('unknown theme falls back to default', () => {
  assert.equal(getTheme('missing').id, 'jade');
});

test('every theme uses a known face set and color scheme', () => {
  for (const t of THEMES) {
    assert.ok(['traditional', 'emoji'].includes(t.faceSet), `${t.id}: ${t.faceSet}`);
    assert.ok(['light', 'dark'].includes(t.scheme), `${t.id}: ${t.scheme}`);
    assert.ok(t.name, t.id);
  }
});

test('every theme token is used by the stylesheet', () => {
  const css = readFileSync(new URL('../css/main.css', import.meta.url), 'utf8');
  for (const key of Object.keys(THEMES[0].tokens)) assert.ok(css.includes(`var(--${key}`), `--${key} is unused`);
});

test('themeStyle turns tokens into CSS custom properties', () => {
  const style = themeStyle(getTheme('jade'));
  assert.match(style, /^--bg:radial-gradient/);
  assert.ok(style.includes(';--accent:#e7c76a;'));
  assert.equal(style.split(';').length, Object.keys(getTheme('jade').tokens).length);
});

test('applyTheme sets tokens, theme id, color scheme and the theme-color meta', (t) => {
  const props = new Map();
  const root = { style: { setProperty: (k, v) => props.set(k, v) }, dataset: {} };
  let metaContent;
  const meta = { setAttribute: (name, v) => { if (name === 'content') metaContent = v; } };
  globalThis.document = { querySelector: (sel) => (sel === 'meta[name="theme-color"]' ? meta : null) };
  t.after(() => delete globalThis.document);

  const sakura = getTheme('sakura');
  applyTheme(sakura, root);
  assert.equal(props.get('--accent'), sakura.tokens.accent);
  assert.equal(props.size, Object.keys(sakura.tokens).length);
  assert.equal(root.dataset.theme, 'sakura');
  assert.equal(root.style.colorScheme, 'light');
  assert.equal(metaContent, sakura.tokens['panel-solid']);
});
