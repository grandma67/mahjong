/** Face-set registry, plus human-readable tile names for accessibility. */
import { traditionalFaces } from './traditional.js';
import { emojiFaces } from './emoji.js';
import { getFace } from '../../core/tiles.js';

const FACE_SETS = new Map([traditionalFaces, emojiFaces].map((s) => [s.id, s]));
const cache = new Map();

/** SVG markup for a face id in the given face set (memoised). */
export function renderFace(faceSetId, faceId) {
  const key = `${faceSetId}:${faceId}`;
  if (!cache.has(key)) {
    const set = FACE_SETS.get(faceSetId) ?? traditionalFaces;
    cache.set(key, set.render(getFace(faceId)));
  }
  return cache.get(key);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function describeFace(faceId) {
  const { category, value } = getFace(faceId);
  switch (category) {
    case 'dots':
    case 'bamboo':
    case 'characters':
      return `${value} of ${cap(category)}`;
    case 'wind':
      return `${cap(value)} Wind`;
    case 'dragon':
      return `${cap(value)} Dragon`;
    default:
      return `${cap(value)} (${category})`;
  }
}
