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

function mountBoard({ width, height, layout = 'turtle', seed = 7, onTileClick = () => {} }) {
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

  // Upright, the 15-tile-wide turtle would only get about 390 / 15.65 = 25px tiles.
  assert.ok(px(view.surface.style.vars['--tw']) > 30);

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
