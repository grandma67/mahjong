import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/game.js';
import { getLayout } from '../src/core/layouts.js';

/** Just enough of the DOM for BoardView: elements, classes, styles, attributes and listeners. */
class FakeElement {
  constructor(tag) {
    this.tag = tag;
    this.className = '';
    this.dataset = {};
    this.attrs = {};
    this.children = [];
    this.listeners = {};
    this.offsetWidth = 0;
    const vars = {};
    this.style = { vars, setProperty: (k, v) => { vars[k] = v; } };
    const classes = new Set();
    this.classList = {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      toggle: (c, on = !classes.has(c)) => (on ? classes.add(c) : classes.delete(c), on),
      contains: (c) => classes.has(c),
    };
  }
  set innerHTML(html) {
    this.body = html.includes('tile-body') ? new FakeElement('span') : null;
    this.html = html;
  }
  get innerHTML() { return this.html ?? ''; }
  querySelector(sel) { return sel === '.tile-body' ? this.body : null; }
  closest(sel) { return sel === '.tile' && this.className === 'tile' ? this : null; }
  replaceChildren(...els) { this.children = els; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  dispatch(type, event) { for (const fn of this.listeners[type] ?? []) fn(event); }
}

let BoardView;
before(async () => {
  globalThis.document = { createElement: (tag) => new FakeElement(tag) };
  globalThis.ResizeObserver = class { observe() {} };
  globalThis.getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0' });
  ({ BoardView } = await import('../src/ui/boardView.js'));
});

function mountBoard({ width, height, layout = 'bridge', seed = 7, onTileClick = () => {} }) {
  const container = new FakeElement('main');
  container.clientWidth = width;
  container.clientHeight = height;
  const view = new BoardView(container, { onTileClick });
  const game = new Game(getLayout(layout), seed);
  view.mount(game, 'traditional');
  return { view, game, container };
}

const px = (v) => parseFloat(v);
const box = (view, slot) => {
  const el = view.els[slot.index];
  const tw = px(view.surface.style.vars['--tw']);
  const th = px(view.surface.style.vars['--th']);
  return { left: px(el.style.left), top: px(el.style.top), right: px(el.style.left) + tw, bottom: px(el.style.top) + th, z: Number(el.style.zIndex) };
};
const overlap = (a, b) => a.left < b.right - 0.01 && b.left < a.right - 0.01 && a.top < b.bottom - 0.01 && b.top < a.bottom - 0.01;

test('a wide screen draws the board as laid out', () => {
  const { view, game, container } = mountBoard({ width: 1200, height: 700 });
  assert.equal(view.rotated, false);
  assert.equal(container.classList.contains('rotated'), false);
  const [a, b] = game.slots.filter((s) => s.z === 0 && s.y === 0); // same row, left to right
  assert.ok(box(view, b).left > box(view, a).left);
  assert.equal(box(view, b).top, box(view, a).top);
});

test('a tall phone screen turns a wide board clockwise for bigger tiles', () => {
  const wide = mountBoard({ width: 390, height: 700 });
  const { view, game, container } = wide;
  assert.equal(view.rotated, true);
  assert.ok(container.classList.contains('rotated'));

  // Upright, the 12-tile-wide bridge would only get about 390 / 12.4 = 31px tiles.
  assert.ok(px(view.surface.style.vars['--tw']) > 40);

  // Clockwise: moving right in the layout moves down on screen; moving down moves left.
  const row0 = game.slots.filter((s) => s.z === 0 && s.y === 0);
  const [a, b] = [row0[0], row0[1]];
  assert.ok(box(view, b).top > box(view, a).top);
  assert.equal(box(view, b).left, box(view, a).left);
  const below = game.slots.find((s) => s.z === 0 && s.x === a.x && s.y === a.y + 2 * 3);
  assert.ok(box(view, below).left < box(view, a).left);
});

test('a square board stays upright even on a tall screen', () => {
  const { view } = mountBoard({ width: 390, height: 700, layout: 'pyramid' });
  assert.equal(view.rotated, false);
});

test('turning back to a wide screen restores the upright board', () => {
  const { view, container } = mountBoard({ width: 390, height: 700 });
  container.clientWidth = 1200;
  container.clientHeight = 700;
  view.layout();
  assert.equal(view.rotated, false);
  assert.equal(container.classList.contains('rotated'), false);
});

// The rails sit in a gap of --rail px outside the surface, on the sides the board's rows run along.
const railRoom = (view) => {
  const rail = px(view.surface.style.vars['--rail']);
  const w = px(view.surface.style.width) + (view.rotated ? 2 * rail : 0);
  const h = px(view.surface.style.height) + (view.rotated ? 0 : 2 * rail);
  return { rail, w, h };
};

test('the board draws two rails along its rows, out of the way of taps and screen readers', () => {
  const { view } = mountBoard({ width: 1200, height: 700 });
  const rails = view.surface.children.filter((el) => el.className.startsWith('board-rail'));
  assert.deepEqual(rails.map((el) => el.className), ['board-rail rail-start', 'board-rail rail-end']);
  for (const rail of rails) assert.equal(rail.getAttribute('aria-hidden'), 'true');
  assert.equal(view.surface.children.filter((el) => el.className === 'tile').length, view.game.slots.length);
  assert.ok(railRoom(view).rail > 0);
});

test('the gap between rails and tiles grows with the tiles', () => {
  const small = mountBoard({ width: 404, height: 364, layout: 'cross' }).view;
  const big = mountBoard({ width: 404, height: 752, layout: 'garden' }).view;
  const gap = (view) => railRoom(view).rail / px(view.surface.style.vars['--tw']);
  assert.ok(Math.abs(gap(small) - gap(big)) < 1e-9, 'same share of a tile');
  assert.ok(railRoom(big).rail > railRoom(small).rail);
  // A Garden board on an upright phone leaves clear space between tiles and rails.
  assert.ok(railRoom(big).rail >= 12, `gap is only ${railRoom(big).rail}px`);
});

test('a new game keeps the rails', () => {
  const { view } = mountBoard({ width: 1200, height: 700 });
  view.mount(new Game(getLayout('garden'), 3), 'traditional');
  assert.equal(view.surface.children.filter((el) => el.className.startsWith('board-rail')).length, 2);
});

for (const [name, size, rotated] of [
  ['upright board: rails above and below', { width: 1200, height: 700, layout: 'garden' }, false],
  ['turned board: rails left and right', { width: 390, height: 700, layout: 'garden' }, true],
  ['tight upright fit still leaves room for the rails', { width: 2000, height: 400, layout: 'garden' }, false],
  ['tight turned fit still leaves room for the rails', { width: 300, height: 2000, layout: 'garden' }, true],
]) {
  test(name, () => {
    const { view, container } = mountBoard(size);
    assert.equal(view.rotated, rotated);
    // CSS puts the rails on the left and right only when the container is marked rotated.
    assert.equal(container.classList.contains('rotated'), rotated);
    const { w, h } = railRoom(view);
    assert.ok(w <= size.width + 0.01, `board and rails are ${w}px wide`);
    assert.ok(h <= size.height + 0.01, `board and rails are ${h}px tall`);
  });
}

test('tiles never grow past the maximum size', () => {
  const { view } = mountBoard({ width: 5000, height: 4000 });
  assert.equal(px(view.surface.style.vars['--tw']), 84);
});

for (const [name, size] of [['upright', { width: 1200, height: 700 }], ['turned', { width: 390, height: 700 }]]) {
  test(`${name}: tiles fit the surface, never overlap on a layer, and stack in the right order`, () => {
    const { view, game } = mountBoard(size);
    const surfaceW = px(view.surface.style.width);
    const surfaceH = px(view.surface.style.height);
    const boxes = game.slots.map((s) => box(view, s));
    for (const b of boxes) {
      assert.ok(b.left >= -0.01 && b.top >= -0.01 && b.right <= surfaceW + 0.01 && b.bottom <= surfaceH + 0.01);
    }
    for (const s of game.slots) {
      for (const o of game.slots) {
        if (o.index <= s.index) continue;
        const [bs, bo] = [boxes[s.index], boxes[o.index]];
        if (o.z === s.z) assert.ok(!overlap(bs, bo), `slots ${s.index} and ${o.index} overlap`);
        // Higher layers are drawn on top of the tiles beneath them.
        else if (overlap(bs, bo)) assert.equal(o.z > s.z, bo.z > bs.z);
      }
    }
  });
}

for (const [name, size] of [['bridge turned', { width: 390, height: 700 }], ['pyramid', { width: 1200, height: 700, layout: 'pyramid' }]]) {
  test(`${name}: the board has no empty margin, so it centers and fills the screen`, () => {
    const { view, game } = mountBoard(size);
    const d = px(view.surface.style.vars['--d']);
    const boxes = game.slots.map((s) => box(view, s));
    const near = (a, b) => Math.abs(a - b) < 0.01;
    assert.ok(near(Math.min(...boxes.map((b) => b.left)), 0), 'left edge');
    assert.ok(near(Math.min(...boxes.map((b) => b.top)), 0), 'top edge');
    assert.ok(near(Math.max(...boxes.map((b) => b.right)) + d, px(view.surface.style.width)), 'right edge');
    assert.ok(near(Math.max(...boxes.map((b) => b.bottom)) + d, px(view.surface.style.height)), 'bottom edge');
  });
}

test('update marks free, blocked, selected and hinted tiles', () => {
  const { view, game } = mountBoard({ width: 1200, height: 700 });
  const free = game.freeIndices()[0];
  const blocked = game.slots.find((s) => !game.isFree(s.index)).index;
  const el = (i) => view.els[i];

  assert.ok(el(free).classList.contains('free'));
  assert.equal(el(free).tabIndex, 0);
  assert.ok(el(blocked).classList.contains('blocked'));
  assert.ok(el(blocked).classList.contains('dim'));
  assert.equal(el(blocked).getAttribute('aria-disabled'), 'true');
  assert.equal(el(blocked).tabIndex, -1);
  assert.ok(el(free).getAttribute('aria-label'));

  game.select(free);
  view.update({ hint: [blocked] });
  assert.ok(el(free).classList.contains('selected'));
  assert.equal(el(free).getAttribute('aria-pressed'), 'true');
  assert.ok(el(blocked).classList.contains('hint'));

  view.update({ highlightFree: false });
  assert.equal(el(blocked).classList.contains('dim'), false);
});

test('matched tiles animate out, and undo brings them back', () => {
  const { view, game } = mountBoard({ width: 1200, height: 700 });
  const [a, b] = game.hint();
  game.select(a);
  game.select(b);
  view.update();
  assert.ok(view.els[a].classList.contains('removing'));

  view.els[a].dispatch('animationend', { animationName: 'tile-remove' });
  assert.ok(view.els[a].classList.contains('gone'));

  game.undo();
  view.update();
  for (const i of [a, b]) {
    assert.equal(view.els[i].classList.contains('gone'), false);
    assert.equal(view.els[i].classList.contains('removing'), false);
  }
});

test('clicking a tile reports its slot index', () => {
  const clicks = [];
  const { view } = mountBoard({ width: 1200, height: 700, onTileClick: (i) => clicks.push(i) });
  view.surface.dispatch('click', { target: view.els[12] });
  view.surface.dispatch('click', { target: view.surface });
  assert.deepEqual(clicks, [12]);
});

test('changing the face set re-renders every face', () => {
  const { view } = mountBoard({ width: 1200, height: 700 });
  const before = view.els[0].body.innerHTML;
  view.setFaceSet('emoji');
  assert.notEqual(view.els[0].body.innerHTML, before);
});

// Pixel 7a: 1080×2400 screen at device pixel ratio 2.625, so pages get 412×915
// CSS px. Chrome's bars leave about 412×839, and the top bar takes 79 of that
// (upright) or 40 (sideways). Minus the board's 4px padding, that is the room below.
const PIXEL_7A = [['upright', { width: 404, height: 752 }], ['sideways', { width: 831, height: 364 }]];
for (const [orientation, size] of PIXEL_7A) {
  test(`Pixel 7a ${orientation}: every layout fits on screen with readable tiles`, async () => {
    const { LAYOUTS } = await import('../src/core/layouts.js');
    for (const layout of LAYOUTS) {
      const { view, game } = mountBoard({ ...size, layout: layout.id });
      const tw = px(view.surface.style.vars['--tw']);
      assert.ok(tw >= 26, `${layout.id}: tiles are only ${tw.toFixed(1)}px wide`);
      assert.ok(px(view.surface.style.width) <= size.width + 0.01, `${layout.id} is wider than the screen`);
      assert.ok(px(view.surface.style.height) <= size.height + 0.01, `${layout.id} is taller than the screen`);
      const room = railRoom(view);
      assert.ok(room.w <= size.width + 0.01 && room.h <= size.height + 0.01, `${layout.id}: rails are off screen`);
      for (const s of game.slots) {
        const b = box(view, s);
        assert.ok(b.left >= -0.01 && b.top >= -0.01 && b.right <= size.width + 0.01 && b.bottom <= size.height + 0.01,
          `${layout.id}: slot ${s.index} is off screen`);
      }
    }
  });
}
