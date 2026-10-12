/**
 * Persists settings and stats in localStorage. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded and the game
 * still works without it.
 */
// Namespaced with the app id: localStorage is shared by every app on the origin (<user>.github.io).
const KEY = 'rh-mahjong-solitaire:prefs:v1';

const DEFAULTS = Object.freeze({
  themeId: null,
  layoutId: null,
  highlightFree: true,
  showIndex: false,
  bestTimes: {},
  seenHelp: false,
});

export function loadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { ...structuredClone(DEFAULTS), ...raw };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable: keep playing without persistence */
  }
}
