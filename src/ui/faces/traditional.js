/**
 * Traditional tile faces drawn as SVG in code, so they need no image assets
 * and every color comes from the active theme.
 */
import { svg, text, INK } from './svg.js';

const { red: R, green: G, blue: B, black: K, bg: BG } = INK;

// ---- Dots (circles) --------------------------------------------------------

const DOT_LAYOUTS = {
  1: [[30, 40, R]],
  2: [[30, 22, G], [30, 58, B]],
  3: [[16, 18, B], [30, 40, R], [44, 62, G]],
  4: [[18, 22, B], [42, 22, G], [18, 58, G], [42, 58, B]],
  5: [[17, 18, B], [43, 18, G], [30, 40, R], [17, 62, G], [43, 62, B]],
  6: [[19, 16, G], [41, 16, G], [19, 42, R], [41, 42, R], [19, 64, R], [41, 64, R]],
  7: [[14, 12, G], [30, 21, G], [46, 30, G], [19, 50, R], [41, 50, R], [19, 67, R], [41, 67, R]],
  8: [14, 31, 48, 65].flatMap((y) => [[19, y, B], [41, y, B]]),
  9: [[18, B], [40, R], [62, G]].flatMap(([y, ink]) => [[15, y, ink], [30, y, ink], [45, y, ink]]),
};

const dotRadius = (n) => (n === 1 ? 17 : n <= 2 ? 11 : n <= 5 ? 9 : 7.5);

function dot(cx, cy, r, ink) {
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r}" class="${ink}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" class="${BG}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.32}" class="${ink}"/>`
  );
}

const dots = (n) => svg(DOT_LAYOUTS[n].map(([x, y, ink]) => dot(x, y, dotRadius(n), ink)).join(''), n);

// ---- Bamboo (sticks) -------------------------------------------------------

function stick(cx, cy, h, ink) {
  const w = 7;
  return (
    `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" class="${ink}"/>` +
    `<rect x="${cx - w / 2 - 1}" y="${cy - 1}" width="${w + 2}" height="2" rx="1" class="${ink}"/>` +
    `<line x1="${cx}" y1="${cy - h / 2 + 3}" x2="${cx}" y2="${cy + h / 2 - 3}" class="${BG} vein"/>`
  );
}

const cols = (xs, ys, ink) => ys.flatMap((y) => xs.map((x) => [x, y, ink]));

const BAMBOO_LAYOUTS = {
  2: [[30, 22, G], [30, 58, B]],
  3: [[30, 22, G], [18, 58, G], [42, 58, G]],
  4: cols([19, 41], [22, 58], G),
  5: [...cols([16, 44], [22, 58], G), [30, 40, R]],
  6: cols([15, 30, 45], [22, 58], G),
  7: [[30, 13, R], ...cols([15, 30, 45], [40, 66], G)],
  8: cols([12, 24, 36, 48], [22, 58], G),
  9: [[15, G], [30, R], [45, B]].flatMap(([x, ink]) => [[x, 15, ink], [x, 40, ink], [x, 65, ink]]),
};

const stickHeight = (n) => (n === 7 || n === 9 ? 20 : 28);

/** Bamboo 1 is traditionally a bird (peacock or sparrow). */
const bird = () =>
  svg(
    `<ellipse cx="22" cy="62" rx="6" ry="13" transform="rotate(30 22 62)" class="${B}"/>` +
      `<ellipse cx="30" cy="64" rx="6" ry="14" class="${G}"/>` +
      `<ellipse cx="38" cy="62" rx="6" ry="13" transform="rotate(-30 38 62)" class="${B}"/>` +
      `<ellipse cx="30" cy="40" rx="11" ry="14" class="${G}"/>` +
      `<path d="M22 38 Q30 52 38 38 Q30 44 22 38Z" class="${R}"/>` +
      `<circle cx="30" cy="21" r="7.5" class="${R}"/>` +
      `<path d="M37 20 L45 22 L37 24Z" class="${K}"/>` +
      `<circle cx="32" cy="19.5" r="1.8" class="${BG}"/>` +
      `<path d="M27 14 L24 6 M30 13 L30 5 M33 14 L36 6" class="${R} crest"/>`,
    1,
  );

const bamboo = (n) =>
  n === 1 ? bird() : svg(BAMBOO_LAYOUTS[n].map(([x, y, ink]) => stick(x, y, stickHeight(n), ink)).join(''), n);

// ---- Characters (numeral + 萬) ---------------------------------------------

const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const characters = (n) =>
  svg(text(NUMERALS[n - 1], 30, 36, 26, K) + text('萬', 30, 70, 30, R), n);

// ---- Honours ---------------------------------------------------------------

const WIND_GLYPHS = { east: ['東', 'E'], south: ['南', 'S'], west: ['西', 'W'], north: ['北', 'N'] };
const wind = (w) => svg(text(WIND_GLYPHS[w][0], 30, 54, 36, K), WIND_GLYPHS[w][1]);

const dragon = (d) => {
  if (d === 'red') return svg(text('中', 30, 54, 38, R), 'R');
  if (d === 'green') return svg(text('發', 30, 54, 36, G), 'G');
  return svg(
    `<rect x="12" y="16" width="36" height="48" rx="3" class="${B} frame"/>` +
      `<rect x="17" y="21" width="26" height="38" rx="2" class="${B} frame thin"/>`,
    'W',
  );
};

// ---- Bonus tiles -----------------------------------------------------------

const FLOWER_INFO = {
  plum: ['梅', R, 1], orchid: ['蘭', B, 2], chrysanthemum: ['菊', R, 3], bamboo: ['竹', G, 4],
};
const SEASON_INFO = {
  spring: ['春', G, 1], summer: ['夏', R, 2], autumn: ['秋', R, 3], winter: ['冬', B, 4],
};

function blossom(cx, cy, ink) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180);
    return `<circle cx="${(cx + Math.cos(a) * 8).toFixed(1)}" cy="${(cy + Math.sin(a) * 8).toFixed(1)}" r="6.5" class="${ink}"/>`;
  }).join('');
  return `${petals}<circle cx="${cx}" cy="${cy}" r="4.5" class="${BG}"/><circle cx="${cx}" cy="${cy}" r="2.5" class="${G}"/>`;
}

const flower = (f) => {
  const [glyph, ink, num] = FLOWER_INFO[f];
  return svg(
    blossom(30, 32, ink) +
      `<path d="M30 44 Q27 52 30 58" class="${G} stem"/>` +
      text(glyph, 30, 74, 18, K),
    num,
  );
};

const season = (s) => {
  const [glyph, ink, num] = SEASON_INFO[s];
  return svg(
    `<circle cx="30" cy="34" r="18" class="${ink}"/>` +
      `<circle cx="30" cy="34" r="14.5" class="${BG}"/>` +
      text(glyph, 30, 43, 24, ink) +
      text(num, 30, 74, 14, K),
    num,
  );
};

// ---- Face set --------------------------------------------------------------

const RENDERERS = {
  dots, bamboo, characters, wind, dragon, flower, season,
};

export const traditionalFaces = Object.freeze({
  id: 'traditional',
  render: (face) => RENDERERS[face.category](face.value),
});
