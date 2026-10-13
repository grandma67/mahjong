/**
 * Auto-solver: searches for an order that removes every tile left on the
 * board, with the faces as they are now (no shuffling).
 *
 * Depth-first search over the set of tiles still present, with:
 *  - Safe moves: when every remaining tile of a match group is free, taking
 *    them all can never hurt (removing tiles only frees others), so the
 *    search takes them without branching.
 *  - Dead-end pruning: a tile buried under every other remaining tile of its
 *    match group (say the last two of a kind stacked) can never be matched.
 *  - Memo of positions already proven unsolvable (Zobrist hash of the tiles
 *    present), so transpositions are explored once.
 *  - Restarts: a depth-first search can sink a long time into one hopeless
 *    branch, so each run gets a node budget, and the next run (with a larger
 *    budget) breaks ties between equally good moves at random. Proven dead
 *    positions stay in the memo across runs.
 *  - A deadline, so a hard position gives up instead of hanging.
 *
 * No DOM access: it runs inside a Web Worker (solverWorker.js) and in tests.
 */
import { isFree } from './board.js';
import { getFace } from './tiles.js';
import { createRng } from './rng.js';

export const SOLVE = Object.freeze({ SOLVED: 'solved', UNSOLVABLE: 'unsolvable', TIMEOUT: 'timeout' });

const TIMED_OUT = Symbol('timeout');
const RESTART = Symbol('restart');
const CHECK_EVERY = 512; // nodes between deadline checks
const FIRST_BUDGET = 4000; // nodes in the first run; each restart allows 1.5x more

/** Deterministic 32-bit random numbers for the Zobrist hash. */
function hashKeys(n, seed) {
  let s = seed >>> 0 || 1;
  const keys = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    keys[i] = s;
  }
  return keys;
}

/**
 * @param {Array} geometry   from buildGeometry
 * @param {Array<string|null>} tiles  face id per slot, null when removed
 * @param {{deadline?:number, now?:()=>number, onProgress?:(nodes:number)=>void}} [opts]
 * @returns {{status:'solved', moves:Array<[number,number]>, nodes:number} | {status:'unsolvable'|'timeout', nodes:number}}
 */
