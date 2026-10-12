import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACES } from '../src/core/tiles.js';
import { renderFace, describeFace } from '../src/ui/faces/index.js';

for (const set of ['traditional', 'emoji']) {
  test(`face set "${set}" renders every face`, () => {
    const seen = new Set();
    for (const f of FACES) {
      const markup = renderFace(set, f.id);
      assert.match(markup, /^<svg[\s\S]*<\/svg>$/);
      assert.ok(!markup.includes('undefined'), `${f.id} rendered undefined`);
      seen.add(markup);
    }
    assert.equal(seen.size, FACES.length, 'every face must look distinct');
  });
}

test('faces have readable names', () => {
  assert.equal(describeFace('dots-3'), '3 of Dots');
  assert.equal(describeFace('wind-north'), 'North Wind');
  assert.equal(describeFace('flower-plum'), 'Plum (flower)');
});
