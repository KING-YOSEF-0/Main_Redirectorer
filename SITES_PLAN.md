# 40 New Sites Plan — Each with 10 Tasks

> **Existing sites (19):** Grid of Words, Stylish Names, Typing Test 2.0, Mobile Typing, Calculator, Heaven of Games, World Economy, CozyShare, Wheel of Fortune, Digital Life, Study Suite, Loan EMI, DevTools, Password Strength, Three in One, Gilded Lantern, FluxConvert, Stillroom, Interstitial Gate Generator

---

## Category 1: Developer Micro-Tools (8 sites)

### 1. JWT Decoder & Validator
**Folder:** `jwt-decoder/`
**Description:** Paste a JWT → decode header/payload, verify signature (if secret provided), check expiry, copy claims.
**Tasks:**
1. Project scaffold (HTML/CSS/JS structure, bubble theme)
2. JWT parsing (header.payload.signature split, base64url decode)
3. Header display (alg, typ, kid, etc. in formatted JSON)
4. Payload display (all claims, formatted, with timestamps humanized)
5. Expiry status badge (Valid / Expired / Expiring Soon with countdown)
6. Signature verification (HS256/HS512/RS256 — Web Crypto API)
7. Secret/key input (for HS* and RS* verification)
8. Copy/export buttons (JSON, individual claims, shareable URL with hash)
8. Dark/light theme toggle + keyboard shortcuts (Ctrl+V to paste)
10. Add to main hub card

---

### 2. Hash Generator & Verifier
**Folder:** `hash-generator/`
**Description:** Generate MD5, SHA-1, SHA-256, SHA-512, SHA-3, BLAKE2, RIPEMD from text/file. Verify checksums.
**Tasks:**
1. Project scaffold with algorithm selector (tabs or dropdown)
2. Text input → live hash output for all algorithms
3. File input (drag-drop) → streaming hash (Web Crypto / SubtleCrypto)
4. HMAC mode (key + message) with key input
5. Verify mode: paste expected hash → green/red match indicator
6. Batch mode: multiple lines → table of hashes (CSV export)
7. Checksum file parser (.md5, .sha256, .sha512 formats)
8. Copy all / download .txt / shareable link
9. Algorithm info cards (security notes, use cases)
10. Add to main hub card

---

### 3. UUID / ULID / NanoID Generator
**Folder:** `id-generator/`
**Description:** Generate UUID v1/v4/v7, ULID, NanoID, KSUID, ObjectId. Bulk generate, format options, copy/export.
**Tasks:**
1. Project scaffold with ID type tabs
2. UUID v4 (random) — single & bulk (up to 10,000)
3. UUID v7 (timestamp-ordered) — with timestamp decode
4. ULID — monotonic, sortable, with decode panel
5. NanoID — custom alphabet/length, collision calculator
6. KSUID / ObjectId (Mongo) — with timestamp extraction
7. Format options: raw, quoted, comma-separated, JSON array, SQL VALUES, CSV
8. Bulk preview with search/filter, copy selected, download .txt/.json/.csv
9. "Generate on page load" bookmarklet generator
10. Add to main hub card

---

### 4. Cron Expression Explainer & Visualizer
**Folder:** `cron-explainer/`
**Description:** Paste cron → human explanation, next 10 run times, calendar heatmap, timezone support.
**Tasks:**
1. Project scaffold with cron input (quartz + standard 5/6-field)
2. Parser → AST → human sentence ("Every weekday at 9:30 AM")
3. Next N run times (configurable N, timezone-aware)
4. Previous N run times (for debugging)
5. Interactive calendar heatmap (month view, highlighted days)
6. Timezone selector (IANA zones, auto-detect local)
7. Presets library (@yearly, @daily, "every 5 min", etc.)
8. Export: human text, next runs JSON, iCal/ICS file
9. Validation with error highlighting (field-level)
10. Add to main hub card

---

### 5. Regex Tester & Builder
**Folder:** `regex-tester/`
**Description:** Test regex against text, highlight matches/groups, explain pattern, generate code snippets.
**Tasks:**
1. Project scaffold: pattern input, flags, test text area
2. Live match highlighting (all matches, capture groups colored)
3. Match details panel (index, groups, indices, substitution result)
4. Regex explanation (token-by-token plain English)
5. Quick reference sidebar (metacharacters, shorthand, assertions)
6. Test suite: save multiple test cases, run all, pass/fail badges
7. Code generator: JS, Python, Go, Rust, Java, C# snippets
8. Substitution tester (replace with $1, func, etc.)
9. Performance benchmark (catastrophic backtracking detection)
10. Add to main hub card

---

