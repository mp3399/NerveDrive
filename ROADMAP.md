# Roadmap

## Now
- Apple Health `Export.zip` parsing, full analysis, interactive dashboard, exports. ✅

## Next
- Route-level code-splitting so ECharts loads only with the dashboard.
- PWA / offline install with self-hosted fonts.
- ECG waveform viewer (the export already contains ECG CSVs).
- GPX workout-route maps (routes are in the export).
- Period-over-period comparison (this month vs last, year vs year).
- Saved snapshots via `localStorage` (opt-in, on-device only).
- Vitest coverage for the analysis engine and a golden-file test.

## Later — multi-source
The parser is abstracted behind a `Parsed` shape, so new providers slot in cleanly:
- Google Fit / Health Connect
- Garmin, Fitbit, WHOOP, Oura, Polar, Strava

## Exploratory
- On-device LLM summary (WebGPU) for a natural-language narrative — still zero data leaving the device.
- Doctor-shareable one-page PDF.
- Family dashboard (multiple local profiles).
