/** Shared helpers for building tile-face SVG markup. */

export const VIEW_W = 60;
export const VIEW_H = 80;

/** Ink classes are colored by the active theme (see css/main.css). */
export const INK = Object.freeze({ red: 'ink-r', green: 'ink-g', blue: 'ink-b', black: 'ink-k', bg: 'ink-bg' });

export const svg = (body, label = '') =>
  `<svg class="face" viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true">${body}` +
  (label ? `<text class="idx" x="5" y="13">${label}</text>` : '') +
  '</svg>';

export const text = (str, x, y, size, ink, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" class="${ink} glyph" text-anchor="middle" ${extra}>${str}</text>`;