### 6. CSS Shadow & Filter Playground
**Folder:** `css-shadow-playground/`
**Description:** Visual editors for box-shadow, text-shadow, filter, backdrop-filter. Live preview, copy CSS.
**Tasks:**
1. Project scaffold: tabbed editors (box-shadow, text-shadow, filter, backdrop)
2. Box-shadow: multiple layers, inset, color picker, spread/blur/x/y sliders
3. Text-shadow: multiple layers, color, offset, blur
4. Filter: 10+ functions (blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia, drop-shadow, svg)
5. Backdrop-filter: same, with preview over content
6. Preset gallery (neumorphic, glassmorphism, retro, glow, etc.)
7. Live preview on multiple elements (card, button, text, image)
8. Export: CSS custom properties, Tailwind classes, raw CSS
9. Random generator + "surprise me" button
10. Add to main hub card

---

### 7. Image → Base64 / WebP / AVIF Converter
**Folder:** `image-converter/`
**Description:** Drop images → convert to Base64 (data URI), WebP, AVIF, resize, compress, strip EXIF. Batch support.
**Tasks:**
1. Project scaffold: drag-drop zone, multi-file, paste from clipboard
2. Base64 encoder (data URI, CSS background, <img> src, markdown)
3. WebP conversion (quality slider, lossless option)
4. AVIF conversion (quality, speed preset)
5. Resize: max width/height, percentage, fit modes (cover, contain, stretch)
6. Compress: quality slider with live size preview
7. EXIF strip / orientation fix / metadata viewer
8. Batch queue: progress, individual settings, download ZIP
9. Compare original vs converted (side-by-side, size diff)
10. Add to main hub card

---

### 8. JWT / JWK / Cert Toolbox
**Folder:** `jwt-toolbox/`
**Description:** Full JWT workflow: decode, verify, sign, generate keys (RSA/EC), JWK Set builder, cert viewer.
**Tasks:**
1. Project scaffold: tabbed (Decode, Verify, Sign, Keys, Certs)
2. Decode: same as Site 1 but with JWK header support
3. Verify: paste JWT + JWKS URL or key → validation result
4. Sign: header + payload editor → sign with HS*/RS*/ES* (Web Crypto)
5. Key generator: RSA (2048/4096), EC (P-256/P-384/P-521) → PEM + JWK
6. JWK Set builder: multiple keys → valid `keys` array JSON
7. X.509 Cert viewer: paste PEM → parse subject, issuer, SAN, validity, fingerprint
8. Cert chain validator (basic)
9. Export all: keys, JWKS, signed JWT, cert info
10. Add to main hub card

---

## Category 2: Productivity & Wellbeing (8 sites)

### 9. Time Zone Meeting Planner
**Folder:** `meeting-planner/`
**Description:** Pick cities/timezones → visual timeline of overlapping work hours, find best slots, share link.
**Tasks:**
1. Project scaffold: timezone search (IANA + city names, 400+)
2. Multi-select timezones (chips, max 8), reorderable
3. Visual timeline: 24h bar per zone, working hours highlighted (9-17 default, customizable)
4. Overlap calculation: "Best windows" ranked by # of people in work hours
5. Date picker (recurring: daily/weekly/monthly, specific date)
6. Meeting duration slider (15min–4h)
7. Shareable URL with encoded state
8. Export: calendar invite (.ics), Slack/Teams message, plain text
9. Dark/light theme, compact mode for embedding
10. Add to main hub card

---

### 10. Habit Streak Tracker
**Folder:** `habit-tracker/`
**Description:** Local-first habit tracker: daily checkboxes, streak counts, heatmap calendar, export data.
**Tasks:**
1. Project scaffold: add/edit/delete habits (name, color, frequency, reminder time)
2. Daily view: today's habits with large checkboxes, haptic feedback on check
3. Streak counter per habit (current, longest, total completions)
4. Heatmap calendar (GitHub-style) — year view, month navigator
5. Frequency options: daily, weekdays, weekly (specific days), custom cron
6. Reminders: Notification API (permission, schedule, snooze)
7. Statistics: completion rate, avg streak, best week, consistency score
8. Data export/import (JSON, CSV), backup to file
9. Widget mode: minimal embeddable version for homepage
10. Add to main hub card

---

### 11. Breathing & Focus Timer
**Folder:** `breathing-timer/`
**Description:** Animated breathing exercises (box, 4-7-8, coherent, custom) + focus timer with ambient sounds.
**Tasks:**
1. Project scaffold: breathing exercise selector + focus timer tab
2. Breathing: visual circle animation (expand/contract), phase labels, audio cues
3. Presets: Box (4-4-4-4), 4-7-8, Coherent (5-5), Pranayama, Custom
4. Custom builder: inhale/hold/exhale/hold sliders, cycles, prep time
5. Focus timer: Pomodoro (25/5), custom work/break, long break every N
6. Ambient sounds: rain, waves, forest, cafe, white/pink/brown noise, mixer
7. Session history: date, type, duration, cycles, mood rating
8. Statistics: total minutes, sessions this week, streaks
9. Fullscreen zen mode (hide UI, keep animation)
10. Add to main hub card

