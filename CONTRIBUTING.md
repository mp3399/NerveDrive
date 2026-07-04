# Contributing

Thanks for helping improve VitalScope!

## Setup

```bash
npm install
npm run dev
```

Node 22 is recommended (`.nvmrc`).

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — type-check + production build
- `npm run preview` — serve the build
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — unit tests (Vitest)

## Ground rules

1. **Never add anything that transmits health data or file contents off-device.** This is the project's reason to exist.
2. Keep the **analysis engine** (`src/lib/`) framework-free and pure so it stays testable.
3. New metrics: add the HealthKit identifier to `TYPE_MAP` in `parse.ts`, accumulate it, then surface it in `analysis.ts` and a section.
4. UI follows the existing design tokens (`src/index.css`, `tailwind.config.ts`). Prefer the `ui/` primitives.
5. Run `npm run lint` and `npm run build` before opening a PR.

## Commit style

Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## Adding a data provider

Implement a parser that emits the same `Parsed` shape as `parse.ts`, then the entire analysis + UI stack works unchanged. See `ROADMAP.md`.
