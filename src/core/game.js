/**
 * Game state for one deal of Mahjong Solitaire. No DOM access, so the UI
 * (or a test) drives it through method calls and reads the state back.
 */
import { buildGeometry, isFree } from './board.js';
import { deal, pairUp, canClear } from './generator.js';
import { facesMatch, pickPairs } from './tiles.js';
import { createRng } from './rng.js';

export const STATUS = Object.freeze({ PLAYING: 'playing', WON: 'won', STUCK: 'stuck' });

export class Game {
  /**
   * @param {object} layout  from layouts.js
   * @param {number} seed    deal number; same seed + layout = same deal
   */
  constructor(layout, seed) {
    this.layout = layout;
    this.seed = seed;
    this.slots = layout.slots;
    this.geometry = buildGeometry(this.slots);
    this.rng = createRng(seed);

    const indices = this.slots.map((s) => s.index);
    const { faces, solvable } = deal(this.geometry, indices, pickPairs(indices.length / 2, this.rng), this.rng);
    /** False only if the generator fell back to a random deal. */
    this.solvable = solvable;
    /** Face id per slot index, or null once removed. */
    this.tiles = indices.map((i) => faces.get(i));
    this.selected = null;
    /** Undo stack. Entries are {type:'match', pair:[[i,face],[j,face]]} or {type:'shuffle', before:[...]}. */
    this.history = [];
    this.shuffles = 0;
    this.hintsUsed = 0;
    /** Set once the auto-solver has played a move, so the win doesn't count as a best time. */
    this.autoSolved = false;
  }

  // ---- queries -------------------------------------------------------------

  isPresent = (i) => this.tiles[i] != null;

  isFree(i) {
    return this.isPresent(i) && isFree(this.geometry, i, this.isPresent);
  }

  get tilesLeft() {
    return this.tiles.reduce((n, t) => n + (t != null ? 1 : 0), 0);
  }

  get matchesMade() {
    return this.history.filter((h) => h.type === 'match').length;
  }

  freeIndices() {
    return this.slots.map((s) => s.index).filter((i) => this.isFree(i));
  }

  /** Every currently playable pair [i, j]. */
  availableMatches() {
    const free = this.freeIndices();
    const matches = [];
    for (let a = 0; a < free.length; a++) {
      for (let b = a + 1; b < free.length; b++) {
        if (facesMatch(this.tiles[free[a]], this.tiles[free[b]])) matches.push([free[a], free[b]]);
      }
    }
    return matches;
  }

  get status() {
    if (this.tilesLeft === 0) return STATUS.WON;
    return this.availableMatches().length ? STATUS.PLAYING : STATUS.STUCK;
  }

  // ---- actions -------------------------------------------------------------

  /**
   * Handles a click on slot `i`.
   * @returns {{type:'blocked'|'select'|'deselect'|'match'|'mismatch'|'ignored', indices?:number[]}}
   */
  select(i) {
    if (!this.isPresent(i)) return { type: 'ignored' };
    if (!this.isFree(i)) return { type: 'blocked', indices: [i] };
    if (this.selected === i) {
      this.selected = null;
      return { type: 'deselect', indices: [i] };
    }
    if (this.selected == null) {
      this.selected = i;
      return { type: 'select', indices: [i] };
    }
    const j = this.selected;
    if (facesMatch(this.tiles[i], this.tiles[j])) {
      this.removePair(j, i);
      return { type: 'match', indices: [j, i] };
    }
    // Mismatch: switch the selection to the newly clicked tile.
    this.selected = i;
    return { type: 'mismatch', indices: [j, i] };
  }

  removePair(i, j) {
    this.history.push({ type: 'match', pair: [[i, this.tiles[i]], [j, this.tiles[j]]] });
    this.tiles[i] = null;
    this.tiles[j] = null;
    this.selected = null;
  }

  /** @returns the undone entry, or null when there is nothing to undo. */
  undo() {
    const last = this.history.pop();
    if (!last) return null;
    if (last.type === 'match') {
      for (const [i, face] of last.pair) this.tiles[i] = face;
    } else if (last.type === 'shuffle') {
      this.tiles = [...last.before];
    }
    this.selected = null;
    return last;
  }

  /**
   * Whether the tiles left could still all be removed, if shuffled. False
   * means the position is a dead end and only Undo can help.
   */
  canBeCleared() {
    const remaining = this.slots.map((s) => s.index).filter(this.isPresent);
    return canClear(this.geometry, remaining, createRng(this.seed + this.history.length));
  }

  /**
   * A playable pair, or null if there is none. Prefers a pair that frees up the
   * most tiles, but never one that leaves the board impossible to clear (such
   * as taking a tile whose partner is the only other tile in its stack).
   */
  hint() {
    const matches = this.availableMatches();
    if (!matches.length) return null;
    this.hintsUsed++;
    const blockedBy = (i) =>
      this.geometry.filter((g) => g.above.includes(i) || g.left.includes(i) || g.right.includes(i)).length;
    const ranked = matches
      .map((m) => ({ m, score: blockedBy(m[0]) + blockedBy(m[1]) }))
      .sort((a, b) => b.score - a.score)
      .map(({ m }) => m);
    const remaining = this.slots.map((s) => s.index).filter(this.isPresent);
    const rng = createRng(this.seed + this.history.length);
    const keepsBoardClearable = ([a, b]) =>
      canClear(this.geometry, remaining.filter((i) => i !== a && i !== b), rng);
    return ranked.find(keepsBoardClearable) ?? ranked[0];
  }

  /**
   * Redeals the remaining tiles in place, again guaranteed solvable, so the
   * player can recover from a dead end. Shuffling can be undone.
   */
  shuffle() {
    const remaining = this.slots.map((s) => s.index).filter(this.isPresent);
    if (!remaining.length) return false;
    const before = [...this.tiles];
    const pairs = pairUp(remaining.map((i) => this.tiles[i]));
    const { faces } = deal(this.geometry, remaining, pairs, this.rng);
    for (const i of remaining) this.tiles[i] = faces.get(i);
    this.history.push({ type: 'shuffle', before });
    this.selected = null;
    this.shuffles++;
    return true;
  }
}
