# AutoVolt Monitor

## Architecture

React 19 and TanStack Start with TypeScript and Vite, deployed using the Netlify adapter. `src/routes/__root.tsx` owns document metadata; `src/routes/index.tsx` owns the dashboard, thesis results and system information views. Hash navigation supports direct links without extra routes. `src/styles.css` contains the responsive dark instrument-panel design. `src/lib/telemetry.ts` contains explicitly sample-only fixtures and the future live response contract. `public/` contains static assets. `netlify.toml` provides build and hosting settings.

## Conventions

Keep readable functional components, typed telemetry, semantic HTML, accessible labels, and responsive CSS. Use Lucide for icons. Keep dark navy surfaces and blue accents; status colors must also have text labels. Browser APIs belong in event handlers or effects. Do not edit generated route trees manually.

## Data integrity and security

There is no live connection, persistence, or configured Blynk token. Every illustrative measurement and history must be marked sample; do not generate fake live timestamps or connected states. Supplied thesis averages (13.92 V, 13.32 V, 0.628 V, 4.66%) are independent reported findings, not calculated from fixtures. No validated diagnostic thresholds have been supplied. The Normal condition is illustrative only.

Live work must use a server-side Netlify Function and secret runtime environment variables, never browser-side Blynk credentials. Read README.md for the planned integration boundary, freshness checks, endpoint protection and live error behavior. If storage is added, use Netlify platform storage. Do not persist demo fixture data.

## Development

Use pnpm and the existing lockfile. `pnpm dev` starts Vite; `netlify dev --port 8889` includes platform emulation. `pnpm build` is the deployment build command. Follow the active run's instructions about validation; the initial implementation was reviewed by source inspection only, with build validation left to the platform.
