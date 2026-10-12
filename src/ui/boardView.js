/**
 * Renders a Game into the DOM. Each slot is an absolutely positioned
 * <button>, and higher layers are offset up and to the left to give a 3D
 * stack. `update()` compares the view with the game state and only touches
 * what changed, so matches, undo and shuffles all go through the same path.
 */
import { bounds } from '../core/board.js';
import { renderFace, describeFace } from './faces/index.js';

const TILE_RATIO = 1.32;   // height / width
const DEPTH_RATIO = 0.13;  // layer offset / width
const MAX_TILE_W = 84;

export class BoardView {
  constructor(container, { onTileClick }) {
    this.container = container;
    this.surface = document.createElement('div');
    this.surface.className = 'board-surface';
    container.replaceChildren(this.surface);
    this.surface.addEventListener('click', (e) => {
      const btn = e.target.closest('.tile');
      if (btn) onTileClick(Number(btn.dataset.index));
    });
    new ResizeObserver(() => this.layout()).observe(container);
  }

  /** Builds the DOM for a new game. */
  mount(game, faceSetId) {
    this.game = game;
    this.faceSetId = faceSetId;
    this.bounds = bounds(game.slots);
    this.shownFaces = [];
    this.els = game.slots.map((slot) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tile';
      el.dataset.index = slot.index;
      el.innerHTML = '<span class="tile-body"></span>';
      el.addEventListener('animationend', (e) => {
        if (e.animationName === 'tile-remove') el.classList.add('gone');
        else el.classList.remove('shake', 'pop');
      });
      return el;
    });
    this.surface.replaceChildren(...this.els);
    this.layout();
    this.update({ instant: true });
  }

  setFaceSet(faceSetId) {
    this.faceSetId = faceSetId;
    this.shownFaces = [];
    this.update({ instant: true });
  }

  /** Computes the tile size that fits the container and positions every tile. */
  layout() {
    if (!this.game) return;
    const { width, height, layers } = this.bounds;
    const style = getComputedStyle(this.container);
    const availW = this.container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availH = this.container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const cols = width / 2;
    const rows = height / 2;
    const tw = Math.min(
      MAX_TILE_W,
      availW / (cols + DEPTH_RATIO * layers),
      availH / (rows * TILE_RATIO + DEPTH_RATIO * layers),
    );
    const th = tw * TILE_RATIO;
    const d = tw * DEPTH_RATIO;

    this.surface.style.setProperty('--tw', `${tw}px`);
    this.surface.style.setProperty('--th', `${th}px`);
    this.surface.style.setProperty('--d', `${d}px`);
    this.surface.style.width = `${cols * tw + layers * d}px`;
    this.surface.style.height = `${rows * th + layers * d}px`;

    const base = (layers - 1) * d;
    for (const slot of this.game.slots) {
      const el = this.els[slot.index];
      el.style.left = `${(slot.x / 2) * tw + base - slot.z * d}px`;
      el.style.top = `${(slot.y / 2) * th + base - slot.z * d}px`;
      // Draw higher layers first, then lower rows and rightmost tiles on top,
      // so each tile's 3D side is covered by its neighbour.
      el.style.zIndex = String(slot.z * 1000 + slot.y * 30 + slot.x);
    }
  }

  /**
   * Syncs the DOM with the game state.
   * @param {{hint?:number[], highlightFree?:boolean, instant?:boolean}} opts
   */
  update({ hint = [], highlightFree = this.highlightFree ?? true, instant = false } = {}) {
    this.highlightFree = highlightFree;
    const { game } = this;
    for (const slot of game.slots) {
      const i = slot.index;
      const el = this.els[i];
      const face = game.tiles[i];
      const present = face != null;

      if (present) {
        if (this.shownFaces[i] !== face) {
          el.querySelector('.tile-body').innerHTML = renderFace(this.faceSetId, face);
          el.setAttribute('aria-label', describeFace(face));
          this.shownFaces[i] = face;
        }
        el.classList.remove('gone', 'removing');
      } else if (!el.classList.contains('gone')) {
        el.classList.add(instant ? 'gone' : 'removing');
      }

      const free = present && game.isFree(i);
      el.classList.toggle('free', free);
      el.classList.toggle('blocked', present && !free);
      el.classList.toggle('dim', highlightFree && present && !free);
      el.classList.toggle('selected', game.selected === i);
      el.classList.toggle('hint', hint.includes(i));
      el.setAttribute('aria-pressed', String(game.selected === i));
      el.setAttribute('aria-disabled', String(!free));
      el.tabIndex = free ? 0 : -1;
    }
  }

  /** Plays a one-off feedback animation ('shake' or 'pop') on the given tiles. */
  flash(indices, cls) {
    for (const i of indices) {
      const el = this.els[i];
      el.classList.remove(cls);
      void el.offsetWidth; // restart the animation
      el.classList.add(cls);
    }
  }
}
