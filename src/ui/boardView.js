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
// Room kept on each side of the board for the rails, in tile widths, so the
// gap between rails and tiles grows with the tiles.
const RAIL_RATIO = 0.25;

// Tile corner in tile widths: higher layers shift up and to the left.
const tileLeft = (x, z) => x / 2 - z * DEPTH_RATIO;
const tileTop = (y, z) => (y / 2) * TILE_RATIO - z * DEPTH_RATIO;

export class BoardView {
  constructor(container, { onTileClick }) {
    this.container = container;
    this.surface = document.createElement('div');
    this.surface.className = 'board-surface';
    container.replaceChildren(this.surface);
    // Two lines along the board's long edges (top and bottom, or left and
    // right when turned) show which way the rows run: tiles are only ever
    // blocked by neighbours along the rails, never across them.
    this.rails = ['start', 'end'].map((end) => {
      const rail = document.createElement('div');
      rail.className = `board-rail rail-${end}`;
      rail.setAttribute('aria-hidden', 'true');
      return rail;
    });
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
    this.surface.replaceChildren(...this.rails, ...this.els);
    this.layout();
    this.update({ instant: true });
  }

  setFaceSet(faceSetId) {
    this.faceSetId = faceSetId;
    this.shownFaces = [];
    this.update({ instant: true });
  }

  /**
   * Computes the tile size that fits the container and positions every tile.
   * When the container is tall and narrow (a phone held upright), the board is
   * drawn turned 90° clockwise if that gives bigger tiles. Only the drawing
   * turns: the faces stay upright and the game rules still use the original
   * layout, so a tile's "left and right" neighbours appear above and below it.
   * The rails turn with the board, so room for them is kept above and below an
   * upright board, or beside a turned one.
   */
  layout() {
    if (!this.game) return;
    const style = getComputedStyle(this.container);
    const availW = this.container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availH = this.container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const fit = (box, rotated) => Math.min(
      MAX_TILE_W,
      availW / (box.w + (rotated ? 2 * RAIL_RATIO : 0)),
      availH / (box.h + (rotated ? 0 : 2 * RAIL_RATIO)),
    );
    const upright = this.extent(false);
    const turned = this.extent(true);
    this.rotated = fit(turned, true) > fit(upright, false);
    this.container.classList.toggle('rotated', this.rotated);

    const box = this.rotated ? turned : upright;
    const tw = fit(box, this.rotated);
    this.surface.style.setProperty('--tw', `${tw}px`);
    this.surface.style.setProperty('--th', `${tw * TILE_RATIO}px`);
    this.surface.style.setProperty('--d', `${tw * DEPTH_RATIO}px`);
    this.surface.style.setProperty('--rail', `${tw * RAIL_RATIO}px`);
    this.surface.style.width = `${box.w * tw}px`;
    this.surface.style.height = `${box.h * tw}px`;

    for (const slot of this.game.slots) {
      const el = this.els[slot.index];
      const { x, y } = this.place(slot, this.rotated);
      el.style.left = `${(tileLeft(x, slot.z) - box.minX) * tw}px`;
      el.style.top = `${(tileTop(y, slot.z) - box.minY) * tw}px`;
      // Draw higher layers first, then lower rows and rightmost tiles on top,
      // so each tile's 3D side is covered by its neighbour.
      el.style.zIndex = String(slot.z * 1000 + y * 30 + x);
    }
  }

  /** Half-tile grid position on screen; a clockwise turn maps (x, y) to (H - 2 - y, x). */
  place(slot, rotated) {
    return rotated ? { x: this.bounds.height - 2 - slot.y, y: slot.x } : { x: slot.x, y: slot.y };
  }

  /**
   * The area the tiles really cover, in tile widths, including each tile's 3D
   * side. Measuring the tiles themselves (rather than reserving room for the
   * tallest stack on every edge) keeps empty space off the board's edges.
   */
  extent(rotated) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const slot of this.game.slots) {
      const { x, y } = this.place(slot, rotated);
      const left = tileLeft(x, slot.z);
      const top = tileTop(y, slot.z);
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + 1 + DEPTH_RATIO);
      maxY = Math.max(maxY, top + TILE_RATIO + DEPTH_RATIO);
    }
    return { minX, minY, w: maxX - minX, h: maxY - minY };
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
