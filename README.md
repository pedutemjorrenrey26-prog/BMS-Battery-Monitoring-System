# AutoVolt Monitor

A responsive thesis demonstration for “Development of IoT-Based Battery Monitoring System for Conventional 12V Automotive Battery.” Built with React 19, TypeScript, TanStack Start, Vite, Lucide icons, and Netlify hosting.

## What is available

Dashboard with explicitly labeled static sample voltage, temperature, estimated SoC, condition, and illustrative history. History periods and the accessible data table work locally in the interface. Test Results contains the supplied thesis averages and CSV export. System Information describes the device, sensors, GSM, and Blynk. Navigation uses URL hashes so views can be linked and refreshed.

The app does not connect to hardware or Blynk. Both connection states are disconnected. Sample telemetry is not measured data. Normal is a demonstration condition, not a battery diagnosis. The reported study statistics are kept separate from fixtures and are not recalculated from average voltages.

## Run locally

Use Node.js 22.13 or later on the Node 22 line, or a supported newer release. Install dependencies with `pnpm install`, then run `pnpm dev`. For Netlify emulation use `netlify dev --port 8889`. No credentials are needed for the demo.

## Deploy for free

1. Put this project in your Git repository and sign in to Netlify. Choose Add new project → Import an existing project and select the repository.
2. Use the included `netlify.toml`: build command `vite build`, publish directory `dist/client`. The Netlify adapter configures server rendering.
3. Deploy and open the generated HTTPS `netlify.app` URL on your phone or computer. Future pushes trigger deployments.

The demonstration needs no paid API, database, or custom domain. Netlify's Free plan is subject to current usage/credit limits; check the account usage page before a public demonstration. Live functions and Blynk may have their own quotas. This source is ready for the platform's automatic build validation; no local build or tests were run during generation.

## Connect Blynk securely later

Do not place a Blynk token in React source, public assets, client storage, client environment variables, or a browser request. Never use a `VITE_` prefix for secrets.

1. Confirm the device's actual Blynk region, datastream virtual pins, types, units, update interval, and SoC calculation. No pin mapping is assumed here. SoC must come from the validated device calculation or a documented model, not a simplistic mapping during charging.
2. Create a server-only Netlify Function `netlify/functions/telemetry.mts`. Store the device token as a secret Netlify environment variable `BLYNK_AUTH_TOKEN`, scoped to Functions/runtime. Set a server-only, allowlisted Blynk regional host and pin mapping. Use a separate test device for previews. Keep local secrets out of Git.
3. From that function, call the documented Blynk External API using server-side fetch, an HTTPS regional host, fixed allowed datastreams, and a request timeout. Blynk may require the token as a query parameter: construct that URL only on the server and never log the URL or raw upstream errors. Return only sanitized fields, never credentials or upstream response bodies.
4. Check cloud API access and device hardware connectivity independently using Blynk's documented APIs. Successful cloud requests do not prove that the device is online. Obtain the device measurement timestamp or heartbeat, since cloud values may remain after a device disconnects. Validate finite numbers, units, ranges, SoC within 0–100, and measurement age. Return missing data as null. Set `Cache-Control: no-store` and return sanitized errors for unauthorized, offline, timeout, and malformed responses.
5. Implement the response contract in `src/lib/telemetry.ts`: connection flags and a nullable live reading with `source: 'live'` and a real device `measuredAt` timestamp. The app currently imports samples directly; replace that with a telemetry hook calling the same-origin function. Add loading, error, stale and unavailable states; cancel polling on unmount and choose a poll interval within Blynk quotas. Never silently substitute sample data after live mode is selected. Historic data requires an actual time-series source; do not repurpose sample history as live history.
6. Before exposing private telemetry, protect the endpoint with application authentication and authorization, add rate limiting, and restrict access to the intended device. A hidden token alone does not make a public telemetry endpoint private.
7. Validate condition thresholds against the battery chemistry, engine-off/charging state, temperature, and thesis protocol. Return Unknown when there is insufficient information; label Normal, Warning, and Critical only when validated rules apply.

Keeping all credentials and upstream calls behind the function allows the existing UI to remain safe to share during a thesis defense.
