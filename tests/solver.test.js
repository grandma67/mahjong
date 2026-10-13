import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, SOLVE } from '../src/core/solver.js';
import { buildGeometry, isFree } from '../src/core/board.js';
import { Game } from '../src/core/game.js';
import { getLayout } from '../src/core/layouts.js';
import { facesMatch } from '../src/core/tiles.js';

/** Plays `moves` on a copy of `tiles`, checking each one is legal; returns what is left. */
function replay(geometry, tiles, moves) {
  const board = [...tiles];
  const occupied = (i) => board[i] != null;
  for (const [a, b] of moves) {
    assert.ok(occupied(a) && occupied(b), `move ${a},${b} takes a removed tile`);
    assert.ok(isFree(geometry, a, occupied) && isFree(geometry, b, occupied), `move ${a},${b} takes a blocked tile`);
    assert.ok(facesMatch(board[a], board[b]), `move ${a},${b} pairs tiles that don't match`);
    board[a] = board[b] = null;
  }
  return board.filter((t) => t != null);
}

/** A tiny board from [x, y, z] positions in half-tile units. */
function board(positions) {
  return buildGeometry(positions.map(([x, y, z], index) => ({ index, x, y, z })));
}

for (const id of ['owl', 'rhombus', 'castle', 'ziggurat']) {
  test(`solves fresh "${id}" deals with legal moves that clear the board`, () => {
    for (let seed = 1; seed <= 3; seed++) {
      const game = new Game(getLayout(id), seed);
      const result = solve(game.geometry, game.tiles, { deadline: Date.now() + 10_000 });
      assert.equal(result.status, SOLVE.SOLVED, `seed ${seed}`);
      assert.deepEqual(replay(game.geometry, game.tiles, result.moves), [], `seed ${seed}`);
    }
  });
}

test('solves a game already in progress without touching the game', () => {
  const game = new Game(getLayout('owl'), 7);
  for (let k = 0; k < 5; k++) game.removePair(...game.hint());
  const before = [...game.tiles];
  const result = solve(game.geometry, game.tiles);
  assert.equal(result.status, SOLVE.SOLVED);
  assert.deepEqual(game.tiles, before);
  assert.deepEqual(replay(game.geometry, game.tiles, result.moves), []);
});

test('an empty board is already solved', () => {
  const geometry = board([[0, 0, 0], [2, 0, 0]]);
  assert.deepEqual(solve(geometry, [null, null]).moves, []);
});

test('the last two of a kind stacked on each other can never be matched', () => {
  const geometry = board([[0, 0, 0], [0, 0, 1], [4, 0, 0], [6, 0, 0]]);
  const result = solve(geometry, ['dots-1', 'dots-1', 'dots-2', 'dots-2']);
  assert.equal(result.status, SOLVE.UNSOLVABLE);
});

test('a crossed row is unsolvable even though a pair is free at first', () => {
  // Row A B A B: only the ends are free and they never match. The C pair is free but doesn't help.
  const geometry = board([[0, 0, 0], [2, 0, 0], [4, 0, 0], [6, 0, 0], [0, 4, 0], [2, 4, 0]]);
  const tiles = ['dots-1', 'dots-2', 'dots-1', 'dots-2', 'dots-3', 'dots-3'];
  assert.equal(solve(geometry, tiles).status, SOLVE.UNSOLVABLE);
  // Row A B B A peels from the outside in.
  const fixed = ['dots-1', 'dots-2', 'dots-2', 'dots-1', 'dots-3', 'dots-3'];
  const result = solve(geometry, fixed);
  assert.equal(result.status, SOLVE.SOLVED);
  assert.deepEqual(replay(geometry, fixed, result.moves), []);
});

test('gives up once the deadline has passed', () => {
  const game = new Game(getLayout('owl'), 3);
  const result = solve(game.geometry, game.tiles, { deadline: 0 });
  assert.equal(result.status, SOLVE.TIMEOUT);
});

test('reports progress while searching', () => {
  const game = new Game(getLayout('volcano'), 2);
  const seen = [];
  solve(game.geometry, game.tiles, { onProgress: (nodes) => seen.push(nodes) });
  assert.ok(seen.length > 0);
  assert.ok(seen.every((n, i) => i === 0 || n > seen[i - 1]));
});
