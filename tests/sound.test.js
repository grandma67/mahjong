import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sound, EFFECTS } from '../src/ui/sound.js';

/** Minimal Web Audio stand-in that records the oscillators it starts. */
function fakeAudio() {
  const started = [];
  const param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  class FakeContext {
    constructor() {
      FakeContext.instances++;
      this.currentTime = 10;
      this.state = 'suspended';
      this.destination = {};
    }
    resume() { this.state = 'running'; }
    createGain() { return { gain: param(), connect: (n) => n }; }
    createOscillator() {
      const osc = {
        frequency: param(),
        connect: (n) => n,
        start: (t) => started.push({ type: osc.type, t }),
        stop() {},
      };
      return osc;
    }
  }
  FakeContext.instances = 0;
  return { FakeContext, started };
}

test('match and error each play their own tones', () => {
  const { FakeContext, started } = fakeAudio();
  const sound = new Sound({ AudioContextImpl: FakeContext });
  sound.match();
  assert.equal(started.length, EFFECTS.match.length);
  assert.ok(started.every((s) => s.t >= 10), 'tones are scheduled from the current time');
  sound.error();
  assert.equal(started.length, EFFECTS.match.length + EFFECTS.error.length);
  assert.equal(FakeContext.instances, 1, 'one AudioContext is reused');
  assert.equal(sound.ctx.state, 'running', 'a suspended context is resumed');
});

test('the error sound is lower than the match sound', () => {
  const lowest = (name) => Math.min(...EFFECTS[name].map((t) => t.freq));
  assert.ok(Math.max(...EFFECTS.error.map((t) => t.freq)) < lowest('match'));
});

test('muted sound plays nothing', () => {
  const { FakeContext, started } = fakeAudio();
  const sound = new Sound({ enabled: false, AudioContextImpl: FakeContext });
  sound.match();
  sound.error();
  assert.equal(started.length, 0);
  assert.equal(FakeContext.instances, 0, 'no AudioContext is created while muted');
});

test('missing or failing Web Audio never throws', () => {
  assert.doesNotThrow(() => new Sound({ AudioContextImpl: undefined }).match());
  class Broken { constructor() { throw new Error('NotAllowedError'); } }
  assert.doesNotThrow(() => new Sound({ AudioContextImpl: Broken }).error());
});
