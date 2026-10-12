import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, STATUS } from '../src/core/game.js';
import { LAYOUTS, getLayout } from '../src/core/layouts.js';
import { facesMatch, fullSet } from '../src/core/tiles.js';

/** Plays a game to the end by always taking the first hint. */
function autoplay(game) {
  let guard = 1000;
  while (game.status === STATUS.PLAYING && guard--) {
    const [a, b] = game.hint();
    game.select(a);
    assert.equal(game.select(b).type, 'match');
  }
  return game.status;
}

test('same seed produces the same deal', () => {
  const a = new Game(getLayout('turtle'), 42);
  const b = new Game(getLayout('turtle'), 42);
  assert.deepEqual(a.tiles, b.tiles);
  assert.notDeepEqual(a.tiles, new Game(getLayout('turtle'), 43).tiles);
});

test('turtle deal uses exactly the full 144-tile set', () => {
  const g = new Game(getLayout('turtle'), 1);
  assert.deepEqual([...g.tiles].sort(), fullSet().sort());
});

for (const layout of LAYOUTS) {
  test(`deals for "${layout.id}" are generated solvable`, () => {
    for (let seed = 1; seed <= 25; seed++) {
      const g = new Game(layout, seed);
      assert.ok(g.solvable, `seed ${seed} fell back to a random deal`);
      assert.equal(g.status, STATUS.PLAYING);
    }
  });
}

test('selecting blocked, matching and mismatching tiles', () => {
  const g = new Game(getLayout('pyramid'), 5);
  const blocked = g.slots.find((s) => !g.isFree(s.index));
  assert.equal(g.select(blocked.index).type, 'blocked');

  const [a, b] = g.availableMatches()[0];
  assert.equal(g.select(a).type, 'select');
  assert.equal(g.select(a).type, 'deselect');
  g.select(a);
  assert.equal(g.select(b).type, 'match');
  assert.equal(g.tilesLeft, g.slots.length - 2);

  const free = g.freeIndices();
  const pairOff = free.find((i) => free.some((j) => j !== i && !facesMatch(g.tiles[i], g.tiles[j])));
  const other = free.find((j) => j !== pairOff && !facesMatch(g.tiles[pairOff], g.tiles[j]));
  g.select(pairOff);
  assert.equal(g.select(other).type, 'mismatch');
  assert.equal(g.selected, other);
});

test('undo restores matches and shuffles', () => {
  const g = new Game(getLayout('turtle'), 9);
  const original = [...g.tiles];
  const [a, b] = g.hint();
  g.select(a); g.select(b);
  const afterMatch = [...g.tiles];
  g.shuffle();
  assert.equal(g.tilesLeft, 142);
  g.undo();
  assert.deepEqual(g.tiles, afterMatch);
  g.undo();
  assert.deepEqual(g.tiles, original);
  assert.equal(g.undo(), null);
});

test('shuffle keeps the same multiset of tiles', () => {
  const g = new Game(getLayout('fortress'), 3);
  const before = g.tiles.filter(Boolean).sort();
  g.shuffle();
  assert.deepEqual(g.tiles.filter(Boolean).sort(), before);
});

test('a game can be played to completion with hints + shuffles', () => {
  for (const layout of LAYOUTS) {
    const g = new Game(layout, 11);
    let rounds = 0;
    while (autoplay(g) === STATUS.STUCK && rounds++ < 20) g.shuffle();
    assert.equal(g.status, STATUS.WON, `${layout.id} should be finishable`);
    assert.equal(g.tilesLeft, 0);
  }
});
