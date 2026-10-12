# Graph Report - mahjong  (2026-10-12)

## Corpus Check
- 20 files · ~48,782 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 307 nodes · 552 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.84)
- Token cost: 50,501 input · 0 output

## Community Hubs (Navigation)
- App Controller & Page UI
- Game Rules & Board Geometry
- Tile Face Rendering
- Themes & Ambience
- Page Shell, PWA & Deploy Docs
- Layouts & Settings
- Sound Effects
- Game State Model
- Package Manifest
- Ambience Particle Engine
- Phone Screenshot
- Desktop Screenshot
- Game Timer
- App Icon SVG
- Maskable Icon SVG
- CI Deploy Workflow
- Apple Touch Icon
- Icon 192px
- Icon 512px
- Maskable Icon 512px
- Favicon
- README Overview

## God Nodes (most connected - your core abstractions)
1. `Game` - 16 edges
2. `svg()` - 12 edges
3. `buildSettings()` - 10 edges
4. `Ambience` - 10 edges
5. `Timer` - 9 edges
6. `getFace()` - 8 edges
7. `facesMatch()` - 8 edges
8. `refresh()` - 8 edges
9. `BoardView` - 8 edges
10. `Sound` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Help Dialog (How to play)` --semantically_similar_to--> `Free Tile Rule`  [INFERRED] [semantically similar]
  index.html → README.md
- `Help Dialog (How to play)` --semantically_similar_to--> `Keyboard Shortcuts`  [INFERRED] [semantically similar]
  index.html → README.md
- `buildSettings()` --calls--> `themeStyle()`  [EXTRACTED]
  src/main.js → src/ui/themes.js
- `setTheme()` --calls--> `applyTheme()`  [EXTRACTED]
  src/main.js → src/ui/themes.js
- `setTheme()` --calls--> `getTheme()`  [EXTRACTED]
  src/main.js → src/ui/themes.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PWA shared-origin isolation via unique app id** — readme_shared_origin_safety, manifest, sw, src_ui_storage, tests_pwa_test [EXTRACTED 1.00]
- **Theme system: tokens, faces, ambience** — src_ui_themes, css_main, src_ui_ambience, src_ui_faces_index [EXTRACTED 1.00]
- **Solvable deal pipeline** — src_core_generator, src_core_board, src_core_tiles, src_core_layouts, src_core_rng [INFERRED 0.85]

## Communities (22 total, 4 thin omitted)

### Community 0 - "App Controller & Page UI"
Cohesion: 0.08
Nodes (39): #board Main Element, Game Controls Toolbar (data-action buttons), Result Dialog, SVG Icon Sprite Symbols, #toast Status, Topbar Stats (time, tiles, moves), ACTIONS, ambience (+31 more)

### Community 1 - "Game Rules & Board Geometry"
Cohesion: 0.08
Nodes (34): Help Dialog (How to play), Standard 144-Tile Set, Adding a Face Set (guide), Keyboard Shortcuts, Shareable Deal URL (#layout-seed), bounds(), buildGeometry(), isFree() (+26 more)

### Community 2 - "Tile Face Rendering"
Cohesion: 0.11
Nodes (29): BADGE, EMOJI, emojiFaces, pick(), INK, svg(), text(), VIEW_H (+21 more)

### Community 3 - "Themes & Ambience"
Cohesion: 0.11
Nodes (16): #ambience Canvas, Adding a Theme (guide), Animated Per-Theme Background, EFFECTS, glowDot(), wrap(), ambienceFor(), applyTheme() (+8 more)

### Community 4 - "Page Shell, PWA & Deploy Docs"
Cohesion: 0.10
Nodes (18): css/main.css, index.html (page shell), manifest.webmanifest, Face Sets (traditional SVG, emoji), GitHub Pages Deployment Workflow, Installable PWA (offline), cacheFirst(), FONT_HOSTS (+10 more)

### Community 5 - "Layouts & Settings"
Cohesion: 0.17
Nodes (11): Settings Dialog (layout, theme, options), Adding a Layout (guide), Layouts (Turtle, Pyramid, Fortress, Cross, Garden), Themes (7 themes), STATUS, DEFAULT_LAYOUT_ID, getLayout(), LAYOUTS (+3 more)

### Community 6 - "Sound Effects"
Cohesion: 0.22
Nodes (4): Synthesized Sound Effects (Web Audio), EFFECTS, Sound, Broken

### Community 8 - "Package Manifest"
Cohesion: 0.22
Nodes (8): description, name, private, scripts, start, test, type, version

### Community 10 - "Phone Screenshot"
Cohesion: 0.32
Nodes (8): Narrow (Phone) Gameplay Screenshot, Free vs Blocked Tile Highlighting, Header: Mahjong title, logo, layout name 'Garden #8', Soft Pink 'Garden' Theme, Stats Bar (Time / Tiles / Moves), Layered Tile Board (8-column stacked layout), Mahjong Tile Set (dots, bamboo, characters, winds, dragons, flowers, seasons), Circular Icon Toolbar (New, Restart, Undo, Hint, Shuffle, Settings, Help)

### Community 11 - "Desktop Screenshot"
Cohesion: 0.29
Nodes (8): Wide Desktop Screenshot (Turtle #42), Blocked-Tile Dimming Visual Cue, Header Bar (brand + stats + actions), PWA Install Dialog Screenshot (wide form factor), Stats Display (Time / Tiles / Moves), Mahjong Tile Set (characters, bamboo, dots, winds, dragons, flowers, seasons), Toolbar Buttons (New, Restart, Undo, Hint, Shuffle, Settings, Rules), Turtle Layout Tile Board

### Community 13 - "App Icon SVG"
Cohesion: 0.40
Nodes (5): App Icon (icon.svg), Green Felt Radial Gradient Background, Red Dragon 中 Glyph (shape-drawn), Stacked Mahjong Tile Group, Red Dragon Tile (中)

### Community 14 - "Maskable Icon SVG"
Cohesion: 0.40
Nodes (5): Maskable App Icon (icon-maskable.svg), Ivory Mahjong Tile Glyph, Red Dragon (中) Drawn as Shapes, Maskable Icon Safe Zone, PWA App Icon

### Community 15 - "CI Deploy Workflow"
Cohesion: 0.67
Nodes (3): deploy job, test job (npm test), Test & deploy to GitHub Pages workflow

### Community 16 - "Apple Touch Icon"
Cohesion: 0.50
Nodes (4): Apple Touch Icon (Red Dragon Mahjong Tile), Green Felt Table Visual Theme, PWA / iOS Home Screen Icon, Red Dragon (中) Tile Motif

### Community 17 - "Icon 192px"
Cohesion: 0.50
Nodes (4): App Icon 192px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA Home-Screen Icon Role, Red Dragon Tile (中) Motif

### Community 18 - "Icon 512px"
Cohesion: 0.50
Nodes (4): App Icon 512px (Red Dragon Mahjong Tile), Green Felt Table Color Theme, PWA / Home Screen App Icon, Red Dragon (中 Zhong) Tile Motif

### Community 19 - "Maskable Icon 512px"
Cohesion: 0.50
Nodes (4): Maskable App Icon 512px, Felt Green Table Theme, Red Dragon Tile (中) Motif, Maskable Icon Safe Zone

### Community 20 - "Favicon"
Cohesion: 0.67
Nodes (3): Favicon 32px (Red Dragon Tile Icon), Mahjong App Branding / Icon Set, Red Dragon (中) Mahjong Tile Motif

## Ambiguous Edges - Review These
- `PWA Install Dialog Screenshot (wide form factor)` → `Wide Desktop Screenshot (Turtle #42)`  [AMBIGUOUS]
  assets/screenshots/wide.png · relation: implements

## Knowledge Gaps
- **43 isolated node(s):** `Red Dragon Tile (中)`, `Green Felt Radial Gradient Background`, `Maskable Icon Safe Zone`, `PWA App Icon`, `Red Dragon (中) Drawn as Shapes` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Game` connect `Game State Model` to `App Controller & Page UI`, `Game Rules & Board Geometry`, `Layouts & Settings`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `Red Dragon Tile (中)`, `Green Felt Radial Gradient Background`, `Maskable Icon Safe Zone` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Controller & Page UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07686274509803921 - nodes in this community are weakly interconnected._
- **Why does `Ambience` connect `Ambience Particle Engine` to `App Controller & Page UI`, `Themes & Ambience`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Game Rules & Board Geometry` be split into smaller, more focused modules?**
  _Cohesion score 0.08392156862745098 - nodes in this community are weakly interconnected._
- **Why does `Shared-Origin Safety (rh-mahjong-solitaire id)` connect `Page Shell, PWA & Deploy Docs` to `App Controller & Page UI`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `PWA Install Dialog Screenshot (wide form factor)` and `Wide Desktop Screenshot (Turtle #42)`?**
  _Edge tagged AMBIGUOUS (relation: implements) - confidence is low._