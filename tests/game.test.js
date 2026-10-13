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
  const a = new Game(getLayout('owl'), 42);
  const b = new Game(getLayout('owl'), 42);
  assert.deepEqual(a.tiles, b.tiles);
  assert.notDeepEqual(a.tiles, new Game(getLayout('owl'), 43).tiles);
});

test('owl deal uses exactly the full 144-tile set', () => {
  const g = new Game(getLayout('owl'), 1);
  assert.deepEqual([...g.tiles].sort(), fullSet().sort());
});

const DOUBLE_LAYOUTS = LAYOUTS.filter((l) => l.slots.length === 288);

test('there are 288-tile layouts to deal', () => {
  assert.deepEqual(DOUBLE_LAYOUTS.map((l) => l.id).sort(), ['temple', 'volcano', 'wall', 'ziggurat']);
});

for (const layout of DOUBLE_LAYOUTS) {
  test(`"${layout.id}" deals exactly two full 144-tile sets`, () => {
    const twoSets = [...fullSet(), ...fullSet()].sort();
    for (let seed = 1; seed <= 5; seed++) {
      const g = new Game(layout, seed);
      assert.equal(g.tilesLeft, 288);
      assert.deepEqual([...g.tiles].sort(), twoSets, `seed ${seed}`);
    }
  });
}

for (const layout of DOUBLE_LAYOUTS) {
  test(`a 288-tile "${layout.id}" board can be finished by following its hints, and shuffled midway`, () => {
    const g = new Game(layout, 5);
    for (let k = 0; k < 40; k++) {
      const [a, b] = g.hint();
      g.select(a);
      assert.equal(g.select(b).type, 'match');
    }
    // With eight of every flower and season left to pair up, a shuffle must
    // still keep the same tiles and leave a board that can be cleared.
    const before = g.tiles.filter(Boolean).sort();
    g.shuffle();
    assert.deepEqual(g.tiles.filter(Boolean).sort(), before);
    assert.ok(g.canBeCleared());

    let rounds = 0;
    while (autoplay(g) === STATUS.STUCK && rounds++ < 30) {
      while (!g.canBeCleared()) g.undo();
      g.shuffle();
    }
    assert.equal(g.status, STATUS.WON);
    assert.equal(g.matchesMade, 144);
  });
}

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
  const g = new Game(getLayout('owl'), 9);
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

test('every layout can be finished with hints, shuffles and undo', () => {
  for (const layout of LAYOUTS) {
    for (const seed of [8, 9, 11]) {
      const g = new Game(layout, seed);
      let rounds = 0;
      while (autoplay(g) === STATUS.STUCK && rounds++ < 30) {
        // A dead end (e.g. the last two tiles stacked) needs an undo first.
        while (!g.canBeCleared()) g.undo();
        g.shuffle();
      }
      assert.equal(g.status, STATUS.WON, `${layout.id} #${seed} should be finishable`);
    }
  }
});

/** Two free tiles in a row, then a two-tile stack, all with the same face. */
const ROW_AND_STACK = {
  id: 'row-and-stack',
  name: 'Row and stack',
  slots: [{ x: 4, y: 0, z: 0 }, { x: 6, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }]
    .map((s, index) => ({ ...s, index })),
};

test('a board whose last tiles are stacked is a dead end', () => {
  const g = new Game(ROW_AND_STACK, 1);
  g.tiles = g.tiles.map(() => 'dots-1');
  assert.ok(g.canBeCleared());
  g.removePair(0, 1);
  assert.equal(g.status, STATUS.STUCK);
  assert.equal(g.canBeCleared(), false, 'only the top tile of the stack is ever free');
});

test('hint never leads into a dead end when another pair avoids it', () => {
  const g = new Game(ROW_AND_STACK, 1);
  g.tiles = g.tiles.map(() => 'dots-1');
  // Taking the two row tiles first would strand the stack; the hint must use the stack's top tile.
  assert.ok(g.hint().includes(3));
});

/** Four tiles in a row: only the two ends are ever free. */
const ROW_OF_FOUR = {
  id: 'row',
  name: 'Row',
  slots: [0, 2, 4, 6].map((x, index) => ({ x, y: 0, z: 0, index })),
};

test('status is STUCK when no free tiles match, and hint returns null', () => {
  const g = new Game(ROW_OF_FOUR, 1);
  g.tiles = ['dots-1', 'dots-2', 'dots-1', 'dots-2'];
  assert.deepEqual(g.freeIndices(), [0, 3]);
  assert.equal(g.status, STATUS.STUCK);
  assert.equal(g.hint(), null);
  assert.equal(g.hintsUsed, 0, 'a failed hint is not counted');
});

test('shuffling a stuck board makes it playable again', () => {
  const g = new Game(ROW_OF_FOUR, 1);
  g.tiles = ['dots-1', 'dots-2', 'dots-1', 'dots-2'];
  g.select(0);
  assert.ok(g.shuffle());
  assert.equal(g.status, STATUS.PLAYING);
  assert.equal(g.selected, null, 'shuffle clears the selection');
  assert.equal(g.shuffles, 1);
  assert.deepEqual([...g.tiles].sort(), ['dots-1', 'dots-1', 'dots-2', 'dots-2']);
});

test('shuffle does nothing on an empty board', () => {
  const g = new Game(ROW_OF_FOUR, 1);
  g.tiles = [null, null, null, null];
  assert.equal(g.status, STATUS.WON);
  assert.equal(g.shuffle(), false);
  assert.equal(g.history.length, 0);
  assert.equal(g.shuffles, 0);
});

test('hint returns a playable pair and counts its use', () => {
  const g = new Game(getLayout('owl'), 21);
  const [a, b] = g.hint();
  assert.ok(g.isFree(a) && g.isFree(b) && a !== b);
  assert.ok(facesMatch(g.tiles[a], g.tiles[b]));
  g.hint();
  assert.equal(g.hintsUsed, 2);
});

test('clicking an already removed tile is ignored', () => {
  const g = new Game(getLayout('garden'), 2);
  const [a, b] = g.availableMatches()[0];
  g.select(a);
  g.select(b);
  assert.equal(g.select(a).type, 'ignored');
  assert.equal(g.selected, null);
});

test('matchesMade counts matches only and undo clears the selection', () => {
  const g = new Game(getLayout('garden'), 4);
  const [a, b] = g.availableMatches()[0];
  g.select(a); g.select(b);
  g.shuffle();
  assert.equal(g.matchesMade, 1);
  assert.equal(g.history.length, 2);
  g.select(g.freeIndices()[0]);
  g.undo();
  assert.equal(g.selected, null);
  g.undo();
  assert.equal(g.matchesMade, 0);
  assert.equal(g.tilesLeft, g.slots.length);
});

test('restarting with the same seed replays the same deal after moves and shuffles', () => {
  const g = new Game(getLayout('cross'), 77);
  const original = [...g.tiles];
  const [a, b] = g.hint();
  g.select(a); g.select(b);
  g.shuffle();
  assert.deepEqual(new Game(getLayout('cross'), 77).tiles, original);
});
