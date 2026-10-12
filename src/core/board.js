/**
 * Board geometry: which slots block which.
 *
 * Solitaire rule: a tile is FREE when
 *   1. no tile on a higher layer overlaps it, and
 *   2. its left side or its right side is open (no tile directly beside it
 *      on the same layer).
 *
 * The neighbour relationships depend only on the layout, so they are
 * computed once. Each freedom check then just looks up a few slot indices.
 */

const TILE = 2; // a tile spans 2 half-units in each direction

const overlapsVertically = (a, b) => Math.abs(a.y - b.y) < TILE;
const overlaps = (a, b) => Math.abs(a.x - b.x) < TILE && overlapsVertically(a, b);

export function buildGeometry(slots) {
  return slots.map((s) => {
    const above = [];
    const left = [];
    const right = [];
    for (const o of slots) {
      if (o === s) continue;
      if (o.z > s.z && overlaps(s, o)) above.push(o.index);
      else if (o.z === s.z && overlapsVertically(s, o)) {
        if (o.x - s.x === -TILE) left.push(o.index);
        else if (o.x - s.x === TILE) right.push(o.index);
      }
    }
    return { above, left, right };
  });
}

/**
 * @param {Array} geometry   result of buildGeometry
 * @param {number} index     slot index to test
 * @param {(i:number)=>boolean} occupied  whether a slot still holds a tile
 */
export function isFree(geometry, index, occupied) {
  const g = geometry[index];
  if (g.above.some(occupied)) return false;
  return !g.left.some(occupied) || !g.right.some(occupied);
}

/** Bounding box of the layout in half-tile units, used to scale the view. */
export function bounds(slots) {
  const maxX = Math.max(...slots.map((s) => s.x)) + TILE;
  const maxY = Math.max(...slots.map((s) => s.y)) + TILE;
  const maxZ = Math.max(...slots.map((s) => s.z));
  return { width: maxX, height: maxY, layers: maxZ + 1 };
}