---

### 12. Ambient Sound Mixer
**Folder:** `ambient-mixer/`
**Description:** Layer multiple sounds (rain, fire, keyboard, cafe, train, pink noise) with volume/pan, save presets.
**Tasks:**
1. Project scaffold: 12+ high-quality loopable sounds (Web Audio API)
2. Track strips: volume fader, pan, mute/solo, loop trim
3. Master volume, global reverb send
4. Preset saves (name, icon, auto-load on return)
5. Shareable URL with encoded mix state
6. Timer: auto-fade out after N minutes
7. Oscillator synth: brown/pink/white noise generator (no samples needed)
8. Visualizer: subtle frequency bars or particle field
9. Keyboard shortcuts (number keys = tracks, space = play/pause)
10. Add to main hub card

---

### 13. Text Analyzer Pro
**Folder:** `text-analyzer/`
**Description:** Paste text → word/char/line count, reading time, readability (Flesch, Gunning Fog, SMOG), keyword density, sentiment.
**Tasks:**
1. Project scaffold: large text area, live stats sidebar
2. Basic counts: words, chars (±spaces), lines, paragraphs, sentences, syllables (estimate)
3. Reading time: slow/avg/fast, speaking time
4. Readability: Flesch-Kincaid, Gunning Fog, SMOG, ARI, Coleman-Liau, Dale-Chall
5. Keyword density: 1-3 gram, exclude stopwords (multi-lang), min count filter
6. Sentiment: VADER-style (positive/negative/neutral scores)
7. Text stats: unique words, lexical density, avg word/sentence length
8. Export report (JSON, markdown, PDF via print)
9. Compare mode: two texts side-by-side diff + stats delta
10. Add to main hub card

---

### 14. Pomodoro + Task Board
**Folder:** `pomodoro-board/`
**Description:** Kanban board (Todo/Doing/Done) + integrated Pomodoro timer per task, session logging.
**Tasks:**
1. Project scaffold: 3-column Kanban (drag-drop, localStorage)
2. Task cards: title, description, tags, estimate (pomodoros), actual
3. Inline Pomodoro timer: start/pause/reset, auto-advance to break
4. Session log per task: start/end, duration, completed pomodoros, notes
5. Daily/weekly summary: focus time, completed tasks, velocity
6. Tags with colors, filter board by tag
7. Data export (JSON, CSV), import, backup
8. Sound/vibration on phase change, browser notification
9. Compact "focus mode": single task + timer, hide board
10. Add to main hub card

---

### 15. Decision Matrix / Weighted Scoring
**Folder:** `decision-matrix/`
**Description:** List options, define criteria with weights, score each → ranked results with sensitivity analysis.
**Tasks:**
1. Project scaffold: criteria table (name, weight, direction: higher/lower better)
2. Options table (name, description)
3. Scoring grid: each option × criterion (1-10 or custom scale)
4. Weighted totals + ranking (real-time update)
5. Sensitivity: "What if weight changes?" slider per criterion
6. Pairwise comparison mode (AHP) for weight derivation
7. Notes/comments per cell
8. Export: CSV, markdown table, shareable URL
9. Templates: job offers, vendor selection, feature prioritization, apartment hunting
10. Add to main hub card

---

### 16. Personal Finance Micro-Tools
**Folder:** `finance-tools/`
**Description:** Compound interest, loan amortization, retirement (FIRE), budget allocator, currency converter (offline rates).
**Tasks:**
1. Project scaffold: tabbed tools (6 tools)
2. Compound Interest: principal, rate, frequency, time, contributions → chart + table
3. Loan Amortization: amount, rate, term, extra payment → schedule + summary
4. FIRE Calculator: expenses, SWR, savings rate → years to FI, coast FI
5. Budget Allocator: income → 50/30/20 or custom buckets → envelope view
6. Currency Converter: 160+ currencies, offline rates (embedded, dated), historical chart
7. Net Worth Tracker: assets/liabilities categories, monthly snapshots, chart
8. Rule of 72 / 114 / 144 quick ref
9. Export all: CSV, JSON, printable PDF report
10. Add to main hub card

---

## Category 3: Games with Daily/Repeat Value (8 sites)

