/**
 * Theme registry. A theme is pure data: which face set to use, plus design
 * tokens that become CSS custom properties (`--bg`, `--tile-face`, ...).
 * To add a theme, append an entry here. No CSS changes are needed.
 */

const theme = (id, name, faceSet, scheme, tokens) => Object.freeze({ id, name, faceSet, scheme, tokens });

export const THEMES = Object.freeze([
  theme('jade', 'Jade Classic', 'traditional', 'dark', {
    'bg': 'radial-gradient(ellipse at 50% 30%, #1f7a55 0%, #0f5138 55%, #08301f 100%)',
    'text': '#f3ecd6',
    'panel': 'rgba(4, 30, 20, 0.55)',
    'panel-solid': '#0d3a29',
    'accent': '#e7c76a',
    'accent-text': '#1d1a10',
    'tile-face': '#fbf6e6',
    'tile-face-2': '#ece2c4',
    'tile-edge': '#d8cba3',
    'tile-side': '#1d8a5c',
    'tile-side-2': '#0f5a3b',
    'ink-red': '#c0262d',
    'ink-green': '#1f7a3d',
    'ink-blue': '#1e4f9a',
    'ink-black': '#1b1b1b',
    'select': '#ffd54a',
    'hint': '#5fe3ff',
  }),
  theme('midnight', 'Midnight', 'traditional', 'dark', {
    'bg': 'radial-gradient(ellipse at 50% 0%, #283a6b 0%, #121a35 55%, #070b18 100%)',
    'text': '#dfe6ff',
    'panel': 'rgba(10, 16, 36, 0.6)',
    'panel-solid': '#141d3b',
    'accent': '#7aa2ff',
    'accent-text': '#0b1230',
    'tile-face': '#2b3557',
    'tile-face-2': '#202844',
    'tile-edge': '#3c4872',
    'tile-side': '#121831',
    'tile-side-2': '#090d1d',
    'ink-red': '#ff6b81',
    'ink-green': '#5be3a1',
    'ink-blue': '#7fb2ff',
    'ink-black': '#e9ecff',
    'select': '#ffd166',
    'hint': '#8affc1',
  }),
  theme('sakura', 'Sakura', 'traditional', 'light', {
    'bg': 'linear-gradient(160deg, #ffe4ee 0%, #fbc6d8 45%, #e8a6c3 100%)',
    'text': '#5a2340',
    'panel': 'rgba(255, 255, 255, 0.55)',
    'panel-solid': '#fff1f6',
    'accent': '#d6457f',
    'accent-text': '#ffffff',
    'tile-face': '#fffafc',
    'tile-face-2': '#fbe9f0',
    'tile-edge': '#efc9d8',
    'tile-side': '#e58fb2',
    'tile-side-2': '#b85d84',
    'ink-red': '#d1305f',
    'ink-green': '#4f9a5c',
    'ink-blue': '#6a5acd',
    'ink-black': '#3d1a2b',
    'select': '#ff7eb6',
    'hint': '#55c7a6',
  }),
  theme('ocean', 'Ocean Breeze', 'traditional', 'dark', {
    'bg': 'linear-gradient(180deg, #0f6f93 0%, #0a4c6e 50%, #062c45 100%)',
    'text': '#e6f7ff',
    'panel': 'rgba(3, 30, 48, 0.55)',
    'panel-solid': '#0a3a55',
    'accent': '#ffd38a',
    'accent-text': '#2b1d05',
    'tile-face': '#fff8ea',
    'tile-face-2': '#f2e2c2',
    'tile-edge': '#e0cba0',
    'tile-side': '#2aa3c4',
    'tile-side-2': '#136a87',
    'ink-red': '#d9483b',
    'ink-green': '#178f73',
    'ink-blue': '#13609c',
    'ink-black': '#17303f',
    'select': '#ffcc33',
    'hint': '#ff8a65',
  }),
  theme('ember', 'Imperial Ember', 'traditional', 'dark', {
    'bg': 'radial-gradient(ellipse at 50% 20%, #7a1f1a 0%, #4a0f10 55%, #220607 100%)',
    'text': '#fbe7c6',
    'panel': 'rgba(34, 6, 7, 0.55)',
    'panel-solid': '#3d0c0d',
    'accent': '#e9b44c',
    'accent-text': '#2a1500',
    'tile-face': '#fdf3dc',
    'tile-face-2': '#f0dcae',
    'tile-edge': '#d9bd80',
    'tile-side': '#b8862b',
    'tile-side-2': '#7a5313',
    'ink-red': '#b3141b',
    'ink-green': '#2f6b2a',
    'ink-blue': '#273f8c',
    'ink-black': '#2a1208',
    'select': '#ffe066',
    'hint': '#7cf0ff',
  }),
  theme('neon', 'Neon Arcade', 'traditional', 'dark', {
    'bg': 'linear-gradient(rgba(255,0,200,0.06) 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px) 0 0 / 32px 32px, #07040f',
    'text': '#f4eaff',
    'panel': 'rgba(20, 8, 40, 0.7)',
    'panel-solid': '#140828',
    'accent': '#ff2bd6',
    'accent-text': '#ffffff',
    'tile-face': '#140b26',
    'tile-face-2': '#0c0618',
    'tile-edge': '#00e5ff',
    'tile-side': '#5b1aa8',
    'tile-side-2': '#2c0a57',
    'ink-red': '#ff3b8d',
    'ink-green': '#39ff9e',
    'ink-blue': '#28d7ff',
    'ink-black': '#fff36b',
    'select': '#ff2bd6',
    'hint': '#39ff9e',
  }),
  theme('garden', 'Emoji Garden', 'emoji', 'light', {
    'bg': 'linear-gradient(180deg, #bfe9ff 0%, #d9f6d0 70%, #a7dd8a 100%)',
    'text': '#1f3b1a',
    'panel': 'rgba(255, 255, 255, 0.6)',
    'panel-solid': '#f2fbef',
    'accent': '#ff8a3d',
    'accent-text': '#ffffff',
    'tile-face': '#ffffff',
    'tile-face-2': '#f1f6ff',
    'tile-edge': '#d2def2',
    'tile-side': '#8ccf6e',
    'tile-side-2': '#4f9a3a',
    'ink-red': '#e0443e',
    'ink-green': '#3d9a4a',
    'ink-blue': '#3e7bd6',
    'ink-black': '#3a3a3a',
    'select': '#ff8a3d',
    'hint': '#3e7bd6',
  }),
]);

export const DEFAULT_THEME_ID = 'jade';

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID);
}

/** Inline style string with a theme's tokens, e.g. for theme preview swatches. */
export function themeStyle(t) {
  return Object.entries(t.tokens).map(([k, v]) => `--${k}:${v}`).join(';');
}

/** Applies a theme to the document root. */
export function applyTheme(t, root = document.documentElement) {
  for (const [k, v] of Object.entries(t.tokens)) root.style.setProperty(`--${k}`, v);
  root.dataset.theme = t.id;
  root.style.colorScheme = t.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.tokens['panel-solid']);
}
