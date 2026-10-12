import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deal, pairUp } from '../src/core/generator.js';
import { buildGeometry, isFree } from '../src/core/board.js';
import { LAYOUTS } from '../src/core/layouts.js';
import { facesMatch } from '../src/core/tiles.js';
import { createRng } from '../src/core/rng.js';

/**
 * With every pair given a unique label, a tile can only ever match its own
 * partner, and removing a pair only frees tiles. So greedily removing any
 * free pair clears the board exactly when the deal is solvable.
 */
function clearsGreedily(geometry, faces) {
  const left = new Map(faces);
  const has = (i) => left.has(i);
  while (left.size) {
    const free = [...left.keys()].filter((i) => isFree(geometry, i, has));
    const a = free.find((i) => free.some((j) => j !== i && left.get(j) === left.get(i)));
    if (a == null) return false;
    const b = free.find((j) => j !== a && left.get(j) === left.get(a));
    left.delete(a);
    left.delete(b);
  }
  return true;
}

for (const layout of LAYOUTS) {
  test(`deals for "${layout.id}" really can be cleared`, () => {
    const geometry = buildGeometry(layout.slots);
    const indices = layout.slots.map((s) => s.index);
    const pairs = Array.from({ length: indices.length / 2 }, (_, k) => [`p${k}`, `p${k}`]);
    for (let seed = 1; seed <= 10; seed++) {
      const { faces, solvable } = deal(geometry, indices, pairs, createRng(seed));
      assert.ok(solvable);
      assert.deepEqual([...faces.keys()].sort((a, b) => a - b), indices);
      assert.ok(clearsGreedily(geometry, faces), `seed ${seed} is not clearable`);
    }
  });
}

test('deal can fill a subset of slots (reshuffle of the remaining tiles)', () => {
  const layout = LAYOUTS.find((l) => l.id === 'pyramid');
  const geometry = buildGeometry(layout.slots);
  // Keep the bottom layer only: removing upper layers first is always legal.
  const indices = layout.slots.filter((s) => s.z === 0).map((s) => s.index);
  const pairs = Array.from({ length: indices.length / 2 }, (_, k) => [`p${k}`, `p${k}`]);
  const { faces, solvable } = deal(geometry, indices, pairs, createRng(3));
  assert.ok(solvable);
  assert.equal(faces.size, indices.length);
  assert.ok(clearsGreedily(geometry, faces));
});

test('deal falls back to a random deal when no solution exists', () => {
  // Two stacked tiles: only the top one is ever free, so no pair can be removed.
  const slots = [{ x: 0, y: 0, z: 0, index: 0 }, { x: 0, y: 0, z: 1, index: 1 }];
  const { faces, solvable } = deal(buildGeometry(slots), [0, 1], [['a', 'b']], createRng(1));
  assert.equal(solvable, false);
  assert.deepEqual([...faces.values()].sort(), ['a', 'b']);
});

test('deal rejects a pair count that does not fit the slots', () => {
  const slots = [{ x: 0, y: 0, z: 0, index: 0 }, { x: 2, y: 0, z: 0, index: 1 }];
  assert.throws(() => deal(buildGeometry(slots), [0, 1], [], createRng(1)), /Need 1 pairs, got 0/);
});

test('pairUp pairs by match group, so mixed flowers and seasons pair up', () => {
  const ids = ['flower-plum', 'dots-1', 'season-spring', 'flower-orchid', 'dots-1', 'season-winter'];
  const pairs = pairUp(ids);
  assert.equal(pairs.length, 3);
  for (const [a, b] of pairs) assert.ok(facesMatch(a, b), `${a} / ${b}`);
  assert.deepEqual(pairs.flat().sort(), [...ids].sort());
});

test('pairUp rejects an odd group', () => {
  assert.throws(() => pairUp(['dots-1', 'dots-1', 'dots-2']), /Odd number of tiles in group dots-2/);
});
