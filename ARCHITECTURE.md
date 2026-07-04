# Architecture

This document explains how VitalScope is built and why. It doubles as the design rationale requested for a production-grade, open-source project.

## 1. Design principles

1. **Privacy by architecture, not by policy.** The strongest privacy guarantee is the absence of a server. Everything runs in the browser, so there is nothing to leak, log, or subpoena.
2. **Fast on real data.** Apple exports routinely exceed 200 MB. Parsing must be streaming and off-main-thread so the UI never freezes, even on a mid-range phone.
3. **Correctness over cleverness.** The analysis engine is pure, deterministic, and unit-testable, separated cleanly from React.
4. **Premium but honest UI.** The interface is polished; the copy never overclaims. Device estimates are labelled as estimates and low-confidence findings are flagged.

## 2. High-level data flow

```
File (zip/xml)
   │  (main thread: hand off)
   ▼
Web Worker ── JSZip.extract ──► locate export.xml
   │                                   │
   │                          streamed text chunks
   ▼                                   ▼
createParser().feed(chunk)  ─────────────────►  Parsed (constant-memory accumulators)
   │                                   │
   ▼                                   ▼
analyze(parsed, profile)  ──────────►  AnalysisResult (plain JSON)
   │  postMessage({type:'done'})
   ▼
Zustand store ──► React sections ──► ECharts + export engine
```

Progress messages stream back throughout so the UI can render a live, staged progress view.

## 3. Folder structure

```
vitalscope/
├── .github/                 # CI, deploy, issue/PR templates, dependabot
├── public/                  # favicon and static assets
├── src/
│   ├── main.tsx             # React entry
│   ├── App.tsx              # phase router (landing / processing / dashboard / error)
│   ├── index.css            # Tailwind layers + theme tokens (dark/light)
│   ├── types/health.ts      # all domain types + worker message contracts
│   ├── lib/
│   │   ├── parse.ts         # streaming XML parser (constant memory)
│   │   ├── analysis.ts      # pure analysis engine → AnalysisResult
│   │   ├── stats.ts         # mean/median/quantile/std/corr/streaks
│   │   ├── charts.ts        # ECharts option builders (themed)
│   │   ├── theme.ts         # reads live CSS variables for charts
│   │   ├── recommendations.ts # data-driven, ranked coach plan
│   │   ├── exporters.ts     # PDF / Markdown / CSV / JSON
│   │   └── format.ts        # display formatters
│   ├── workers/parser.worker.ts  # zip + parse + analyze, off main thread
│   ├── store/useStore.ts    # Zustand app state
│   ├── hooks/useAnalyzer.ts # spawns worker, wires progress → store
│   └── components/
│       ├── ui/              # Card, Pill, KpiCard, ScoreGauge, DotMatrixNumber, …
│       ├── charts/EChart.tsx
│       ├── layout/          # Dashboard shell, sidebar nav, export menu
│       ├── upload/          # Landing, UploadZone, Processing, ErrorScreen
│       └── sections/        # one module per dashboard section
├── ARCHITECTURE.md · PRIVACY.md · CONTRIBUTING.md · ROADMAP.md · FAQ.md
└── vite/tailwind/ts/eslint/prettier configs
```

## 4. The parsing pipeline

Apple's `export.xml` is a flat list of `<Record .../>` and `<Workout>` elements, one logical record per line. Loading it into a DOM (`DOMParser`) would need hundreds of MB and block the tab. Instead, `parse.ts` exposes `createParser()` with a `feed(chunk)` / `finalize()` interface:

