# 🀄 Mahjong Solitaire

A themeable Mahjong Solitaire game written in plain JavaScript (ES modules).
It has no dependencies and no build step, so GitHub Pages can serve it as is.

## How to play

Clear the board by removing **matching pairs** of **free** tiles.

- A tile is **free** when nothing lies on top of it and its **left or right** side is open.
- Identical tiles match. Any **Flower** matches any Flower, and any **Season** matches any Season.
- You win when the board is empty. If no free pair is left, undo or shuffle the remaining tiles.

The set has the standard 144 tiles. That's three suits (Dots, Bamboo, Characters) numbered 1–9
with four of each, four each of the 4 Winds and 3 Dragons, and one each of 4 Flowers and 4 Seasons.

**Every deal can be won.** The generator plays the layout backwards: it removes random pairs of free
slots, then gives each pair matching faces. Shuffles are dealt the same way.

Keyboard: `H` hint · `U` / `Ctrl+Z` undo · `S` shuffle · `A` auto-solve · `N` new game · `R` restart · `M` mute · `Esc` deselect.
Each deal has a shareable URL such as `#owl-1234`.

## Features

- 27 layouts. Most are shaped about 8 tiles wide by 12 tall (or 12 by 8) so they fill a phone screen:
  - Tall: Owl (the default, all 144 tiles), Rocket, Cat, Arrow, Hourglass, Lighthouse, Pine Tree, Vase, Two Towers, Rhombus and Pagoda (144 tiles), Ziggurat and Temple (288 tiles, two full sets)
  - Wide: Castle, Butterfly, Crab, Spider, Arena, Bridge, Fish, Dragon (144 tiles), Volcano and Great Wall (288 tiles). On a phone held upright these are drawn turned 90°.
  - Classic blocks: Pyramid, Fortress, Cross, Garden
- 7 themes: Jade Classic, Midnight, Sakura, Ocean Breeze, Imperial Ember, Neon Arcade, Emoji Garden
- 2 face sets: traditional tiles drawn as SVG in code, and emoji
- Hints, unlimited undo (including shuffles), solvable reshuffle, timer, best time per layout
- Auto-solver: searches (for up to 10 seconds) for a way to clear the tiles left, then plays it
  out move by move with the hint highlight. Press Solve again to stop.
- Sound effects for matches and wrong picks (synthesized with Web Audio, can be muted)
- Animated background per theme: drifting motes, stars, petals, bubbles, embers, neon streaks, butterflies
- Responsive layout, keyboard support, `prefers-reduced-motion` support
- Installable as an app on desktop and mobile (PWA) and works offline

## Project structure

```
index.html            page shell and dialogs
manifest.webmanifest  PWA manifest (install metadata, icons, screenshots)
sw.js                 service worker (offline cache)
assets/               app icons and install-dialog screenshots
css/main.css          all styling, driven by theme tokens (CSS custom properties)
src/main.js           app controller: wires model, view, controls, persistence
src/pwa.js            service worker registration and Install button
src/core/             pure game logic, no DOM (unit tested)
  tiles.js            the 144-tile set and matching rules
  layouts.js          layout definitions (half-tile coordinate grid)
  board.js            geometry and the free-tile rule
  generator.js        solvable deal generation
  game.js             game state: select, match, undo, hint, shuffle, status
  solver.js           auto-solver: searches for a full clearing order
  solverWorker.js     runs the solver in a Web Worker, off the main thread
  rng.js              seeded PRNG for reproducible deals
src/ui/
  boardView.js        renders a Game into the DOM
  themes.js           theme registry
  ambience.js         animated background effects (one per theme)
  sound.js            synthesized sound effects
  faces/              face sets (traditional SVG, emoji) and registry
  storage.js, timer.js
tests/                node:test unit tests
```

### Adding a theme

Add an entry to `THEMES` in `src/ui/themes.js` with the same token keys as the other themes and a
`faceSet` (`traditional` or `emoji`), plus an `ambience` effect from `src/ui/ambience.js` whose
colors are token names. Tests check that every theme defines the same tokens and a valid effect.

### Adding a layout

Add a `defineLayout({...})` entry in `src/core/layouts.js`. The easiest way is to draw it with
`heights()`: one string per row, where each digit is how many tiles are stacked there and `.` is empty.
`rect()` adds blocks, including half-tile offsets. Keep shapes about 8 wide by 12 tall (or 12 by 8) so
they fill a phone screen, and use at most 144 tiles, so each deal fits in one tile set.
Tests check that the tile count is even and at most 144, that nothing overlaps, that no tile floats,
and that deals can be solved.

### Adding a face set

Create a module exporting `{ id, render(face) => '<svg …>' }` in `src/ui/faces/` and register it in
`src/ui/faces/index.js`.

## Development

```bash
npm test     # run unit tests (Node 22+)
npm start    # serve locally on http://localhost:8080
```

Any static file server works. ES modules don't load from `file://`, so open the game through a server.

## Installable app (PWA)

In Chrome or Edge, use the **Install** button in the toolbar (or the install icon in the address bar)
on desktop. On Android, use **Add to Home screen** / **Install app**. On iOS Safari, use
**Share → Add to Home Screen**. Once installed, the game runs in its own window and works offline.

**Shared-origin safety.** GitHub Pages serves every project of a user from one origin
(`<user>.github.io`). Caches, localStorage and service workers are per origin, so this app uses the
unique id **`rh-mahjong-solitaire`** everywhere it could clash with another app:

- `manifest.webmanifest` → `"id": "rh-mahjong-solitaire"` (resolved per repo path, so the app's identity is unique)
- `sw.js` → every cache is named `rh-mahjong-solitaire-*`. The worker only reads its own caches
  (it never calls the global `caches.match()`) and only deletes its own old caches.
- `src/ui/storage.js` → localStorage key `rh-mahjong-solitaire:prefs:v1`
- The service worker is registered with a relative URL, so its scope is the repo folder, not the whole origin.

`tests/pwa.test.js` checks these invariants. It also checks that every app file is in the service
worker's precache list, so the test fails if you add a module without listing it in `PRECACHE_URLS`.

The deploy workflow stamps the commit SHA into `sw.js`. Every deploy therefore installs a fresh
cache and removes the previous one.

To regenerate the PNG icons after editing `assets/icons/icon.svg`, render the SVG at 192, 512
(and the maskable variant at 512 / 180) with any SVG rasteriser.

## Deploying to GitHub Pages

The workflow in `.github/workflows/pages.yml` runs the tests and deploys on every push to `main`.
To turn it on once, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

You can also choose **Deploy from a branch** with `main` / `(root)`. The site has no build step,
and `.nojekyll` is already in place. In that mode the service worker version is not stamped, so bump
`VERSION` in `sw.js` by hand when you release. Until you do, returning visitors keep the version
their service worker cached. App files always come from that one cached deploy, never mixed with
newer ones, because a module from one deploy importing from another can stop the game from starting.