### 17. Daily Minesweeper
**Folder:** `daily-minesweeper/`
**Description:** New mine layout every day (seeded by date). Leaderboard (local), streak tracking, shareable result.
**Tasks:**
1. Project scaffold: board generator (seeded PRNG by YYYY-MM-DD)
2. Classic gameplay: left-click reveal, right-click flag, chord click
3. Difficulties: Beginner (9×9×10), Intermediate (16×16×40), Expert (30×16×99), Custom
4. Daily challenge: same board for everyone, date-based seed, "Play Today's" button
5. Timer, mine counter, face button (restart)
6. Win/lose animations, streak counter (consecutive daily wins)
7. Local leaderboard: best times per difficulty, daily challenge rank
8. Share result card (emoji grid, time, date, copy image)
9. Touch-friendly: long-press flag, double-tap chord
10. Add to main hub card

---

### 18. Daily Typing Quote
**Folder:** `daily-typing/`
**Description:** New quote each day (seeded). WPM/accuracy, shareable result card, practice mode.
**Tasks:**
1. Project scaffold: quote fetcher (curated list, seeded by date)
2. Typing engine: live WPM, raw WPM, accuracy, error heatmap
3. Daily quote mode: same quote for all, date-seeded, "Tomorrow's" preview locked
4. Practice mode: random quotes, custom text, upload file
5. Difficulty: punctuation, numbers, mixed case toggles
6. Result card: WPM, accuracy, consistency, quote, date, share as image
7. History: last 30 sessions, trend chart
8. Keyboard heatmap (which keys you miss)
9. Multiplayer: race against ghost of your best / friend's shared link
10. Add to main hub card

---

### 19. Aim Trainer
**Folder:** `aim-trainer/`
**Description:** Click targets (static, moving, strafing) → reaction time, accuracy, score. Modes: reflex, tracking, flicking.
**Tasks:**
1. Project scaffold: canvas renderer, high-DPI support
2. Modes: Static (pop), Moving (linear), Strafing (random dir), Grid, Reaction (wait for green)
3. Config: target size, spawn rate, duration, lives, penalty on miss
4. Metrics: avg reaction time, accuracy %, hits/sec, score formula
5. Session history with charts (reaction time distribution, accuracy over time)
6. Leaderboard (local): top 10 per mode
7. Crosshair styles (dot, cross, circle, custom SVG)
8. Sound on hit/miss, haptic (vibration API)
9. Warm-up routine (progressive difficulty)
10. Add to main hub card

---

### 20. Simon Sequence
**Folder:** `simon-sequence/`
**Description:** Classic memory game: watch sequence, repeat. Levels increase. Sound + color. Daily challenge.
**Tasks:**
1. Project scaffold: 4-button layout (or 6/9 for harder modes)
2. Core loop: show → input → validate → next level
3. Modes: Classic (add 1), Reverse (play backwards), Speed (faster each level), Dual (two sequences)
4. Daily challenge: seeded sequence, same for everyone
5. Audio: Web Audio synth tones (pentatonic, major, custom)
6. Visual: button flash, particle burst, screen shake on fail
7. Stats: highest level, avg level, daily streak
8. Accessibility: color-blind patterns, sound-only mode
9. Share daily score (emoji grid)
10. Add to main hub card

---

### 21. Word Ladder Daily
**Folder:** `word-ladder/`
**Description:** Transform start word → end word in N steps (change 1 letter). New puzzle daily. Hints, shareable.
**Tasks:**
1. Project scaffold: dictionary (ENABLE/Scrabble ~170k words), graph precompute
2. Daily puzzle: seeded start/end pair (solvable in ≤6 steps)
3. Gameplay: click letter → type, validation (real word, 1 letter diff)
4. Hints: show next valid word, show path length, reveal one step
5. Undo/redo, clear
6. Stats: solved today, current streak, best streak, avg steps
7. Share result: emoji grid (🟩🟨⬜), steps taken
8. Practice mode: random pairs, custom start/end
9. Keyboard support (type letters, Enter submit)
10. Add to main hub card

---

### 22. Number Puzzle (2048 + Variants)
**Folder:** `number-puzzle/`
**Description:** 2048, Threes, 1024, Fibonacci, Multiplayer race. Daily seed, undo, stats.
**Tasks:**
1. Project scaffold: grid engine (4×4 default, 3×3–6×6)
2. Variants: 2048 (powers of 2), Threes (1+2=3, then ×2), Fibonacci, Custom merge rule
3. Daily challenge: seeded board + spawn sequence
4. Controls: arrow keys, WASD, swipe, gamepad
5. Undo (last 10 moves), restart, new game
6. Animations: slide, merge, spawn, win/lose
7. Stats: best tile, best score, games played, win rate
8. Theme: classic, dark, pastel, high contrast, custom CSS
9. Share board state (URL), replay moves
10. Add to main hub card

