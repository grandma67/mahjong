import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUTS, getLayout, layoutsBySize, DEFAULT_LAYOUT_ID } from '../src/core/layouts.js';
import { buildGeometry, isFree, bounds } from '../src/core/board.js';

test('the default layout uses the full 144-tile set', () => {
  assert.equal(getLayout(DEFAULT_LAYOUT_ID).slots.length, 144);
});

test('unknown layout ids fall back to the default', () => {
  assert.equal(getLayout('nope').id, DEFAULT_LAYOUT_ID);
  assert.equal(getLayout('turtle').id, DEFAULT_LAYOUT_ID, 'old links and saved prefs still load');
});

for (const layout of LAYOUTS) {
  test(`layout "${layout.id}" is well formed`, () => {
    const { slots } = layout;
    assert.equal(slots.length % 2, 0, 'needs an even number of tiles');
    assert.ok(slots.length <= 288, 'fits in two tile sets');

    for (const a of slots) {
      for (const b of slots) {
        if (a === b || a.z !== b.z) continue;
        const clash = Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
        assert.ok(!clash, `overlap at z${a.z} (${a.x},${a.y}) / (${b.x},${b.y})`);
      }
      if (a.z > 0) {
        const supported = slots.some(
          (b) => b.z === a.z - 1 && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2,
        );
        assert.ok(supported, `floating tile at z${a.z} (${a.x},${a.y})`);
      }
    }
  });
}

test('free-tile rule: blocked on both sides or covered means not free', () => {
  // Three in a row with one tile stacked on the middle.
  const slots = [
    { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 4, y: 0, z: 0 },
    { x: 2, y: 0, z: 1 },
  ].map((s, index) => ({ ...s, index }));
  const geo = buildGeometry(slots);
  const all = () => true;
  assert.ok(isFree(geo, 0, all), 'left end is free');
  assert.ok(isFree(geo, 2, all), 'right end is free');
  assert.ok(!isFree(geo, 1, all), 'middle is blocked');
  assert.ok(isFree(geo, 3, all), 'top tile is free');

  const withoutTop = (i) => i !== 3;
  assert.ok(!isFree(geo, 1, withoutTop), 'middle still flanked on both sides');
  const withoutTopAndLeft = (i) => i !== 3 && i !== 0;
  assert.ok(isFree(geo, 1, withoutTopAndLeft));
});

test('half-offset tiles block neighbours they partially overlap', () => {
  const slots = [
    { x: 0, y: 1, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 0, z: 0 },
  ].map((s, index) => ({ ...s, index }));
  const geo = buildGeometry(slots);
  assert.deepEqual(geo[0].right.sort(), [1, 2]);
  assert.deepEqual(geo[1].left, [0]);
});

test('layout ids are unique and every layout has a name and difficulty', () => {
  assert.equal(new Set(LAYOUTS.map((l) => l.id)).size, LAYOUTS.length);
  for (const l of LAYOUTS) {
    assert.ok(l.name && l.difficulty, l.id);
    l.slots.forEach((s, i) => assert.equal(s.index, i, `${l.id} slot ${i} has the wrong index`));
  }
});

test('bounds covers the whole layout in half-tile units', () => {
  const slots = [{ x: 0, y: 0, z: 0 }, { x: 6, y: 3, z: 0 }, { x: 2, y: 1, z: 2 }];
  assert.deepEqual(bounds(slots), { width: 8, height: 5, layers: 3 });
  assert.deepEqual(bounds(getLayout('pyramid').slots), { width: 16, height: 16, layers: 4 });
});

test('the 144- and 288-tile shapes are 8 by 12 tiles (or 12 by 8) to fit a phone', () => {
  const sizes = {
    towers: 144, rhombus: 144, pagoda: 144, dragon: 144,
    ziggurat: 288, volcano: 288, temple: 288, wall: 288,
  };
  for (const [id, count] of Object.entries(sizes)) {
    const layout = getLayout(id);
    assert.equal(layout.id, id);
    assert.equal(layout.slots.length, count, id);
    const { width, height } = bounds(layout.slots);
    assert.deepEqual([width / 2, height / 2].sort((a, b) => a - b), [8, 12], id);
  }
});

test('the settings menu lists layouts by tile count, then by name', () => {
  const sorted = layoutsBySize();
  assert.equal(sorted.length, LAYOUTS.length);
  for (let i = 1; i < sorted.length; i++) {
    const [a, b] = [sorted[i - 1], sorted[i]];
    const inOrder = a.slots.length < b.slots.length
      || (a.slots.length === b.slots.length && a.name.localeCompare(b.name) <= 0);
    assert.ok(inOrder, `${a.name} (${a.slots.length}) comes before ${b.name} (${b.slots.length})`);
  }
  const ties = sorted.filter((l) => l.slots.length === 144).map((l) => l.name);
  assert.deepEqual(ties, ['Dragon', 'Owl', 'Pagoda', 'Rhombus', 'Two Towers']);
});
