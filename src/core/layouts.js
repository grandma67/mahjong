/**
 * Board layouts.
 *
 * Coordinates use half-tile units, so layouts can offset tiles by half a tile.
 * A tile at (x, y) covers [x, x + 2) × [y, y + 2) on layer z.
 *
 * Layouts are written in whole-tile units, either as blocks with `rect()` or
 * drawn as a height map with `heights()`, so adding a layout only takes a few
 * lines of data. Shapes are about 8 tiles wide by 12 tall (or 12 by 8, which
 * the board turns on a phone), the proportions that fill a phone screen.
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

/**
 * A shape drawn as a height map: each character is one tile position, and its
 * digit is how many tiles are stacked there ('.' for none).
 */
function heights(lines) {
  const slots = [];
  lines.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      for (let z = 0; z < (Number(ch) || 0); z++) slots.push({ x: col * 2, y: row * 2, z });
    });
  });
  return slots;
}

function defineLayout({ id, name, difficulty, parts }) {
  const slots = parts.flat().map((s, index) => ({ ...s, index }));
  return Object.freeze({ id, name, difficulty, slots });
}

export const LAYOUTS = Object.freeze([
  defineLayout({
    id: 'owl',
    name: 'Owl',
    difficulty: 'Medium',
    parts: [
      heights([
        '11....11',
        '121..121',
        '12222221',
        '23322332',
        '23322332',
        '23322332',
        '12233221',
        '.123321.',
        '.123321.',
        '.122221.',
        '..1111..',
        '.11..11.',
      ]),
    ],
  }),
  defineLayout({
    id: 'rocket',
    name: 'Rocket',
    difficulty: 'Medium',
    parts: [
      heights([
        '...11...',
        '..1221..',
        '..2332..',
        '.123321.',
        '.134431.',
        '.134431.',
        '.134431.',
        '.123321.',
        '11233211',
        '12233221',
        '12.33.21',
        '1..22..1',
      ]),
    ],
  }),
  defineLayout({
    id: 'cat',
    name: 'Cat',
    difficulty: 'Medium',
    parts: [
      heights([
        '1......1',
        '21....12',
        '22111122',
        '12222221',
        '13233231',
        '12244221',
        '.122221.',
        '..1111..',
        '.122221.',
        '12333321',
        '12333321',
        '11111111',
      ]),
    ],
  }),
  defineLayout({
    id: 'arrow',
    name: 'Arrow',
    difficulty: 'Easy',
    parts: [
      heights([
        '...11...',
        '..1221..',
        '.123321.',
        '12344321',
        '11344311',
        '..1331..',
        '..1441..',
        '..1441..',
        '..1441..',
        '.122221.',
        '121..121',
        '11....11',
      ]),
    ],
  }),
  defineLayout({
    id: 'hourglass',
    name: 'Hourglass',
    difficulty: 'Easy',
    parts: [
      heights([
        '11111111',
        '12222221',
        '12333321',
        '.123321.',
        '..1221..',
        '...11...',
        '...11...',
        '..1221..',
        '.123321.',
        '12333321',
        '12222221',
        '11111111',
      ]),
    ],
  }),
  defineLayout({
    id: 'lighthouse',
    name: 'Lighthouse',
    difficulty: 'Hard',
    parts: [
      heights([
        '..1111..',
        '.123321.',
        '..1221..',
        '..2332..',
        '..2442..',
        '..2332..',
        '.123321.',
        '.123321.',
        '.134431.',
        '12344321',
        '12333321',
        '11111111',
      ]),
    ],
  }),
  defineLayout({
    id: 'tree',
    name: 'Pine Tree',
    difficulty: 'Medium',
    parts: [
      heights([
        '...11...',
        '..1221..',
        '.123321.',
        '..1221..',
        '.123321.',
        '12344321',
        '.123321.',
        '12344321',
        '12344321',
        '...22...',
        '...33...',
        '.111111.',
      ]),
    ],
  }),
  defineLayout({
    id: 'vase',
    name: 'Vase',
    difficulty: 'Hard',
    parts: [
      heights([
        '.111111.',
        '..1221..',
        '...22...',
        '..1221..',
        '.123321.',
        '12344321',
        '12344321',
        '12344321',
        '.123321.',
        '..1221..',
        '.112211.',
        '11111111',
      ]),
    ],
  }),
  defineLayout({
    id: 'towers',
    name: 'Two Towers',
    difficulty: 'Medium',
    parts: [
      heights([
        '121..121',
        '121..121',
        '232..232',
        '232..232',
        '232..232',
        '23211232',
        '23211232',
        '232..232',
        '232..232',
        '121..121',
        '12111121',
        '11111111',
      ]),
    ],
  }),
  defineLayout({
    id: 'rhombus',
    name: 'Rhombus',
    difficulty: 'Medium',
    parts: [
      heights([
        '...11...',
        '..1111..',
        '.122221.',
        '12333321',
        '12333321',
        '12344321',
        '12344321',
        '12333321',
        '12333321',
        '.122221.',
        '..1111..',
        '...11...',
      ]),
    ],
  }),
  defineLayout({
    id: 'pagoda',
    name: 'Pagoda',
    difficulty: 'Medium',
    parts: [
      heights([
        '..1111..',
        '11111111',
        '.112211.',
        '.123321.',
        '11233211',
        '.113311.',
        '.123321.',
        '12344321',
        '.123321.',
        '12333321',
        '12333321',
        '11111111',
      ]),
    ],
  }),
  // Double-set layouts: 288 tiles, so every face is dealt twice as often.
  defineLayout({
    id: 'ziggurat',
    name: 'Ziggurat',
    difficulty: 'Hard',
    parts: [
      heights([
        '12222221',
        '22333322',
        '23444432',
        '23455432',
        '23455432',
        '23455432',
        '23455432',
        '23455432',
        '23455432',
        '23444432',
        '22333322',
        '12222221',
      ]),
    ],
  }),
  defineLayout({
    id: 'temple',
    name: 'Temple',
    difficulty: 'Hard',
    parts: [
      heights([
        '..1441..',
        '..3553..',
        '.234432.',
        '34444443',
        '34555543',
        '34555543',
        '34555543',
        '34555543',
        '23333332',
        '23444432',
        '12333321',
        '11222211',
      ]),
    ],
  }),
  defineLayout({
    id: 'castle',
    name: 'Castle',
    difficulty: 'Medium',
    parts: [
      heights([
        '33.111111.33',
        '332111111233',
        '.1........1.',
        '.1.234432.1.',
        '.1.234432.1.',
        '.1........1.',
        '332111111233',
        '33.111111.33',
      ]),
    ],
  }),
  defineLayout({
    id: 'butterfly',
    name: 'Butterfly',
    difficulty: 'Medium',
    parts: [
      heights([
        '111......111',
        '12211..11221',
        '122221122221',
        '.1233443321.',
        '.1233443321.',
        '122221122221',
        '12211..11221',
        '111......111',
      ]),
    ],
  }),
  defineLayout({
    id: 'crab',
    name: 'Crab',
    difficulty: 'Easy',
    parts: [
      heights([
        '11........11',
        '121......121',
        '.11.1111.11.',
        '..12333321..',
        '.1234444321.',
        '1.12333321.1',
        '.1.111111.1.',
        '1.1......1.1',
      ]),
    ],
  }),
  defineLayout({
    id: 'spider',
    name: 'Spider',
    difficulty: 'Easy',
    parts: [
      heights([
        '1...1..1...1',
        '.1..1..1..1.',
        '..11233211..',
        '.1123443211.',
        '.1123443211.',
        '..11233211..',
        '.1..1..1..1.',
        '1...1..1...1',
      ]),
    ],
  }),
  defineLayout({
    id: 'arena',
    name: 'Arena',
    difficulty: 'Medium',
    parts: [
      heights([
        '..22222222..',
        '.3222222223.',
        '321111111123',
        '321......123',
        '321......123',
        '321111111123',
        '.3222222223.',
        '..22222222..',
      ]),
    ],
  }),
  defineLayout({
    id: 'bridge',
    name: 'Bridge',
    difficulty: 'Hard',
    parts: [
      heights([
        '222......222',
        '232......232',
        '232......232',
        '222222222222',
        '222222222222',
        '232......232',
        '232......232',
        '222......222',
      ]),
    ],
  }),
  defineLayout({
    id: 'fish',
    name: 'Fish',
    difficulty: 'Medium',
    parts: [
      heights([
        '...1111.....',
        '..122221..11',
        '.12333321.12',
        '123444332112',
        '123444332112',
        '.12333321.12',
        '..122221..11',
        '...1111.....',
      ]),
    ],
  }),
  defineLayout({
    id: 'volcano',
    name: 'Volcano',
    difficulty: 'Hard',
    parts: [
      heights([
        '.1223333221.',
        '.2345555432.',
        '234555555432',
        '234522225432',
        '234522225432',
        '234555555432',
        '.2345555432.',
        '.1223333221.',
      ]),
    ],
  }),
  defineLayout({
    id: 'dragon',
    name: 'Dragon',
    difficulty: 'Medium',
    parts: [
      heights([
        '.122221.1331',
        '12333321.121',
        '1221.1233321',
        '11...1234321',
        '.12321.12321',
        '1234321...11',
        '1233321..111',
        '.12221...111',
      ]),
    ],
  }),
  defineLayout({
    id: 'wall',
    name: 'Great Wall',
    difficulty: 'Hard',
    parts: [
      heights([
        '454444444454',
        '455444444554',
        '444......444',
        '33..1221..33',
        '33..1221..33',
        '444......444',
        '455444444554',
        '454444444454',
      ]),
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

export const DEFAULT_LAYOUT_ID = 'owl';

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS.find((l) => l.id === DEFAULT_LAYOUT_ID);
}
