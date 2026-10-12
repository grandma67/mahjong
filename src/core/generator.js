/**
 * Generates deals that are guaranteed to be solvable.
 *
 * Simulate a game on the empty layout: repeatedly remove two random slots
 * that are free under the solitaire rules, and record the order. Give each
 * recorded pair the faces of one matching pair. Playing the recorded order
 * forward is then a valid solution.
 *
 * A random simulation can occasionally dead-end, for example when only one
 * free slot is left. In that case it simply retries. If every attempt fails,
 * it falls back to a random (possibly unsolvable) deal so the game never
 * hangs.
 */
import { isFree } from './board.js';
import { getFace } from './tiles.js';

const MAX_ATTEMPTS = 500;

/** Tries to find a removal order of `indices` as pairs of simultaneously free slots. */
function findRemovalOrder(geometry, indices, rng) {
  const occupied = new Set(indices);
  const has = (i) => occupied.has(i);
  const order = [];
  while (occupied.size > 0) {
    const free = [...occupied].filter((i) => isFree(geometry, i, has));
    if (free.length < 2) return null;
    const a = free.splice(rng.int(free.length), 1)[0];
    const b = free[rng.int(free.length)];
    occupied.delete(a);
    occupied.delete(b);
    order.push([a, b]);
  }
  return order;
}

/**
 * Whether the slots in `indices` can all be removed in pairs, whatever their
 * faces. False means the shape itself is a dead end (for example the last two
 * tiles stacked on top of each other), so no shuffle can help.
 */
export function canClear(geometry, indices, rng, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    if (findRemovalOrder(geometry, indices, rng)) return true;
  }
  return false;
}

/**
 * @param {Array} geometry   from buildGeometry
 * @param {number[]} indices slot indices to fill (all slots, or the remaining ones on reshuffle)
 * @param {Array<[string,string]>} pairs matching face pairs, one per two indices
 * @param {object} rng
 * @returns {{ faces: Map<number,string>, solvable: boolean }}
 */
export function deal(geometry, indices, pairs, rng) {
  if (indices.length !== pairs.length * 2) {
    throw new Error(`Need ${indices.length / 2} pairs, got ${pairs.length}`);
  }
  const shuffledPairs = rng.shuffle(pairs.map((p) => [...p]));
  const faces = new Map();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const order = findRemovalOrder(geometry, indices, rng);
    if (!order) continue;
    order.forEach(([a, b], i) => {
      faces.set(a, shuffledPairs[i][0]);
      faces.set(b, shuffledPairs[i][1]);
    });
    return { faces, solvable: true };
  }

  const ids = rng.shuffle(shuffledPairs.flat());
  indices.forEach((slot, i) => faces.set(slot, ids[i]));
  return { faces, solvable: false };
}

/** Groups face ids into matching pairs, e.g. to reshuffle the tiles left on the board. */
export function pairUp(faceIds) {
  const groups = new Map();
  for (const id of faceIds) {
    const key = getFace(id).matchGroup;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(id);
  }
  const pairs = [];
  for (const ids of groups.values()) {
    if (ids.length % 2) throw new Error(`Odd number of tiles in group ${getFace(ids[0]).matchGroup}`);
    for (let i = 0; i < ids.length; i += 2) pairs.push([ids[i], ids[i + 1]]);
  }
  return pairs;
}
