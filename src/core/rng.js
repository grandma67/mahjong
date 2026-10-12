/**
 * Small seeded PRNG (mulberry32) so every deal is reproducible from a seed.
 * Being able to replay a deal is what powers "Restart" and shareable game numbers.
 */
export function createRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Integer in [0, max). */
    int: (max) => Math.floor(next() * max),
    /** In-place Fisher–Yates shuffle; returns the same array. */
    shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    },
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 1_000_000) + 1;
}