---

### 23. Quick Chess Puzzles
**Folder:** `chess-puzzles/`
**Description:** Mate in 1/2/3, tactics (fork, pin, skewer). Daily puzzle. Stockfish eval. PGN export.
**Tasks:**
1. Project scaffold: chessboard (chess.js + chessboard.js or custom canvas)
2. Puzzle database: 1000+ curated (mate in 1/2/3, tactics themes)
3. Daily puzzle: seeded, same for all
4. Interactive: drag pieces, legal moves only, show threat
5. Hints: "White to play and mate in 2", show legal moves, engine eval
6. Solution playback: auto-play, step through, try alternative lines
7. Stats: streak, accuracy, avg time, theme breakdown
8. Practice mode: filtered by theme, difficulty, random
9. PGN copy/share, FEN copy
10. Add to main hub card

---

### 24. GeoGuessr-Lite (Street View Static)
**Folder:** `geo-guess/`
**Description:** Static Street View panoramas (Mapillary/Unsplash) → click world map to guess. Distance score. Daily.
**Tasks:**
1. Project scaffold: panorama viewer (Panorama.js / Three.js / CSS 3D)
2. Image source: Mapillary API (free) or curated Unsplash set
3. Daily challenge: 5 rounds, same locations for everyone
4. Map: Leaflet/MapLibre, click to place guess marker
5. Scoring: 5000 - distance(km) × factor, time bonus
6. Results: actual vs guess, distance, points, map with line
7. History: last 30 games, avg score, best round
8. Practice: random location, country filter, continent filter
9. Share daily result (emoji flags + score)
10. Add to main hub card

---

## Category 4: Creative & Visual Tools (8 sites)

### 25. Palette from Image
**Folder:** `palette-extractor/`
**Description:** Upload image → dominant colors (k-means), palette types (vibrant, muted, dark), export formats.
**Tasks:**
1. Project scaffold: drag-drop, paste, camera capture
2. Color quantization: k-means (k=5 default, 2-12), median cut alternative
3. Palette variants: Vibrant, Light Vibrant, Dark Vibrant, Muted, Light Muted, Dark Muted (Material Design)
4. Color harmony analysis: complementary, triadic, tetradic, analogous matches
5. Export: HEX/RGB/HSL/CMYK, CSS custom props, Tailwind config, Figma JSON, ASE (Swatch), PNG palette image
6. Image preview with palette overlay (proportional bars)
7. Color blindness simulation (protanopia, deuteranopia, tritanopia)
8. Batch: multiple images → combined palette
9. History (last 20), shareable URL with image hash
10. Add to main hub card

---

### 26. Quote Card / Poster Generator
**Folder:** `quote-poster/`
**Description:** Quote + author + background (unsplash/gradient/pattern) → styled card → download PNG/WebP.
**Tasks:**
1. Project scaffold: quote input, author, tags
2. Background: Unsplash search (API), gradients (mesh, linear, radial), patterns (SVG), solid, upload
3. Typography: 20+ font pairs (Google Fonts), size/weight/letter-spacing/line-height controls
4. Layout presets: centered, left, right, bottom, split, minimal
5. Decorations: quote marks, divider lines, shapes, texture overlay
6. Branding: logo upload, watermark, @handle
7. Canvas rendering (high-DPI), download PNG/WebP/JPG, copy to clipboard
8. Presets: Instagram (1080×1080), Story (1080×1920), Twitter (1200×675), LinkedIn, custom
9. Quote library: 500+ curated (stoic, dev, motivational, funny), random button
10. Add to main hub card

---

### 27. ASCII Art Generator
**Folder:** `ascii-art/`
**Description:** Image → ASCII (density/color), Text → FIGlet fonts, Animation → ASCII video player.
**Tasks:**
1. Project scaffold: tabbed (Image→ASCII, Text→FIGlet, Video→ASCII)
2. Image→ASCII: charset ramps (dense, sparse, blocks, emoji), width, invert, color (ANSI/HTML)
3. FIGlet: 100+ fonts, kerning, smushing, direction, justification
4. Video→ASCII: WebCodecs / canvas frame extraction, playback controls, export GIF/HTML
5. Live webcam → ASCII (fun mirror mode)
6. Export: plain text, HTML (colored spans), ANSI, SVG, copy button
7. Presets: "retro terminal", "matrix rain", "blocky", "minimal"
8. Batch image folder → ASCII gallery (index.html)
9. Shareable URL with encoded settings
10. Add to main hub card

---

