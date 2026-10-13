/**
 * App controller: connects the game model, the board view, the toolbar,
 * dialogs, keyboard shortcuts and persistence.
 */
import { Game, STATUS } from './core/game.js';
import { SOLVE } from './core/solver.js';
import { LAYOUTS, getLayout } from './core/layouts.js';
import { randomSeed } from './core/rng.js';
import { BoardView } from './ui/boardView.js';
import { THEMES, getTheme, applyTheme, themeStyle, ambienceFor } from './ui/themes.js';
import { renderFace } from './ui/faces/index.js';
import { loadPrefs, savePrefs } from './ui/storage.js';
import { Timer, formatTime } from './ui/timer.js';
import { Sound } from './ui/sound.js';
import { Ambience } from './ui/ambience.js';
import { registerServiceWorker, setupInstall } from './pwa.js';

const $ = (sel) => document.querySelector(sel);

const prefs = loadPrefs();
let game;
let theme = getTheme(prefs.themeId);

const view = new BoardView($('#board'), { onTileClick: handleTileClick });
const timer = new Timer((s) => { $('#stat-time').textContent = formatTime(s); });
const sound = new Sound({ enabled: prefs.sound });
const ambience = new Ambience($('#ambience'), {
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
});

// ---- Game lifecycle --------------------------------------------------------

