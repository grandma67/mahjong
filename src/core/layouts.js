/**
 * Board layouts.
 *
 * Coordinates use half-tile units, so layouts can offset tiles by half a tile
 * (like the Turtle's side wings and top tile). A tile at (x, y) covers
 * [x, x + 2) × [y, y + 2) on layer z.
 *
 * Layouts are written in whole-tile units with `rect()`, which handles the
 * conversion, so adding a new layout only takes a few lines of data.
 */

/** A block of tiles. col/row/cols/rows are in tile units (halves allowed). */
function rect(col, row, cols, rows, z = 0) {
  const slots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: (col + c) * 2, y: (row + r) * 2, z });
    }
  }
  return slots;
}

/** One row of `count` tiles starting at `col`. */
const row = (col, rowIdx, count, z = 0) => rect(col, rowIdx, count, 1, z);

function defineLayout({ id, name, difficulty, parts }) {
  const slots = parts.flat().map((s, index) => ({ ...s, index }));
  return Object.freeze({ id, name, difficulty, slots });
}

export const LAYOUTS = Object.freeze([
  defineLayout({
    id: 'turtle',
    name: 'Turtle',
    difficulty: 'Classic',
    parts: [
      // Layer 0: 87 tiles
      row(1, 0, 12), row(3, 1, 8), row(2, 2, 10), row(1, 3, 12),
      row(1, 4, 12), row(2, 5, 10), row(3, 6, 8), row(1, 7, 12),
      rect(0, 3.5, 1, 1), rect(13, 3.5, 1, 1), rect(14, 3.5, 1, 1),
      // Upper layers: 36 + 16 + 4 + 1
      rect(4, 1, 6, 6, 1),
      rect(5, 2, 4, 4, 2),
      rect(6, 3, 2, 2, 3),
      rect(6.5, 3.5, 1, 1, 4),
    ],
  }),
  defineLayout({
    id: 'pyramid',
    name: 'Pyramid',
    difficulty: 'Medium',
    parts: [
      rect(0, 0, 8, 8, 0),
      rect(1, 1, 6, 6, 1),
      rect(2, 2, 4, 4, 2),
      rect(3, 3, 2, 2, 3),
    ],
  }),
  defineLayout({
    id: 'fortress',
    name: 'Fortress',
    difficulty: 'Medium',
    parts: [
      rect(0, 0, 10, 6, 0),
      // Corner towers
      rect(0, 0, 2, 2, 1), rect(8, 0, 2, 2, 1),
      rect(0, 4, 2, 2, 1), rect(8, 4, 2, 2, 1),
      rect(0.5, 0.5, 1, 1, 2), rect(8.5, 0.5, 1, 1, 2),
      rect(0.5, 4.5, 1, 1, 2), rect(8.5, 4.5, 1, 1, 2),
      // Keep
      rect(3, 2, 4, 2, 1),
      rect(4, 2, 2, 2, 2),
    ],
  }),
  defineLayout({
    id: 'cross',
    name: 'Cross',
    difficulty: 'Hard',
    parts: [
      rect(0, 4, 12, 2, 0), rect(5, 0, 2, 4, 0), rect(5, 6, 2, 4, 0),
      rect(2, 4, 8, 2, 1), rect(5, 2, 2, 2, 1), rect(5, 6, 2, 2, 1),
      rect(4, 4, 4, 2, 2),
      rect(5, 4, 2, 2, 3),
    ],
  }),
  defineLayout({
    id: 'garden',
    name: 'Garden',
    difficulty: 'Easy',
    parts: [
      rect(0, 0, 8, 6, 0),
      rect(1, 1, 6, 4, 1),
    ],
  }),
]);

export const DEFAULT_LAYOUT_ID = 'turtle';

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS.find((l) => l.id === DEFAULT_LAYOUT_ID);
}
