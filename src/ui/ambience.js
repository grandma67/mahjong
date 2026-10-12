/**
 * Animated background: a full-screen canvas of drifting particles whose
 * style comes from the active theme (petals for Sakura, stars for Midnight,
 * embers for Imperial Ember, ...).
 *
 * Each effect is data plus three small functions: `spawn` places a particle,
 * `step` moves it, and `draw` paints it. Particles that leave the screen are
 * respawned, so the count stays constant. When the user prefers reduced
 * motion, a single still frame is drawn instead of an animation.
 */

const TAU = Math.PI * 2;

/** Wraps a particle back to the opposite edge once it has left the screen. */
function wrap(p, w, h, m = 40) {
  if (p.y < -m) p.y = h + m;
  else if (p.y > h + m) p.y = -m;
  if (p.x < -m) p.x = w + m;
  else if (p.x > w + m) p.x = -m;
}

function glowDot(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export const EFFECTS = Object.freeze({
  /** Soft glowing dust rising slowly and twinkling. */
  motes: {
    density: 0.00009,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 6 + r() * 14, v: 6 + r() * 14, ph: r() * TAU }),
    step: (p, dt, w, h, t) => {
      p.y -= p.v * dt;
      p.x += Math.sin(t * 0.4 + p.ph) * 8 * dt;
      wrap(p, w, h);
    },
    draw: (ctx, p, t) => glowDot(ctx, p.x, p.y, p.s, p.color, 0.25 + 0.25 * Math.sin(t * 1.5 + p.ph)),
  },

  /** Twinkling star field with the occasional shooting star. */
  stars: {
    density: 0.00022,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 0.5 + r() * 1.4, ph: r() * TAU, tw: 0.6 + r() * 2, shoot: r() < 0.02 }),
    step: (p, dt, w, h) => {
      if (!p.shoot) return;
      p.x += 520 * dt;
      p.y += 220 * dt;
      if (p.x > w + 200 || p.y > h + 200) Object.assign(p, { x: -200 - Math.random() * w * 3, y: Math.random() * h * 0.5 });
    },
    draw: (ctx, p, t) => {
      if (p.shoot) {
        const g = ctx.createLinearGradient(p.x - 90, p.y - 38, p.x, p.y);
        g.addColorStop(0, 'transparent');
        g.addColorStop(1, p.color);
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 90, p.y - 38);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        return;
      }
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * p.tw + p.ph));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, TAU);
      ctx.fill();
    },
  },

  /** Falling, swaying, tumbling petals. */
  petals: {
    density: 0.00005,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 5 + r() * 6, v: 25 + r() * 35, ph: r() * TAU, rot: r() * TAU, spin: (r() - 0.5) * 2 }),
    step: (p, dt, w, h, t) => {
      p.y += p.v * dt;
      p.x += (Math.sin(t * 0.8 + p.ph) * 30 + 12) * dt;
      p.rot += p.spin * dt;
      wrap(p, w, h);
    },
    draw: (ctx, p, t) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.sin(t * 2 + p.ph)); // tumbling
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.quadraticCurveTo(p.s, 0, 0, p.s);
      ctx.quadraticCurveTo(-p.s, 0, 0, -p.s);
      ctx.fill();
      ctx.restore();
    },
  },

  /** Bubbles wobbling up through the water. */
  bubbles: {
    density: 0.00006,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 2 + r() * 9, v: 20 + r() * 45, ph: r() * TAU }),
    step: (p, dt, w, h, t) => {
      p.y -= p.v * dt;
      p.x += Math.sin(t * 2 + p.ph) * 14 * dt;
      wrap(p, w, h);
    },
    draw: (ctx, p) => {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.22, 0, TAU);
      ctx.fill();
    },
  },

  /** Flickering sparks rising from below. */
  embers: {
    density: 0.0001,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 1 + r() * 2.5, v: 30 + r() * 70, ph: r() * TAU }),
    step: (p, dt, w, h, t) => {
      p.y -= p.v * dt;
      p.x += Math.sin(t * 3 + p.ph) * 20 * dt;
      wrap(p, w, h);
    },
    draw: (ctx, p, t) => {
      const flicker = 0.5 + 0.5 * Math.sin(t * 9 + p.ph);
      glowDot(ctx, p.x, p.y, p.s * 5, p.color, 0.18 + 0.2 * flicker);
      ctx.globalAlpha = 0.6 + 0.4 * flicker;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, TAU);
      ctx.fill();
    },
  },

  /** Neon light streaks racing along the grid lines. */
  neon: {
    density: 0.00003,
    spawn: (p, w, h, r) => {
      const horizontal = r() < 0.5;
      return Object.assign(p, {
        horizontal,
        x: horizontal ? r() * w : Math.round((r() * w) / 32) * 32,
        y: horizontal ? Math.round((r() * h) / 32) * 32 : r() * h,
        v: (120 + r() * 220) * (r() < 0.5 ? -1 : 1),
        len: 40 + r() * 120,
      });
    },
    step: (p, dt, w, h) => {
      if (p.horizontal) p.x += p.v * dt;
      else p.y += p.v * dt;
      wrap(p, w, h, 200);
    },
    draw: (ctx, p) => {
      const dx = p.horizontal ? -Math.sign(p.v) * p.len : 0;
      const dy = p.horizontal ? 0 : -Math.sign(p.v) * p.len;
      const g = ctx.createLinearGradient(p.x + dx, p.y + dy, p.x, p.y);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, p.color);
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(p.x + dx, p.y + dy);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
  },

  /** Butterflies fluttering on lazy curves. */
  butterflies: {
    density: 0.000015,
    spawn: (p, w, h, r) => Object.assign(p, { x: r() * w, y: r() * h, s: 16 + r() * 10, ph: r() * TAU, vx: (r() < 0.5 ? -1 : 1) * (15 + r() * 25) }),
    step: (p, dt, w, h, t) => {
      p.x += p.vx * dt;
      p.y += Math.sin(t * 0.9 + p.ph) * 22 * dt;
      wrap(p, w, h);
    },
    draw: (ctx, p, t) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale((p.vx < 0 ? 1 : -1) * (0.35 + 0.65 * Math.abs(Math.sin(t * 7 + p.ph))), 1); // wing flaps
      ctx.globalAlpha = 0.8;
      ctx.font = `${p.s}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦋', 0, 0);
      ctx.restore();
    },
  },
});

const MAX_PARTICLES = 160;

export class Ambience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{reducedMotion?: boolean}} opts
   */
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reducedMotion = reducedMotion;
    this.particles = [];
    this.frame = null;
    this.last = 0;
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => (document.hidden ? this.pause() : this.play()));
  }

  /** @param {{kind: string, colors: string[]}} config  colors are already resolved CSS colors */
  setEffect({ kind, colors }) {
    this.effect = EFFECTS[kind];
    this.colors = colors;
    this.resize();
    this.play();
  }

  resize() {
    if (!this.effect) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(MAX_PARTICLES, Math.max(8, Math.round(w * h * this.effect.density)));
    this.particles = Array.from({ length: count }, (_, i) => {
      const p = this.effect.spawn({}, w, h, Math.random);
      p.color = this.colors[i % this.colors.length];
      return p;
    });
    if (this.reducedMotion) this.draw(0);
  }

  play() {
    if (this.reducedMotion || this.frame != null || !this.effect || document.hidden) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.loop);
  }

  pause() {
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /** Turns the effect off until the next setEffect(). */
  stop() {
    this.pause();
    this.effect = null;
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.1); // don't jump after a stall
    this.last = now;
    const t = now / 1000;
    for (const p of this.particles) this.effect.step(p, dt, this.w, this.h, t);
    this.draw(t);
    this.frame = requestAnimationFrame(this.loop);
  }

  draw(t) {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    for (const p of this.particles) this.effect.draw(ctx, p, t);
    ctx.globalAlpha = 1;
  }
}