/** A deal is shareable via the URL hash: #<layout>-<seed>. */
function readHash() {
  const m = location.hash.match(/^#([a-z]+)-(\d+)$/);
  return m ? { layoutId: m[1], seed: Number(m[2]) } : null;
}

function startGame(layoutId, seed = randomSeed()) {
  stopSolver();
  const layout = getLayout(layoutId);
  game = new Game(layout, seed);
  prefs.layoutId = layout.id;
  savePrefs(prefs);
  history.replaceState(null, '', `#${layout.id}-${seed}`);
  $('#game-no').textContent = `${layout.name} #${seed}`;
  timer.reset();
  view.mount(game, theme.faceSet);
  refresh();
}

function refresh(hint = []) {
  view.update({ hint, highlightFree: prefs.highlightFree });
  $('#stat-tiles').textContent = game.tilesLeft;
  $('#stat-moves').textContent = game.availableMatches().length;
  $('[data-action="undo"]').disabled = game.history.length === 0;
}

function handleTileClick(index) {
  if (game.status === STATUS.WON) return;
  stopSolver({ announce: true });
  const result = game.select(index);
  if (result.type === 'ignored') return;
  timer.start();

  if (result.type === 'match') sound.match();
  else if (result.type === 'blocked' || result.type === 'mismatch') sound.error();

  if (result.type === 'blocked') {
    view.flash(result.indices, 'shake');
    const sides = view.rotated ? 'top or bottom' : 'left or right';
    toast(`That tile is blocked: it needs a free ${sides} side and nothing on top.`);
  } else if (result.type === 'mismatch') {
    view.flash([result.indices[0]], 'shake');
  } else if (result.type === 'select') {
    view.flash(result.indices, 'pop');
  }
  refresh();
  if (result.type === 'match') checkEnd();
}

function checkEnd() {
  const status = game.status;
  if (status === STATUS.WON) {
    timer.stop();
    recordWin();
  } else if (status === STATUS.STUCK && !game.canBeCleared()) {
    showResult({
      title: 'Dead end',
      text: `The ${game.tilesLeft} tiles left are stacked so they can never all be removed, so shuffling won't help. Undo a few moves to find another way.`,
      actions: [
        ['Undo', () => doUndo(), true],
        ['New game', () => startGame(game.layout.id)],
      ],
    });
  } else if (status === STATUS.STUCK) {
    showResult({
      title: 'No moves left',
      text: `There are no free matching pairs among the ${game.tilesLeft} remaining tiles.`,
      actions: [
        ['Shuffle', () => doShuffle(), true],
        ['Undo', () => doUndo()],
        ['New game', () => startGame(game.layout.id)],
      ],
    });
  }
}

function recordWin() {
  const seconds = timer.seconds;
  if (game.autoSolved) {
    return showResult({
      title: '🤖 Board cleared!',
      text: `The auto-solver finished ${game.layout.name}. Best times only count boards you clear yourself, so try this deal again on your own?`,
      actions: [
        ['Play again', () => startGame(game.layout.id, game.seed), true],
        ['New game', () => startGame(randomLayoutId(game.layout.id))],
      ],
    });
  }
  const id = game.layout.id;
  const best = prefs.bestTimes[id];
  const isBest = best == null || seconds < best;
  if (isBest) prefs.bestTimes[id] = seconds;
  savePrefs(prefs);

  const extras = [
    game.shuffles ? `${game.shuffles} shuffle${game.shuffles > 1 ? 's' : ''}` : null,
    game.hintsUsed ? `${game.hintsUsed} hint${game.hintsUsed > 1 ? 's' : ''}` : null,
  ].filter(Boolean);
  showResult({
    title: '🎉 Board cleared!',
    text:
      `You finished ${game.layout.name} in ${formatTime(seconds)}` +
      (extras.length ? ` with ${extras.join(' and ')}.` : '.') +
      (isBest ? ' That is a new best time!' : ` Best: ${formatTime(best)}.`),
    actions: [
      ['Play again', () => startGame(game.layout.id), true],
      ['New game', () => startGame(randomLayoutId(game.layout.id))],
    ],
  });
}

/** Picks a random layout, avoiding the current one when there is a choice. */
function randomLayoutId(currentId) {
  const others = LAYOUTS.filter((l) => l.id !== currentId);
  const pool = others.length ? others : LAYOUTS;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

// ---- Toolbar actions -------------------------------------------------------

function doUndo() {
  stopSolver({ announce: true });
  if (!game.undo()) return toast('Nothing to undo.');
  refresh();
}

function doHint() {
  if (game.status === STATUS.WON) return;
  stopSolver({ announce: true });
  const pair = game.hint();
  if (!pair) return toast('No moves left. Try Shuffle or Undo.');
  game.selected = null;
  refresh(pair);
}

function doShuffle() {
  stopSolver({ announce: true });
  if (game.tilesLeft && !game.canBeCleared()) {
    return toast("Shuffling can't help here: the tiles left can never all be removed. Try Undo.");
  }
  if (!game.shuffle()) return;
  timer.start();
  toast('Remaining tiles shuffled.');
  refresh();
}

const ACTIONS = {
  new: () => startGame(game.layout.id),
  restart: () => startGame(game.layout.id, game.seed),
  undo: doUndo,
  hint: doHint,
  shuffle: doShuffle,
  solve: toggleSolver,
  mute: () => setSound(!prefs.sound),
  settings: () => {
    syncSettings();
    openDialog('#settings-dialog');
  },
  help: () => openDialog('#help-dialog'),
  install: setupInstall($('[data-action="install"]')),
};

document.querySelector('.actions').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn) ACTIONS[btn.dataset.action]();
});

