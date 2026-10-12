import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPrefs, savePrefs } from '../src/ui/storage.js';

const KEY = 'rh-mahjong-solitaire:prefs:v1';
let store;

function installStorage(impl) {
  Object.defineProperty(globalThis, 'localStorage', { value: impl, configurable: true, writable: true });
}

beforeEach(() => {
  store = new Map();
  installStorage({
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  });
});

test('defaults when nothing is stored', () => {
  const prefs = loadPrefs();
  assert.deepEqual(prefs, {
    themeId: null, layoutId: null, highlightFree: true, showIndex: false, bestTimes: {}, seenHelp: false,
  });
  prefs.bestTimes.turtle = 1;
  assert.deepEqual(loadPrefs().bestTimes, {}, 'defaults are not shared between loads');
});

test('saved prefs round-trip and merge over defaults', () => {
  savePrefs({ themeId: 'neon', bestTimes: { turtle: 300 } });
  const prefs = loadPrefs();
  assert.equal(prefs.themeId, 'neon');
  assert.deepEqual(prefs.bestTimes, { turtle: 300 });
  assert.equal(prefs.highlightFree, true, 'missing keys come from defaults');
  assert.ok(store.has(KEY));
});

test('corrupt data falls back to defaults', () => {
  store.set(KEY, '{not json');
  assert.equal(loadPrefs().highlightFree, true);
});

test('unavailable storage never throws', () => {
  const boom = () => { throw new Error('SecurityError'); };
  installStorage({ getItem: boom, setItem: boom });
  assert.equal(loadPrefs().seenHelp, false);
  assert.doesNotThrow(() => savePrefs({ seenHelp: true }));
});
