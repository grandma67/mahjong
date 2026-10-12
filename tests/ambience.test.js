import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EFFECTS } from '../src/ui/ambience.js';
import { THEMES, ambienceFor } from '../src/ui/themes.js';

/** Records draw calls; just enough of CanvasRenderingContext2D for the effects. */
function fakeCtx() {
  const calls = { fill: 0, stroke: 0, text: 0 };
  const gradient = { addColorStop() {} };
  const noop = () => {};
  return {
    calls,
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
    beginPath: noop, arc: noop, moveTo: noop, lineTo: noop, quadraticCurveTo: noop,
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    fill: () => calls.fill++,
    stroke: () => calls.stroke++,
    fillText: () => calls.text++,
  };
}

test('every theme picks a known effect and real token colors', () => {
  const kinds = new Set();
  for (const t of THEMES) {
    assert.ok(EFFECTS[t.ambience.kind], `${t.id}: unknown effect ${t.ambience.kind}`);
    const { colors } = ambienceFor(t);
    assert.ok(colors.length > 0);
    colors.forEach((c, i) => assert.ok(c, `${t.id}: token ${t.ambience.colors[i]} does not exist`));
    kinds.add(t.ambience.kind);
  }
  assert.equal(kinds.size, THEMES.length, 'each theme has its own effect');
});

for (const [kind, effect] of Object.entries(EFFECTS)) {
  test(`effect "${kind}" spawns on screen, animates, stays near the screen and draws`, () => {
    const w = 800;
    const h = 600;
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const particles = Array.from({ length: 40 }, () => ({ ...effect.spawn({}, w, h, rand), color: '#fff' }));
    for (const p of particles) {
      assert.ok(p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h, `spawned off screen at ${p.x},${p.y}`);
    }
    const before = JSON.stringify(particles);
    for (let frame = 0; frame < 600; frame++) {
      for (const p of particles) effect.step(p, 1 / 60, w, h, frame / 60);
    }
    assert.notEqual(JSON.stringify(particles), before, 'particles move');
    for (const p of particles) {
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
      if (!p.shoot) assert.ok(p.x > -w && p.x < 2 * w && p.y > -h && p.y < 2 * h, 'particles wrap around');
    }

    const ctx = fakeCtx();
    for (const p of particles) effect.draw(ctx, p, 1);
    assert.ok(ctx.calls.fill + ctx.calls.stroke + ctx.calls.text >= particles.length);
  });
}