document.addEventListener('keydown', (e) => {
  if (document.querySelector('dialog[open]')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    return doUndo();
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = { h: 'hint', u: 'undo', s: 'shuffle', a: 'solve', n: 'new', r: 'restart', m: 'mute', '?': 'help' }[e.key.toLowerCase()];
  if (key) ACTIONS[key]();
  else if (e.key === 'Escape' && solving) stopSolver({ announce: true });
  else if (e.key === 'Escape' && game.selected != null) {
    game.selected = null;
    refresh();
  }
});

// ---- Auto-solver -----------------------------------------------------------

/** The search may take at most this long, worker start-up included. */
const SOLVE_BUDGET_MS = 10_000;
const SOLVE_PANEL_DELAY_MS = 150;
/** Playback pace: each pair glows like a hint for a while, then is removed. */
const SOLVE_HINT_MS = 800;
const SOLVE_GAP_MS = 250;

/** The running solver: {phase:'searching'|'playing', stop()}, or null when idle. */
let solving = null;

function toggleSolver() {
  if (solving) return stopSolver({ announce: true });
  if (game.status === STATUS.WON) return;
  searchForSolution();
}

/** Cancels a search or a playback in progress. */
function stopSolver({ announce = false } = {}) {
  if (!solving) return;
  const { phase } = solving;
  solving.stop();
  solving = null;
  syncSolveButton();
  refresh();
  if (announce) toast(phase === 'searching' ? 'Search cancelled.' : 'Auto-solver stopped.');
}

function syncSolveButton() {
  const btn = $('[data-action="solve"]');
  const on = solving != null;
  btn.setAttribute('aria-pressed', String(on));
  btn.title = on ? 'Stop the auto-solver (A)' : 'Auto-solve: watch the board being cleared (A)';
  btn.querySelector('use').setAttribute('href', on ? '#i-stop' : '#i-solve');
  btn.querySelector('span').textContent = on ? 'Stop' : 'Solve';
}

/** Searches in a Web Worker so the page stays responsive, and gives up after SOLVE_BUDGET_MS. */
function searchForSolution() {
  game.selected = null;
  refresh();
  let worker;
  try {
    worker = new Worker(new URL('./core/solverWorker.js', import.meta.url), { type: 'module' });
  } catch {
    return toast("The auto-solver can't run in this browser.");
  }

  const startedAt = Date.now();
  let nodes = 0;
  const panel = $('#solver-panel');
  const detail = $('#solver-detail');
  const showProgress = () => {
    const secondsLeft = Math.max(0, Math.ceil((SOLVE_BUDGET_MS - (Date.now() - startedAt)) / 1000));
    detail.textContent = nodes
      ? `${nodes.toLocaleString()} positions explored · ${secondsLeft}s left`
      : `Thinking through the ${game.tilesLeft} tiles left · ${secondsLeft}s left`;
  };
  const ticker = setInterval(showProgress, 250);
  const deadline = setTimeout(() => finish({ status: SOLVE.TIMEOUT, nodes }), SOLVE_BUDGET_MS);
  // Most boards solve in a blink: only show the waiting panel if the search takes a while.
  const reveal = setTimeout(() => {
    const meter = $('#solver-meter');
    meter.style.animation = 'none';
    void meter.offsetWidth; // restart the countdown bar
    meter.style.animation = '';
    meter.style.animationDuration = `${SOLVE_BUDGET_MS}ms`;
    meter.style.animationDelay = `${startedAt - Date.now()}ms`;
    showProgress();
    panel.hidden = false;
    document.documentElement.classList.add('solver-searching');
  }, SOLVE_PANEL_DELAY_MS);

  const run = {
    phase: 'searching',
    stop() {
      clearInterval(ticker);
      clearTimeout(deadline);
      clearTimeout(reveal);
      worker.terminate();
      panel.hidden = true;
      document.documentElement.classList.remove('solver-searching');
    },
  };
  solving = run;
  syncSolveButton();

  function finish(result) {
    if (solving !== run) return;
    run.stop();
    solving = null;
    syncSolveButton();
    showSolveResult(result);
  }

  worker.addEventListener('message', ({ data }) => {
    if (data.type === 'progress') nodes = data.nodes;
    else finish(data.result);
  });
  worker.addEventListener('error', (e) => {
    e.preventDefault();
    if (solving !== run) return;
    stopSolver();
    toast("The auto-solver can't run in this browser.");
  });
  // Leave the worker a little time to report back before the hard deadline.
  worker.postMessage({ geometry: game.geometry, tiles: game.tiles, budgetMs: SOLVE_BUDGET_MS - 400 });
}

function showSolveResult(result) {
  const left = game.tilesLeft;
  const fixes = [
    ['Undo', () => doUndo()],
    ...(game.canBeCleared() ? [['Shuffle', () => doShuffle()]] : []),
  ];
  if (result.status === SOLVE.SOLVED) {
    toast(`Solution found: ${result.moves.length} moves. Press Solve again to stop.`);
    return playSolution(result.moves);
  }
  if (result.status === SOLVE.UNSOLVABLE) {
    return showResult({
      title: 'No solution from here',
      text: `The auto-solver checked every way to play the ${left} tiles left: they can't all be cleared as they lie now. Undo a few moves, or shuffle the tiles left.`,
      actions: [...fixes.map(([label, fn], i) => [label, fn, i === 0]), ['Keep playing', () => {}]],
    });
  }
  showResult({
    title: "⏳ Time's up",
    text: `The auto-solver explored ${result.nodes.toLocaleString()} positions in ${SOLVE_BUDGET_MS / 1000} seconds without finding a way to clear the ${left} tiles left. There may be no solution, or it is buried too deep. Try a few moves, Undo or Shuffle, then solve again.`,
    actions: [['Keep playing', () => {}, true], ...fixes],
  });
}

/** Plays the moves one pair at a time, highlighting each pair like a hint before removing it. */
function playSolution(moves) {
  let pending;
  const run = { phase: 'playing', stop: () => clearTimeout(pending) };
  solving = run;
  syncSolveButton();
  timer.start();

  let next = 0;
  const step = () => {
    if (solving !== run) return;
    const [a, b] = moves[next];
    if (!game.isFree(a) || !game.isFree(b)) {
      stopSolver();
      return toast('The board changed, so the auto-solver stopped.');
    }
    refresh([a, b]);
    pending = setTimeout(() => {
      game.removePair(a, b);
      game.autoSolved = true;
      sound.match();
      next++;
      if (next < moves.length) {
        refresh();
        pending = setTimeout(step, SOLVE_GAP_MS);
        return;
      }
      solving = null;
      syncSolveButton();
      refresh();
      checkEnd();
    }, SOLVE_HINT_MS);
  };
  step();
}

$('#solver-cancel').addEventListener('click', () => stopSolver({ announce: true }));

// ---- Dialogs ---------------------------------------------------------------

function openDialog(sel) {
  const dialog = $(sel);
  const wasRunning = timer.running;
  timer.stop();
  dialog.addEventListener('close', () => { if (wasRunning && game.status !== STATUS.WON) timer.start(); }, { once: true });
  dialog.showModal();
}

/** @param {{title:string, text:string, actions:Array<[string, Function, boolean?]>}} opts */
function showResult({ title, text, actions }) {
  $('#result-title').textContent = title;
  $('#result-text').textContent = text;
  $('#result-actions').replaceChildren(
    ...actions.map(([label, fn, primary]) => {
      const b = document.createElement('button');
      b.value = label;
      b.textContent = label;
      if (primary) b.className = 'primary';
      b.addEventListener('click', () => setTimeout(fn));
      return b;
    }),
  );
  openDialog('#result-dialog');
}

function choiceButton({ value, onSelect, html, className = '' }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `choice ${className}`;
  b.dataset.value = value;
  b.setAttribute('role', 'radio');
  b.innerHTML = html;
  b.addEventListener('click', () => {
    onSelect();
    syncSettings();
  });
  return b;
}

/** Marks the current layout and theme in the settings dialog. */
function syncSettings() {
  const mark = (container, current) =>
    container.querySelectorAll('.choice').forEach((c) => c.setAttribute('aria-checked', String(c.dataset.value === current)));
  mark($('#layout-list'), game.layout.id);
  mark($('#theme-grid'), theme.id);
}

function buildSettings() {
  const layoutList = $('#layout-list');
  layoutList.setAttribute('role', 'radiogroup');
  layoutList.replaceChildren(
    ...LAYOUTS.map((l) =>
      choiceButton({
        value: l.id,
        html: `<strong>${l.name}</strong><small>${l.slots.length} tiles · ${l.difficulty}</small>`,
        onSelect: () => startGame(l.id),
      }),
    ),
  );

  const sampleFaces = ['dots-5', 'dragon-red', 'bamboo-1'];
  const themeGrid = $('#theme-grid');
  themeGrid.setAttribute('role', 'radiogroup');
  themeGrid.replaceChildren(
    ...THEMES.map((t) => {
      const card = choiceButton({
        value: t.id,
        className: 'theme-card',
        html:
          `<span class="swatch">${sampleFaces.map((f) => `<span class="mini">${renderFace(t.faceSet, f)}</span>`).join('')}</span>` +
          `<span class="name"><strong>${t.name}</strong></span>`,
        onSelect: () => setTheme(t.id),
      });
      card.querySelector('.swatch').style.cssText = themeStyle(t);
      return card;
    }),
  );

  const highlight = $('#opt-highlight');
  highlight.checked = prefs.highlightFree;
  highlight.addEventListener('change', () => {
    prefs.highlightFree = highlight.checked;
    savePrefs(prefs);
    refresh();
  });

  const index = $('#opt-index');
  index.checked = prefs.showIndex;
  index.addEventListener('change', () => {
    prefs.showIndex = index.checked;
    savePrefs(prefs);
    applyIndexPref();
  });

  const soundOpt = $('#opt-sound');
  soundOpt.addEventListener('change', () => setSound(soundOpt.checked));
  setSound(prefs.sound);

  const ambienceOpt = $('#opt-ambience');
  ambienceOpt.checked = prefs.ambience;
  ambienceOpt.addEventListener('change', () => {
    prefs.ambience = ambienceOpt.checked;
    savePrefs(prefs);
    applyAmbiencePref();
  });
}

/** Turns sound effects on or off, keeping the toolbar button and the settings checkbox in sync. */
function setSound(on) {
  prefs.sound = sound.enabled = on;
  savePrefs(prefs);
  $('#opt-sound').checked = on;
  const btn = $('[data-action="mute"]');
  btn.setAttribute('aria-pressed', String(!on));
  btn.title = on ? 'Mute sounds (M)' : 'Unmute sounds (M)';
  btn.querySelector('use').setAttribute('href', on ? '#i-sound' : '#i-mute');
  btn.querySelector('span').textContent = on ? 'Sound' : 'Muted';
}

function setTheme(id) {
  const previousFaceSet = theme.faceSet;
  theme = getTheme(id);
  applyTheme(theme);
  prefs.themeId = theme.id;
  savePrefs(prefs);
  if (game && theme.faceSet !== previousFaceSet) view.setFaceSet(theme.faceSet);
  applyAmbiencePref();
}

function applyAmbiencePref() {
  document.documentElement.classList.toggle('no-ambience', !prefs.ambience);
  if (prefs.ambience) ambience.setEffect(ambienceFor(theme));
  else ambience.stop();
}

function applyIndexPref() {
  document.documentElement.classList.toggle('show-index', prefs.showIndex);
}

// ---- Toast -----------------------------------------------------------------

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---- Boot ------------------------------------------------------------------

document.addEventListener('visibilitychange', () => {
  if (document.hidden) timer.stop();
});

window.addEventListener('hashchange', () => {
  const h = readHash();
  if (h && (h.seed !== game.seed || h.layoutId !== game.layout.id)) startGame(h.layoutId, h.seed);
});

registerServiceWorker();
setTheme(theme.id);
applyIndexPref();
const fromHash = readHash();
startGame(fromHash?.layoutId ?? prefs.layoutId, fromHash?.seed);
buildSettings();
if (!prefs.seenHelp) {
  prefs.seenHelp = true;
  savePrefs(prefs);
  openDialog('#help-dialog');
}

// Tells the start-up safety net in index.html that the app is running.
document.documentElement.dataset.app = 'ready';
