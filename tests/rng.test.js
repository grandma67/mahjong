import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, randomSeed } from '../src/core/rng.js';

test('same seed gives the same sequence, different seeds differ', () => {
  const seq = (seed) => Array.from({ length: 20 }, createRng(seed).next);
  assert.deepEqual(seq(123), seq(123));
  assert.notDeepEqual(seq(123), seq(124));
});

test('next() is in [0, 1) and int(max) is an integer in [0, max)', () => {
  const rng = createRng(5);
  for (let i = 0; i < 2000; i++) {
    const x = rng.next();
    assert.ok(x >= 0 && x < 1);
    const n = rng.int(7);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 7);
  }
});

test('shuffle permutes in place and is deterministic per seed', () => {
  const list = Array.from({ length: 50 }, (_, i) => i);
  const a = createRng(9).shuffle([...list]);
  const b = createRng(9).shuffle([...list]);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, list);
  assert.deepEqual([...a].sort((x, y) => x - y), list);
  const same = [1, 2, 3];
  assert.equal(createRng(1).shuffle(same), same, 'returns the same array');
});

test('randomSeed is a positive integer up to 1,000,000', () => {
  for (let i = 0; i < 200; i++) {
    const s = randomSeed();
    assert.ok(Number.isInteger(s) && s >= 1 && s <= 1_000_000);
  }
});
