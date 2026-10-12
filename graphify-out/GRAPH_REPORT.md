# Graph Report - mahjong  (2026-10-12)

## Corpus Check
- 46 files · ~71,443 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .css 1, .webmanifest 1)

## Summary
- 339 nodes · 620 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.83)
- Token cost: 115,006 input · 0 output

## Community Hubs (Navigation)
- Game Rules, Board & Deals
- Page Shell, Docs & Deploy
- App Controller & Page UI
- Tile Face Rendering
- Themes & Ambience
- Board View & Rotation
- Board View Tests
- Game State Model
- Sound Effects
- Game Timer
- Package Manifest
- Ambience Particle Engine
- Service Worker Caching
- Desktop Screenshot (Castle)
- Phone Screenshot (Owl)
- App Icon SVG
- Maskable Icon SVG
- Apple Touch Icon
- Icon 192px
- Icon 512px
- Maskable Icon 512px
- Favicon

## God Nodes (most connected - your core abstractions)
1. `Game` - 20 edges
2. `svg()` - 12 edges
3. `buildSettings()` - 11 edges
4. `BoardView` - 11 edges
5. `FakeElement` - 11 edges
6. `Ambience` - 10 edges
7. `startGame()` - 9 edges
8. `Timer` - 9 edges
9. `createRng()` - 8 edges
10. `getFace()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `clearsGreedily()` --calls--> `isFree()`  [EXTRACTED]
  tests/generator.test.js → src/core/board.js
- `mountBoard()` --calls--> `Game`  [EXTRACTED]
  tests/boardView.test.js → src/core/game.js
- `mountBoard()` --calls--> `getLayout()`  [EXTRACTED]
  tests/boardView.test.js → src/core/layouts.js
- `deploy job` --conceptually_related_to--> `No Dependencies / No Build Step`  [INFERRED]
  .github/workflows/pages.yml → README.md
- `mountBoard()` --calls--> `BoardView`  [EXTRACTED]
  tests/boardView.test.js → src/ui/boardView.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared-origin namespacing of PWA resources** — readme_shared_origin_safety, readme_service_worker_cache, readme_prefs_storage_key, readme_pwa [EXTRACTED 1.00]
- **Theme composition: tokens, face set, ambience** — readme_themes, readme_theme_tokens, readme_face_sets, readme_ambience_effects [EXTRACTED 1.00]
- **Guaranteed solvability pipeline** — readme_solvable_deal_generation, readme_solvable_reshuffle, readme_free_tile_rule, readme_layout_invariants, readme_seeded_prng [INFERRED 0.85]
- **Mobile portrait game UI composition** — assets_screenshots_narrow_header_stats, assets_screenshots_narrow_toolbar, assets_screenshots_narrow_owl_layout [INFERRED 0.85]
- **Game screen UI composition (HUD, toolbar, board)** — assets_screenshots_wide_stats_hud, assets_screenshots_wide_toolbar, assets_screenshots_wide_castle_layout [INFERRED 0.85]

## Communities (22 total, 2 thin omitted)

### Community 0 - "Game Rules, Board & Deals"
Cohesion: 0.10
Nodes (30): buildGeometry(), isFree(), overlaps(), overlapsVertically(), STATUS, canClear(), deal(), findRemovalOrder() (+22 more)

### Community 1 - "Page Shell, Docs & Deploy"
Cohesion: 0.05
Nodes (29): deploy job, test job (npm test), Test & deploy to GitHub Pages workflow, css/main.css, index.html (page shell), Help Dialog (How to play), Settings Dialog (layout, theme, options), manifest.webmanifest (+21 more)

### Community 2 - "App Controller & Page UI"
Cohesion: 0.09
Nodes (37): #board Main Element, Game Controls Toolbar (data-action buttons), Result Dialog, SVG Icon Sprite Symbols, #toast Status, Topbar Stats (time, tiles, moves), ACTIONS, ambience (+29 more)

### Community 3 - "Tile Face Rendering"
Cohesion: 0.11
Nodes (29): BADGE, EMOJI, emojiFaces, pick(), INK, svg(), text(), VIEW_H (+21 more)

### Community 4 - "Themes & Ambience"
Cohesion: 0.10
Nodes (17): #ambience Canvas, EFFECTS, glowDot(), wrap(), ambienceFor(), applyTheme(), DEFAULT_THEME_ID, getTheme() (+9 more)

### Community 5 - "Board View & Rotation"
Cohesion: 0.19
Nodes (11): bounds(), BoardView, tileLeft(), tileTop(), cache, cap(), describeFace(), FACE_SETS (+3 more)

### Community 6 - "Board View Tests"
Cohesion: 0.16
Nodes (3): box(), FakeElement, px()

### Community 8 - "Sound Effects"
Cohesion: 0.24
Nodes (3): EFFECTS, Sound, Broken

### Community 9 - "Game Timer"
Cohesion: 0.25
Nodes (3): timer, formatTime(), Timer

### Community 10 - "Package Manifest"
Cohesion: 0.22
Nodes (8): description, name, private, scripts, start, test, type, version

### Community 12 - "Service Worker Caching"
Cohesion: 0.39
Nodes (8): cacheFirst(), FONT_HOSTS, matchOwn(), networkFirstPage(), OWN_CACHES, PRECACHE_URLS, staleWhileRevalidate(), store()

### Community 13 - "Desktop Screenshot (Castle)"
Cohesion: 0.33
Nodes (6): Castle Layout (four corner towers, ring walls, central keep), Green Felt Table Theme with bokeh particles, Wide Layout Screenshot (Castle #42), Stats HUD (Time, Tiles, Moves), Mahjong Tile Set (characters, bamboo, circles, winds, dragons, flowers, seasons), Top Toolbar (New, Restart, Undo, Hint, Shuffle, Sound, Settings, Rules)

### Community 14 - "Phone Screenshot (Owl)"
Cohesion: 0.47
Nodes (5): Narrow (Phone) Screenshot - Mahjong Solitaire Owl Layout, Header Stats Bar (Layout Name #Seed, Time, Tiles, Moves), Owl Layout (144-tile board, portrait), Traditional Mahjong Tile Set (characters, bamboo, dots, winds, dragons, flowers, seasons), Icon Toolbar (New, Restart, Undo, Hint, Shuffle, Mute, Settings, Help)

### Community 15 - "App Icon SVG"
Cohesion: 0.40
Nodes (5): App Icon (icon.svg), Green Felt Radial Gradient Background, Red Dragon 中 Glyph (shape-drawn), Stacked Mahjong Tile Group, Red Dragon Tile (中)

### Community 16 - "Maskable Icon SVG"
Cohesion: 0.40
Nodes (5): Maskable App Icon (icon-maskable.svg), Ivory Mahjong Tile Glyph, Red Dragon (中) Drawn as Shapes, Maskable Icon Safe Zone, PWA App Icon

### Community 17 - "Apple Touch Icon"
Cohesion: 0.50
Nodes (4): Apple Touch Icon (Red Dragon Mahjong Tile), Green Felt Table Visual Theme, PWA / iOS Home Screen Icon, Red Dragon (中) Tile Motif

### Community 18 - "Icon 192px"
Cohesion: 0.50
Nodes (4): App Icon 192px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA Home-Screen Icon Role, Red Dragon Tile (中) Motif

### Community 19 - "Icon 512px"
Cohesion: 0.50
Nodes (4): App Icon 512px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA / Home Screen App Icon, Red Dragon (中 Zhong) Tile Motif

### Community 20 - "Maskable Icon 512px"
Cohesion: 0.50
Nodes (4): Maskable App Icon 512px, Felt Green Table Theme, Red Dragon Tile (中) Motif, Maskable Icon Safe Zone

### Community 21 - "Favicon"
Cohesion: 0.67
Nodes (3): Favicon 32px (Red Dragon Tile Icon), Mahjong App Branding / Icon Set, Red Dragon (中) Mahjong Tile Motif

## Knowledge Gaps
- **39 isolated node(s):** `SVG Icon Sprite Symbols`, `#ambience Canvas`, `Topbar Stats (time, tiles, moves)`, `#board Main Element`, `#toast Status` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 118 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Settings Dialog (layout, theme, options)` connect `Page Shell, Docs & Deploy` to `App Controller & Page UI`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `SVG Icon Sprite Symbols`, `#ambience Canvas`, `Topbar Stats (time, tiles, moves)` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Rules, Board & Deals` be split into smaller, more focused modules?**
  _Cohesion score 0.09551020408163265 - nodes in this community are weakly interconnected._
- **Should `Page Shell, Docs & Deploy` be split into smaller, more focused modules?**
  _Cohesion score 0.05496828752642706 - nodes in this community are weakly interconnected._
- **Should `App Controller & Page UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08773784355179703 - nodes in this community are weakly interconnected._
- **Should `Tile Face Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Should `Themes & Ambience` be split into smaller, more focused modules?**
  _Cohesion score 0.09852216748768473 - nodes in this community are weakly interconnected._