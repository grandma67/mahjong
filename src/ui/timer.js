/** Game clock that can be paused, e.g. while the tab is hidden or a dialog is open. */
export class Timer {
  constructor(onTick) {
    this.onTick = onTick;
    this.reset();
  }

  reset() {
    this.stop();
    this.elapsedMs = 0;
    this.startedAt = null;
    this.onTick(0);
  }

  get running() {
    return this.startedAt != null;
  }

  get seconds() {
    const live = this.running ? performance.now() - this.startedAt : 0;
    return Math.floor((this.elapsedMs + live) / 1000);
  }

  start() {
    if (this.running) return;
    this.startedAt = performance.now();
    this.interval = setInterval(() => this.onTick(this.seconds), 250);
  }

  stop() {
    if (this.running) this.elapsedMs += performance.now() - this.startedAt;
    this.startedAt = null;
    clearInterval(this.interval);
  }
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