### 28. CSS Blob & Shape Generator
**Folder:** `blob-generator/`
**Description:** Organic blob shapes (border-radius morphing), noise displacement, mesh gradients. Copy CSS/SVG.
**Tasks:**
1. Project scaffold: canvas preview, control panel
2. Blob: 4-12 control points, tension, seed, animation (morph loop)
3. Noise displacement: Perlin/Simplex, frequency, amplitude, octaves, animate
4. Mesh gradient: 2×2 to 6×6 grid, per-point color, smooth interpolation
5. Aurora gradient: multiple moving blobs with blur, blend modes
6. Export: CSS border-radius (8 values), SVG path, CSS mask, Tailwind arbitrary values
7. Presets: "organic", "geometric", "liquid", "crystal", "cell"
8. Randomize + "surprise me", copy code button
9. Multi-blob scene: layers, z-index, blend modes
10. Add to main hub card

---

### 29. Gradient Lab Pro
**Folder:** `gradient-lab/`
**Description:** Multi-stop gradients (linear, radial, conic, mesh), easing per stop, export CSS/Tailwind/Figma.
**Tasks:**
1. Project scaffold: gradient editor (stops as draggable chips)
2. Types: linear (angle), radial (position, shape), conic (from angle), mesh (grid)
3. Stops: position, color, easing function (linear, ease, custom cubic-bezier)
4. Color space: sRGB, OKLab, HSL, LCH interpolation
5. Presets: 50+ curated (aurora, sunset, ocean, neon, pastel, brutalist)
6. Export: CSS `background`, Tailwind `bg-gradient-to`, Figma JSON, SVG `<linearGradient>`, PNG preview
7. Palette extractor: gradient → 5-color palette
8. Animation: animated gradient (shift stops, rotate conic)
9. Shareable URL, copy CSS button
10. Add to main hub card

---

### 30. SVG Icon Builder
**Folder:** `svg-icon-builder/`
**Description:** Combine primitive shapes (rect, circle, path) → custom icons. Boolean ops (union, subtract, intersect). Export SVG/React/Vue/Svelte components.
**Tasks:**
1. Project scaffold: canvas (SVG), layers panel, shape tools
2. Primitives: rect, ellipse, line, polyline, polygon, star, heart, custom path
3. Boolean operations: union, subtract, intersect, exclude (via Boolean.js or custom)
4. Transform: move, rotate, scale, flip, align, distribute
5. Style: fill (solid, gradient, pattern), stroke (width, dash, cap, join), filters
6. Grid & snap, guides, smart guides
7. Icon font export (SVG font), individual SVGs, React/Vue/Svelte component code
8. Library: 100+ starter icons (Feather, Lucide, Heroicons subset)
9. Search/filter library, drag to canvas
10. Add to main hub card

---

### 31. Favicon & App Icon Generator
**Folder:** `favicon-generator/`
**Description:** Upload image → all favicon sizes (16–512), apple-touch, manifest.json, browserconfig.xml, ZIP.
**Tasks:**
1. Project scaffold: upload, preview, background color/transparent
2. Sizes: 16, 32, 48, 64, 96, 128, 192, 256, 512 (PNG), 16/32/48 ICO
3. Apple touch icons (180, 167, 152, 120), maskable icon (safe zone)
4. manifest.json generator (name, short_name, theme_color, display, orientation)
5. browserconfig.xml (Windows tiles)
6. SVG favicon (modern browsers) + fallback
7. Preview: browser tab, homescreen, Windows tile, Safari pinned tab
8. Download: single ZIP with all files + HTML `<head>` snippet
9. PWA readiness checklist (scores each requirement)
10. Add to main hub card

---

### 32. Color Contrast & Accessibility Checker
**Folder:** `contrast-checker/`
**Description:** Foreground/background → WCAG AA/AAA (normal/large text, UI), APCA, suggestions, palette fixer.
**Tasks:**
1. Project scaffold: two color pickers (FG/BG), live contrast ratio
2. WCAG 2.1: AA (4.5:3), AAA (7:4.5), Large text (3:4.5), UI components (3:1)
3. APCA (Advanced Perceptual Contrast Algorithm) — modern standard
4. Color blindness simulation (8 types) on sample text/UI
5. Palette fixer: input 5-10 colors → adjusted versions that meet contrast vs white/black
6. Text preview: multiple font sizes/weights, link states, button states
7. Export report (JSON, markdown), shareable URL
8. Batch: check entire CSS file (paste CSS → report all color pairs)
9. Dark/light mode toggle for testing both
10. Add to main hub card

---

## Category 5: Data & Utility Tools (8 sites)

