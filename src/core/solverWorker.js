/**
 * Runs the auto-solver off the main thread, so the board and the waiting
 * message stay smooth while it searches. Receives {geometry, tiles, budgetMs},
 * posts {type:'progress', nodes} now and then, and finally {type:'done', result}.
 */
import { solve } from './solver.js';

const PROGRESS_EVERY_MS = 150;

self.addEventListener('message', ({ data }) => {
  const { geometry, tiles, budgetMs } = data;
  let lastPost = 0;
  const result = solve(geometry, tiles, {
    deadline: Date.now() + budgetMs,
    onProgress(nodes) {
      const t = Date.now();
      if (t - lastPost < PROGRESS_EVERY_MS) return;
      lastPost = t;
      self.postMessage({ type: 'progress', nodes });
    },
  });
  self.postMessage({ type: 'done', result });
});
