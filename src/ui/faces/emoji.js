/**
 * Playful face set: every face is an emoji. Flowers and seasons keep the
 * solitaire rule (any flower matches any flower), so they share a visual
 * theme to make that easier to spot.
 */
import { svg } from './svg.js';

const EMOJI = {
  dots: ['🍎', '🍊', '🍋', '🍐', '🍇', '🍓', '🍒', '🍑', '🥝'],
  bamboo: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'],
  characters: ['🐙', '🦀', '🐠', '🐬', '🐳', '🦑', '🐢', '🦞', '🐡'],
  wind: { east: '☀️', south: '🌈', west: '⛅', north: '❄️' },
  dragon: { red: '🔥', green: '🍀', white: '💎' },
  flower: { plum: '🌸', orchid: '🌺', chrysanthemum: '🌻', bamboo: '🌷' },
  season: { spring: '🌱', summer: '🏖️', autumn: '🍂', winter: '⛄' },
};

const BADGE = { flower: '✿', season: '◷' };

function pick(face) {
  const table = EMOJI[face.category];
  return Array.isArray(table) ? table[face.value - 1] : table[face.value];
}

export const emojiFaces = Object.freeze({
  id: 'emoji',
  render: (face) =>
    svg(
      `<text x="30" y="52" font-size="34" text-anchor="middle" class="emoji">${pick(face)}</text>` +
        (BADGE[face.category]
          ? `<text x="30" y="74" font-size="11" text-anchor="middle" class="ink-k glyph">${BADGE[face.category]}</text>`
          : ''),
    ),
});
