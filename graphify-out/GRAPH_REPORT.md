# Graph Report - mahjong  (2026-10-12)

## Corpus Check
- Corpus is ~44,118 words - fits in a single context window. You may not need a graph.

## Summary
- 255 nodes · 455 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.83)
- Token cost: 335,310 input · 0 output

## Community Hubs (Navigation)
- Board Geometry & Deal Generation
- App Controller (main.js)
- Page Shell, Docs & Deploy
- Tile Face Rendering
- Board View & Face Registry
- Game State Model
- Package Manifest
- Service Worker Caching
- Phone Screenshot
- Desktop Screenshot
- PWA Consistency Tests
- Game Timer
- App Icon SVG
- Maskable Icon SVG
- Apple Touch Icon
- Icon 192px
- Icon 512px
- Maskable Icon 512px
- Favicon

## God Nodes (most connected - your core abstractions)
1. `Game` - 19 edges
2. `Mahjong Solitaire` - 13 edges
3. `svg()` - 12 edges
4. `index.html page shell` - 10 edges
5. `startGame()` - 9 edges
6. `buildSettings()` - 9 edges
7. `getFace()` - 8 edges
8. `refresh()` - 8 edges
9. `BoardView` - 8 edges
10. `Timer` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Board container (#board)` --conceptually_related_to--> `Game`  [INFERRED]
  index.html → src/core/game.js
- `Game controls (data-action buttons)` --conceptually_related_to--> `Game`  [INFERRED]
  index.html → src/core/game.js
- `Install button` --shares_data_with--> `setupInstall()`  [INFERRED]
  index.html → src/pwa.js
- `Installable app (PWA, offline)` --conceptually_related_to--> `setupInstall()`  [INFERRED]
  README.md → src/pwa.js
- `Themes (7, token-driven)` --conceptually_related_to--> `applyTheme()`  [INFERRED]
  README.md → src/ui/themes.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Deploy cache-busting flow** — _github_workflows_pages_deploy, _github_workflows_pages_stamp_service_worker_version, readme_stale_while_revalidate, readme_pwa [INFERRED 0.85]
- **Core solitaire rules** — readme_free_tile_rule, readme_tile_matching_rules, readme_144_tile_set, readme_solvable_deal_generation [INFERRED 0.85]
- **Shared-origin namespacing safeguards** — readme_shared_origin_safety, readme_rh_mahjong_solitaire_id, readme_precache_invariant_test, sw_matchown [INFERRED 0.75]

## Communities (19 total, 2 thin omitted)

### Community 0 - "Board Geometry & Deal Generation"
Cohesion: 0.10
Nodes (27): buildGeometry(), isFree(), overlaps(), overlapsVertically(), STATUS, deal(), findRemovalOrder(), pairUp() (+19 more)

### Community 1 - "App Controller (main.js)"
Cohesion: 0.11
Nodes (30): ACTIONS, applyIndexPref(), buildSettings(), checkEnd(), choiceButton(), doHint(), doShuffle(), doUndo() (+22 more)

### Community 2 - "Page Shell, Docs & Deploy"
Cohesion: 0.08
Nodes (29): deploy job, test job (npm test), Test & deploy to GitHub Pages workflow, Board container (#board), Game controls (data-action buttons), How to play dialog, Inline SVG icon sprite, Install button (+21 more)

### Community 3 - "Tile Face Rendering"
Cohesion: 0.11
Nodes (29): BADGE, EMOJI, emojiFaces, pick(), INK, svg(), text(), VIEW_H (+21 more)

### Community 4 - "Board View & Face Registry"
Cohesion: 0.21
Nodes (8): bounds(), BoardView, cache, cap(), describeFace(), FACE_SETS, renderFace(), traditionalFaces

### Community 6 - "Package Manifest"
Cohesion: 0.22
Nodes (8): description, name, private, scripts, start, test, type, version

### Community 7 - "Service Worker Caching"
Cohesion: 0.39
Nodes (8): cacheFirst(), FONT_HOSTS, matchOwn(), networkFirstPage(), OWN_CACHES, PRECACHE_URLS, staleWhileRevalidate(), store()

### Community 8 - "Phone Screenshot"
Cohesion: 0.32
Nodes (8): Narrow (Phone) Gameplay Screenshot, Free vs Blocked Tile Highlighting, Header: Mahjong title, logo, layout name 'Garden #8', Soft Pink 'Garden' Theme, Stats Bar (Time / Tiles / Moves), Layered Tile Board (8-column stacked layout), Mahjong Tile Set (dots, bamboo, characters, winds, dragons, flowers, seasons), Circular Icon Toolbar (New, Restart, Undo, Hint, Shuffle, Settings, Help)

### Community 9 - "Desktop Screenshot"
Cohesion: 0.29
Nodes (8): Wide Desktop Screenshot (Turtle #42), Blocked-Tile Dimming Visual Cue, Header Bar (brand + stats + actions), PWA Install Dialog Screenshot (wide form factor), Stats Display (Time / Tiles / Moves), Mahjong Tile Set (characters, bamboo, dots, winds, dragons, flowers, seasons), Toolbar Buttons (New, Restart, Undo, Hint, Shuffle, Settings, Rules), Turtle Layout Tile Board

### Community 10 - "PWA Consistency Tests"
Cohesion: 0.29
Nodes (4): manifest, precache, sw, walk()

### Community 12 - "App Icon SVG"
Cohesion: 0.40
Nodes (5): App Icon (icon.svg), Green Felt Radial Gradient Background, Red Dragon 中 Glyph (shape-drawn), Stacked Mahjong Tile Group, Red Dragon Tile (中)

### Community 13 - "Maskable Icon SVG"
Cohesion: 0.40
Nodes (5): Maskable App Icon (icon-maskable.svg), Ivory Mahjong Tile Glyph, Red Dragon (中) Drawn as Shapes, Maskable Icon Safe Zone, PWA App Icon

### Community 14 - "Apple Touch Icon"
Cohesion: 0.50
Nodes (4): Apple Touch Icon (Red Dragon Mahjong Tile), Green Felt Table Visual Theme, PWA / iOS Home Screen Icon, Red Dragon (中) Tile Motif

### Community 15 - "Icon 192px"
Cohesion: 0.50
Nodes (4): App Icon 192px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA Home-Screen Icon Role, Red Dragon Tile (中) Motif

### Community 16 - "Icon 512px"
Cohesion: 0.50
Nodes (4): App Icon 512px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA / Home Screen App Icon, Red Dragon (中 Zhong) Tile Motif

### Community 17 - "Maskable Icon 512px"
Cohesion: 0.50
Nodes (4): Maskable App Icon 512px, Felt Green Table Theme, Red Dragon Tile (中) Motif, Maskable Icon Safe Zone

### Community 18 - "Favicon"
Cohesion: 0.67
Nodes (3): Favicon 32px (Red Dragon Tile Icon), Mahjong App Branding / Icon Set, Red Dragon (中) Mahjong Tile Motif

## Ambiguous Edges - Review These
- `Wide Desktop Screenshot (Turtle #42)` → `PWA Install Dialog Screenshot (wide form factor)`  [AMBIGUOUS]
  assets/screenshots/wide.png · relation: implements

## Knowledge Gaps
- **31 isolated node(s):** `Shareable deal URL (#layout-seed)`, `Stats bar (time, tiles, moves)`, `Toast status region`, `Result dialog`, `Red Dragon (中) Tile Motif` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 85 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Game` connect `Game State Model` to `Board Geometry & Deal Generation`, `App Controller (main.js)`, `Page Shell, Docs & Deploy`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Game` (e.g. with `Board container (#board)` and `Game controls (data-action buttons)`) actually correct?**
  _`Game` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Shareable deal URL (#layout-seed)`, `Stats bar (time, tiles, moves)`, `Toast status region` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Board Geometry & Deal Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.09966777408637874 - nodes in this community are weakly interconnected._
- **Why does `setupInstall()` connect `Page Shell, Docs & Deploy` to `App Controller (main.js)`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `App Controller (main.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.11411411411411411 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Wide Desktop Screenshot (Turtle #42)` and `PWA Install Dialog Screenshot (wide form factor)`?**
  _Edge tagged AMBIGUOUS (relation: implements) - confidence is low._