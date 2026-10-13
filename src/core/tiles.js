/**
 * The standard 144-tile Mahjong set and the solitaire matching rules.
 *
 *  - 3 suits (dots, bamboo, characters) × ranks 1–9 × 4 copies = 108
 *  - 4 winds × 4 copies                                        =  16
 *  - 3 dragons × 4 copies                                      =  12
 *  - 4 flowers (one each)                                      =   4
 *  - 4 seasons (one each)                                      =   4
 *
 * Identical tiles match. Flowers and seasons are the exception: any flower
 * matches any other flower, and any season matches any other season.
 * That's why every face has a `matchGroup` that can differ from its `id`.
 */

export const SUITS = Object.freeze(['dots', 'bamboo', 'characters']);
export const WINDS = Object.freeze(['east', 'south', 'west', 'north']);
export const DRAGONS = Object.freeze(['red', 'green', 'white']);
export const FLOWERS = Object.freeze(['plum', 'orchid', 'chrysanthemum', 'bamboo']);
export const SEASONS = Object.freeze(['spring', 'summer', 'autumn', 'winter']);

function face(category, value, matchGroup, copies) {
  const id = `${category}-${value}`;
  return Object.freeze({ id, category, value, matchGroup: matchGroup ?? id, copies });
}

/** Every distinct tile face, in canonical order. */
export const FACES = Object.freeze([
  ...SUITS.flatMap((suit) =>
    Array.from({ length: 9 }, (_, i) => face(suit, i + 1, null, 4)),
  ),
  ...WINDS.map((w) => face('wind', w, null, 4)),
  ...DRAGONS.map((d) => face('dragon', d, null, 4)),
  ...FLOWERS.map((f) => face('flower', f, 'flower', 1)),
  ...SEASONS.map((s) => face('season', s, 'season', 1)),
]);

const FACE_BY_ID = new Map(FACES.map((f) => [f.id, f]));

export function getFace(id) {
  const f = FACE_BY_ID.get(id);
  if (!f) throw new Error(`Unknown tile face: ${id}`);
  return f;
}

export function facesMatch(idA, idB) {
  return getFace(idA).matchGroup === getFace(idB).matchGroup;
}

/** All 144 tile face ids (with duplicates), unshuffled. */
export function fullSet() {
  return FACES.flatMap((f) => Array(f.copies).fill(f.id));
}

/**
 * Splits the full set into 72 matching pairs of face ids.
 * Each group of four identical tiles gives two pairs. The four flowers
 * give two pairs, and so do the four seasons.
 */
export function allPairs() {
  const byGroup = new Map();
  for (const id of fullSet()) {
    const group = getFace(id).matchGroup;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(id);
  }
  const pairs = [];
  for (const ids of byGroup.values()) {
    for (let i = 0; i + 1 < ids.length; i += 2) pairs.push([ids[i], ids[i + 1]]);
  }
  return pairs;
}

/**
 * Picks `count` pairs for a layout. Layouts with fewer than 144 slots get a
 * random subset, but one that still shows every kind of tile: one pair per
 * match group comes first (36 pairs, so 72 slots), then random pairs fill
 * the rest. Layouts with more than 144 slots cycle through the set again.
 */
export function pickPairs(count, rng) {
  const base = allPairs();
  if (count < base.length) {
    const shuffled = rng.shuffle(base.map((p) => [...p]));
    const seen = new Set();
    const firsts = [];
    const rest = [];
    for (const pair of shuffled) {
      const group = getFace(pair[0]).matchGroup;
      (seen.has(group) ? rest : firsts).push(pair);
      seen.add(group);
    }
    return rng.shuffle([...firsts, ...rest].slice(0, count));
  }
  const result = [];
  while (result.length < count) {
    const batch = rng.shuffle(base.map((p) => [...p]));
    result.push(...batch.slice(0, count - result.length));
  }
  return result;
}