### 33. JSON Toolbox
**Folder:** `json-toolbox/`
**Description:** Format, validate, query (JSONPath), diff, schema gen, CSV↔JSON, YAML↔JSON, minify.
**Tasks:**
1. Project scaffold: dual-pane (input/output), tabs for each tool
2. Format/prettify (indent 2/4/tabs), minify, validate with error location
3. JSONPath query (search, filter, transform), result preview
4. JSON Diff: two inputs → visual diff (added/removed/changed), merge
5. JSON Schema generator (from sample), Schema validator
6. Convert: CSV ↔ JSON (options: header, delimiter, quote), YAML ↔ JSON, TOML ↔ JSON
7. JSON Lines (NDJSON) support, split/join
8. Export: download, copy, shareable URL
9. Large file streaming (Web Workers, 10MB+)
10. Add to main hub card

---

### 34. CSV / TSV Explorer
**Folder:** `csv-explorer/`
**Description:** Load CSV → virtualized table (100k+ rows), filter, sort, pivot, chart, SQL query, export.
**Tasks:**
1. Project scaffold: drag-drop, paste, URL load, sample data
2. Virtualized table (canvas or tanstack-virtual): sort, filter, column resize, pin, hide
3. Type inference (number, date, boolean, string), per-column format
4. Filter: text, number range, date range, multi-select, custom expression
5. Pivot table: rows, cols, values (sum, avg, count, min, max, median)
6. Charts: bar, line, scatter, histogram, box plot (column vs column)
7. SQL query (WebSQL/SQLite WASM): `SELECT * FROM data WHERE...`
8. Export: CSV, JSON, Parquet (WASM), SQLite DB
9. Shareable view (URL with filter/sort state)
10. Add to main hub card

---

### 35. Base64 / Encoding Toolbox
**Folder:** `encoding-toolbox/`
**Description:** Base64/32/16, URL-safe, URL encode/decode, HTML entities, JWT, Hash, Crypto (AES-GCM), PEM.
**Tasks:**
1. Project scaffold: tabbed (Base64, URL, HTML, JWT, Hash, Crypto, PEM)
2. Base64: encode/decode, file→Base64, Base64→file (download), URL-safe toggle
3. Base32 / Base16 (hex) encode/decode
4. URL encode/decode (component vs full), HTML entity encode/decode
5. JWT: decode, verify, sign (same as Site 1/8 but unified)
6. Hash: MD5, SHA-1/256/512, SHA-3, BLAKE2, RIPEMD, HMAC
7. Crypto: AES-GCM encrypt/decrypt (key from password/PBKDF2), generate key
8. PEM: cert/key viewer, extract public key, fingerprint
9. Batch: multiple lines → table, file drag-drop
10. Add to main hub card

---

### 36. Unit Converter Pro
**Folder:** `unit-converter/`
**Description:** 50+ categories (length, weight, temp, currency, data, time, fuel, cooking, engineering). Offline.
**Tasks:**
1. Project scaffold: category grid, search, favorites
2. Categories: Length, Area, Volume, Mass, Temperature, Time, Speed, Acceleration, Force, Energy, Power, Pressure, Data, Bandwidth, Angle, Frequency, Fuel Economy, Cooking, Typography, Currency (offline rates), Radiation, Viscosity, Torque, Illuminance, Magnetic, Electrical, etc.
3. Bidirectional conversion (A→B and B→A linked)
4. Precision control, scientific notation, fraction output
5. History (last 20), pin frequent conversions
6. Custom units: define base + ratio
7. Compare mode: multiple units same value (1 m = 3.28 ft = 39.37 in...)
8. Export conversion table (CSV, markdown)
9. Shareable URL with value+units
10. Add to main hub card

---

### 37. Date & Time Calculator
**Folder:** `datetime-calc/`
**Description:** Duration between dates, add/subtract, business days, timezone convert, recurrence, age, countdown.
**Tasks:**
1. Project scaffold: tabbed (Duration, Add/Subtract, Business Days, Timezone, Recurrence, Age, Countdown)
2. Duration: two dates → years/months/weeks/days/hours/minutes/seconds, ISO 8601
3. Add/Subtract: base date + duration (ISO 8601 or human) → result
4. Business days: add/subtract workdays, holidays (US/UK/DE/JP/custom), half-days
5. Timezone: date+time in zone A → zone B, meeting planner overlap
6. Recurrence: RRULE generator/parser, next N occurrences, iCal export
7. Age: birthdate → exact age, next birthday, zodiac, milestones
8. Countdown: target date → live timer, shareable embed
9. Calendar view (month) with result highlighted
10. Add to main hub card

---