- Text arrives in chunks (from `File.stream()` for raw XML, or JSZip's `internalStream` for zips).
- A line buffer splits on `\n`; each complete line is scanned with `indexOf`-based attribute extraction (no regex backtracking, no per-record object allocation for high-volume types).
- High-volume signals (heart rate, energy) are folded into running accumulators (hourly sums, min/max, zone bins) instead of being stored, keeping memory flat. Low/medium-volume signals (resting HR, HRV, sleep segments) are kept as small arrays.

Measured on a real 238 MB export: **~3 s, ~25 MB heap.** This is validated in Node and mirrors the browser path exactly.

## 5. The analysis engine

`analyze(parsed, profile)` is a pure function returning a serialisable `AnalysisResult`. It computes:

- **Window detection**: automatically trims stray historical fragments by finding gaps > 45 days, so multi-year-old one-off records don't distort stats.
- **Activity**: median/mean/percentiles, weekday vs weekend, day-of-week and monthly aggregation, streaks, distance, exercise minutes. Steps are de-duplicated across devices via per-day max-by-source.
- **Cardio**: resting HR and HRV daily means with first-vs-last-month trends, VO₂ trajectory, hourly HR profile, and HR-zone distribution.
- **Sleep**: segments are bucketed noon-to-noon, restricted to the main nocturnal episode (19:00–11:00) to exclude naps, then duration, efficiency, stage split, bedtime/wake and variability are computed.
- **Correlations**: Pearson r across daily metrics with sample sizes, plus a full matrix.
- **Anomalies**: 2σ resting-HR spikes and HRV crashes, short-sleep nights, and data contamination.
- **Population**: age- and sex-adjusted bands.
- **Scores**: nine 0–100 dimensions from evidence-based targets (methodology documented inline and in the UI).

Because the engine is framework-free, it is trivially unit-testable and reusable (CLI, tests, future integrations).

## 6. State management

A single small **Zustand** store holds the phase machine (`idle → processing → ready | error`), progress, the result, the user profile, theme, and the active section. Zustand is chosen over Redux for near-zero boilerplate and over Context for render performance (components subscribe to slices).

## 7. Visualization

**Apache ECharts** (via `echarts-for-react`) is the charting layer. It ships hover, zoom, pan, restore, and PNG/SVG download out of the box (the requested interactivity) via its toolbox, and handles large series well. Option builders in `lib/charts.ts` read live CSS variables (`lib/theme.ts`) so charts re-theme instantly on dark/light toggle. The signature dot-matrix numerals are a bespoke SVG component (`DotMatrixNumber`).

## 8. Technology choices

| Choice | Why | Trade-off considered |
|---|---|---|
| **Vite** | Instant HMR, simple static output, first-class Web Worker + ESM support. | Next.js rejected: SSR/serverless adds a backend surface that conflicts with the privacy goal. |
| **React + TypeScript** | Ubiquitous, typed domain model catches parsing/shape bugs at compile time. | N/A |
| **Tailwind** | Token-driven theming via CSS variables; fast iteration; tiny runtime. | Hand-written CSS would be slower to keep consistent. |
| **Zustand** | Minimal global state, slice subscriptions. | Redux too heavy; Context re-renders too broadly. |
| **ECharts** | Best built-in interactivity + export; scales to large datasets. | Recharts/Chart.js lack native zoom/pan/SVG export; D3 is lower-level than needed. |
| **JSZip** | Mature client-side zip with a streaming API. | N/A |
| **Web Worker** | Keeps a multi-hundred-MB parse off the main thread. | WASM parser considered; unnecessary given JS streaming already hits ~3 s. |
| **jsPDF / PapaParse** | Client-side PDF and CSV without a server. | N/A |

## 9. Performance

Streaming parse (constant memory), all heavy work in a Worker, `notMerge` chart updates keyed by theme, and downsampled series where appropriate. The main JS bundle is dominated by ECharts; it can be code-split with `manualChunks` if first paint on the landing page matters more than dashboard readiness (the landing page does not import ECharts, so route-level splitting is the natural next optimisation).

## 10. Error handling

The worker normalises failures into human-readable messages (missing `export.xml`, empty export, corrupt zip, unexpected errors) surfaced by a dedicated `ErrorScreen` with a one-click retry. Parsing is defensive: malformed lines are skipped, NaNs are filtered, and empty datasets degrade gracefully to "--" rather than crashing.

## 11. Accessibility

Semantic landmarks, `aria-current` on nav, labelled controls, visible focus rings, keyboard-activatable dropzone and menus, WCAG-minded contrast in both themes, and `prefers-reduced-motion` handling. Charts expose data via tooltips and can be exported; a tabular equivalent accompanies most charts.

## 12. Extensibility

The parser maps HealthKit identifiers to short keys in one table (`TYPE_MAP`); adding a metric is a one-line change plus an accumulator. New provider imports (Google Fit, Garmin, Fitbit, Health Connect) can be added as alternate parsers that emit the same `Parsed` shape, after which the entire analysis and UI stack works unchanged. See [ROADMAP.md](./ROADMAP.md).
