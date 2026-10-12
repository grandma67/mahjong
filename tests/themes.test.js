import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, getTheme } from '../src/ui/themes.js';

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
