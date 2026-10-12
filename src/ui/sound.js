/**
 * Sound effects, synthesized with the Web Audio API so there are no audio
 * files to download or precache. The AudioContext is created on first use,
 * which always happens inside a click, so browsers allow it to play.
 */

/** Each effect is a list of tones: frequency in Hz (optionally gliding to `to`), start and length in seconds. */
export const EFFECTS = Object.freeze({
  // Bright two-note chime, like two tiles clicking together.
  match: [
    { freq: 1318.5, type: 'triangle', start: 0, dur: 0.16, gain: 0.22 },
    { freq: 1975.5, type: 'triangle', start: 0.07, dur: 0.26, gain: 0.18 },
    { freq: 3951, type: 'sine', start: 0.07, dur: 0.12, gain: 0.04 },
  ],
  // Short, low, falling buzz.
  error: [
    { freq: 196, to: 130, type: 'square', start: 0, dur: 0.18, gain: 0.07 },
    { freq: 98, to: 82, type: 'sine', start: 0, dur: 0.2, gain: 0.18 },
  ],
});

export class Sound {
  constructor({ enabled = true, AudioContextImpl = globalThis.AudioContext ?? globalThis.webkitAudioContext } = {}) {
    this.enabled = enabled;
    this.AudioContextImpl = AudioContextImpl;
    this.ctx = null;
  }

  match() { this.play('match'); }

  error() { this.play('error'); }

  play(name) {
    if (!this.enabled || !this.AudioContextImpl) return;
    try {
      this.ctx ??= new this.AudioContextImpl();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      for (const tone of EFFECTS[name]) this.tone(now, tone);
    } catch {
      /* audio unavailable: play silently */
    }
  }

  tone(now, { freq, to, type, start, dur, gain }) {
    const { ctx } = this;
    const t0 = now + start;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    // Quick attack, exponential decay: a percussive, click-free envelope.
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}