### 38. QR Code & Barcode Studio
**Folder:** `qr-barcode-studio/`
**Description:** Generate QR (v1-40, ECL, logo, colors, shapes), DataMatrix, PDF417, Code128, UPC, EAN. Batch, style, scan test.
**Tasks:**
1. Project scaffold: type tabs (QR, DataMatrix, PDF417, Code128, UPC-A, EAN-13, etc.)
2. QR: version, error correction, mask, data segments (text, URL, vCard, WiFi, email, SMS, geo, calendar)
3. Styling: foreground/background color, gradient, logo/image embed (with quiet zone), dot/shape style (rounded, square, dots)
4. Other barcodes: options per spec (bearers, guards, add-ons)
5. Batch: CSV/JSON → multiple codes → ZIP (PNG/SVG)
6. Scan test: webcam scanner (verify readability), debug overlay
7. Export: PNG (1x-10x), SVG, PDF (print sheet), HTML `<img>`, CSS background
8. Presets: business card, WiFi sign, event badge, product label
9. History (last 50), shareable URL
10. Add to main hub card

---

### 39. Lorem Ipsum & Test Data Generator
**Folder:** `test-data-gen/`
**Description:** Lorem Ipsum (variants), fake names, emails, addresses, phones, credit cards, users, products, JSON/CSV/SQL.
**Tasks:**
1. Project scaffold: category tabs (Text, People, Commerce, Finance, Tech, Custom)
2. Lorem: classic, corporate, hipster, legal, pirate, zombie, cupcake, bacon, samuel jackson — paragraphs/words/bytes
3. People: name (locale), email, phone (format), address, SSN, DOB, avatar (DiceBear)
4. Commerce: product (name, sku, price, category, description), order, review
5. Finance: credit card (valid Luhn), IBAN, BIC, BTC address, transaction
6. Tech: UUID, IP (v4/v6), MAC, User-Agent, JWT, API key, semver, docker image
7. Custom schema: define fields → generate N rows (JSON, CSV, SQL INSERT, NDJSON)
8. Locale support (30+): names, addresses, phones, lorem
9. Export: file download, copy, stream large datasets (Web Worker)
10. Add to main hub card

---

### 40. Command Palette / Launcher (Site-Level)
**Folder:** `command-palette/`
**Description:** Press `Cmd/Ctrl+K` anywhere on your hub → fuzzy search all 59+ tools, jump instantly. Also standalone embeddable.
**Tasks:**
1. Project scaffold: standalone page + embeddable script (`<script src="...">`)
2. Index all hub tools: name, description, URL, tags, keywords (from manifest.json)
3. Fuzzy search (Fuse.js): title, description, tags, keywords
4. Keyboard: Cmd/Ctrl+K open, arrows navigate, Enter go, Esc close
5. Recent/frequent (localStorage), pinned favorites
6. Actions: open in new tab, copy URL, copy markdown link
7. Theme: matches host (dark/light), custom CSS vars
8. Manifest generator: crawl hub → JSON index (run at build)
9. Embed guide: one-line install, `data-config` options
10. Add to main hub card (and integrate into hub itself!)

---

## Implementation Order (Batches of 5)

| Batch | Sites | Est. Effort |
|-------|-------|-------------|
| 1 | 1-5 (JWT, Hash, UUID, Cron, Regex) | Dev tools — high reuse |
| 2 | 6-10 (CSS Shadow, Image, JWT Toolbox, Meeting, Habit) | Mix dev + productivity |
| 3 | 11-15 (Breathing, Ambient, Text Analyzer, Pomodoro, Decision) | Productivity focus |
| 4 | 16-20 (Finance, Minesweeper, Typing, Aim, Simon) | Games + finance |
| 5 | 21-25 (Word Ladder, 2048, Chess, Geo, Palette) | Games + creative |
| 6 | 26-30 (Poster, ASCII, Blob, Gradient, SVG Icons) | Creative tools |
| 7 | 31-35 (Favicon, Contrast, JSON, CSV, Encoding) | Data/utilities |
| 8 | 36-40 (Units, Date, QR, Test Data, Command Palette) | Utilities + meta |

---

## Shared Infrastructure (Do Once, Use Everywhere)

1. **Bubble Theme Package** — CSS custom properties, bubble background, button styles, card layout → `shared/theme.css` + `shared/bubbles.js`
2. **Hub Manifest** — `sites-manifest.json` with all 59 sites (name, folder, icon, description, tags, URL) → used by Command Palette + hub auto-generation
3. **Deploy Script** — `deploy.ps1` / `deploy.sh` → builds all, updates hub `index.html` from manifest, `git add/commit/push`
4. **Shared Components** — Toast, Modal, Tooltip, CopyButton, ColorPicker, FileDropZone → `shared/components/`
5. **Analytics (Privacy-First)** — Plausible/Umami self-hosted or simple localStorage session count
6. **PWA Manifest + Service Worker** — each site installable, offline-capable where possible