export function solve(geometry, tiles, { deadline = Infinity, now = Date.now, onProgress } = {}) {
  const n = tiles.length;
  const present = Uint8Array.from(tiles, (t) => (t != null ? 1 : 0));
  const occupied = (i) => present[i] === 1;

  // Match groups as small integers, and how many tiles of each are left.
  const groupIds = new Map();
  const group = Int32Array.from(tiles, (t) => {
    if (t == null) return -1;
    const key = getFace(t).matchGroup;
    if (!groupIds.has(key)) groupIds.set(key, groupIds.size);
    return groupIds.get(key);
  });
  const remaining = new Int32Array(groupIds.size);
  for (let i = 0; i < n; i++) if (group[i] >= 0) remaining[group[i]]++;
  if (remaining.some((c) => c % 2)) return { status: SOLVE.UNSOLVABLE, nodes: 0 };

  // The slots each tile covers or flanks: freeing those first opens the board up.
  const blocking = geometry.map(() => []);
  geometry.forEach((g, j) => {
    for (const i of [...g.above, ...g.above, ...g.left, ...g.right]) blocking[i].push(j); // a tile on top counts double
  });
  const blocks = (i) => {
    let count = 0;
    for (const j of blocking[i]) count += present[j];
    return count;
  };

  const keysA = hashKeys(n, 0x9e3779b9);
  const keysB = hashKeys(n, 0x85ebca6b);
  let hA = 0;
  let hB = 0;
  let left = 0;
  for (let i = 0; i < n; i++) {
    if (!present[i]) continue;
    hA ^= keysA[i];
    hB ^= keysB[i];
    left++;
  }
  const failed = new Set();
  const stateKey = () => (hA >>> 0) * 0x200000 + (hB & 0x1fffff);

  const toggle = (i) => {
    present[i] ^= 1;
    hA ^= keysA[i];
    hB ^= keysB[i];
  };
  const take = ([a, b]) => {
    toggle(a); toggle(b);
    remaining[group[a]] -= 2;
    left -= 2;
  };
  const putBack = ([a, b]) => {
    toggle(a); toggle(b);
    remaining[group[a]] += 2;
    left += 2;
  };

  // Every slot that lies on top of each slot, directly or through other tiles.
  const coverers = geometry.map((_, i) => {
    const seen = new Set();
    const stack = [i];
    while (stack.length) {
      for (const j of geometry[stack.pop()].above) {
        if (!seen.has(j)) { seen.add(j); stack.push(j); }
      }
    }
    return [...seen];
  });
  const members = Array.from(remaining, () => []);
  for (let i = 0; i < n; i++) if (group[i] >= 0) members[group[i]].push(i);

  /**
   * True if a tile of group g lies under every other tile of g still on the
   * board: it can only be freed once they are gone, so it can never be matched.
   */
  const buried = (g) => {
    const need = remaining[g] - 1;
    if (need <= 0) return false;
    for (const x of members[g]) {
      if (!present[x]) continue;
      let count = 0;
      for (const c of coverers[x]) if (present[c] && group[c] === g) count++;
      if (count >= need) return true;
    }
    return false;
  };

  let path = [];
  let nodes = 0;
  if (members.some((_, g) => buried(g))) return { status: SOLVE.UNSOLVABLE, nodes };

  const rng = createRng(left);
  let noise = 0; // random tie-breaking, off in the first run
  let budget = FIRST_BUDGET;
  let runNodes = 0;

  function search() {
    if (left === 0) return true;
    nodes++;
    if (++runNodes > budget) throw RESTART;
    if (nodes % CHECK_EVERY === 1) {
      if (now() > deadline) throw TIMED_OUT;
      onProgress?.(nodes);
    }
    const key = stateKey();
    if (failed.has(key)) return false;

    // Free tiles, bucketed by match group.
    const freeBy = new Map();
    for (let i = 0; i < n; i++) {
      if (!present[i] || !isFree(geometry, i, occupied)) continue;
      const g = group[i];
      if (!freeBy.has(g)) freeBy.set(g, []);
      freeBy.get(g).push(i);
    }

    // Safe move: every remaining tile of a group is free, so take them all.
    for (const [g, free] of freeBy) {
      if (free.length !== remaining[g]) continue;
      const pairs = [];
      for (let k = 0; k < free.length; k += 2) pairs.push([free[k], free[k + 1]]);
      pairs.forEach(take);
      path.push(...pairs);
      if (search()) return true;
      path.length -= pairs.length;
      pairs.reverse().forEach(putBack);
      failed.add(key);
      return false;
    }

    const moves = [];
    for (const free of freeBy.values()) {
      for (let x = 0; x < free.length; x++) {
        for (let y = x + 1; y < free.length; y++) moves.push([free[x], free[y]]);
      }
    }
    const score = (m) => blocks(m[0]) + blocks(m[1]) + rng.next() * noise;
    const ranked = moves.map((m) => ({ m, s: score(m) })).sort((a, b) => b.s - a.s);

    for (const { m: move } of ranked) {
      take(move);
      if (!buried(group[move[0]])) {
        path.push(move);
        if (search()) return true;
        path.pop();
      }
      putBack(move);
    }
    failed.add(key);
    return false;
  }

  const start = { present: present.slice(), remaining: remaining.slice(), hA, hB, left };
  for (;;) {
    try {
      return search() ? { status: SOLVE.SOLVED, moves: path, nodes } : { status: SOLVE.UNSOLVABLE, nodes };
    } catch (e) {
      if (e === TIMED_OUT) return { status: SOLVE.TIMEOUT, nodes };
      if (e !== RESTART) throw e;
    }
    // The aborted run left tiles removed: put the board back as it started.
    present.set(start.present);
    remaining.set(start.remaining);
    ({ hA, hB, left } = start);
    path = [];
    runNodes = 0;
    budget = Math.round(budget * 1.5);
    noise = 3;
  }
}
