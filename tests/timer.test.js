import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Timer, formatTime } from '../src/ui/timer.js';

test('formatTime renders m:ss', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(75), '1:15');
  assert.equal(formatTime(3600), '60:00');
});

test('timer accumulates only while running and ticks the display', (t) => {
  let now = 0;
  t.mock.method(performance, 'now', () => now);
  t.mock.timers.enable({ apis: ['setInterval'] });
  const ticks = [];
  const timer = new Timer((s) => ticks.push(s));
  assert.deepEqual(ticks, [0], 'reset reports 0 immediately');
  assert.equal(timer.running, false);

  timer.start();
  now = 2500;
  t.mock.timers.tick(250);
  assert.equal(ticks.at(-1), 2);
  timer.start(); // starting twice must not reset the start time
  assert.equal(timer.seconds, 2);

  timer.stop();
  now = 60_000; // paused time does not count
  assert.equal(timer.seconds, 2);
  const tickCount = ticks.length;
  t.mock.timers.tick(1000);
  assert.equal(ticks.length, tickCount, 'no ticks while stopped');

  timer.start();
  now = 61_000;
  assert.equal(timer.seconds, 3);

  timer.reset();
  assert.equal(timer.seconds, 0);
  assert.equal(timer.running, false);
  assert.equal(ticks.at(-1), 0);
});
