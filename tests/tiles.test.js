import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACES, fullSet, allPairs, facesMatch, pickPairs } from '../src/core/tiles.js';
import { createRng } from '../src/core/rng.js';

test('full set has 144 tiles and 42 distinct faces', () => {
  assert.equal(fullSet().length, 144);
  assert.equal(FACES.length, 42);
});

test('identical tiles match, different tiles do not', () => {
  assert.ok(facesMatch('dots-5', 'dots-5'));
  assert.ok(!facesMatch('dots-5', 'bamboo-5'));
  assert.ok(!facesMatch('wind-east', 'wind-west'));
});

test('any flower matches any flower, any season any season', () => {
  assert.ok(facesMatch('flower-plum', 'flower-orchid'));
  assert.ok(facesMatch('season-spring', 'season-winter'));
  assert.ok(!facesMatch('flower-plum', 'season-spring'));
});

test('allPairs yields 72 matching pairs covering the whole set', () => {
  const pairs = allPairs();
  assert.equal(pairs.length, 72);
  for (const [a, b] of pairs) assert.ok(facesMatch(a, b));
  assert.deepEqual(pairs.flat().sort(), fullSet().sort());
});

test('pickPairs returns the requested count, deterministic per seed', () => {
  assert.equal(pickPairs(30, createRng(1)).length, 30);
  assert.equal(pickPairs(90, createRng(1)).length, 90);
  assert.deepEqual(pickPairs(10, createRng(7)), pickPairs(10, createRng(7)));
});
