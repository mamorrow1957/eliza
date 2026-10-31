# ELIZA — DOCTOR Script

A browser-based implementation of [ELIZA](https://en.wikipedia.org/wiki/ELIZA), the classic 1966 natural-language chatbot from the MIT Artificial Intelligence Laboratory. Runs the original DOCTOR script, which responds as a Rogerian psychotherapist.

## What it is

ELIZA is a pure static web app — one HTML file and one JavaScript file, no build step, no dependencies at runtime. It runs entirely in the browser.

The retro green-on-black terminal aesthetic is intentional.

A small footer under the input shows when the code last changed (for example `Last updated Aug 16, 2026, 1:26 PM EDT`, in Eastern time). It is filled in by the deploy script and stays hidden when you open the page locally.

## Project layout

```
index.html          — UI shell (layout, styles, input handling, last-updated footer)
eliza.js            — ELIZA engine (pattern matching, DOCTOR script rules) and footer rendering
last-updated.js     — written by deploy.sh on the server only (not in git); sets the footer date
tests/
  eliza.spec.js     — Playwright end-to-end tests (83 tests)
scripts/
  deploy.sh         — Rsync to /var/www/html on the host, then writes last-updated.js
.gitlab-ci.yml      — CI: run tests (Docker/node:20), deploy on main
```

## Development

No build step required. Open `index.html` directly in a browser. The footer stays hidden locally because `last-updated.js` only exists on the server.

## Testing

Tests use [Playwright](https://playwright.dev/) and run against the local `index.html` via a `file://` URL. The footer tests inject `window.ELIZA_LAST_UPDATED` themselves, because `last-updated.js` does not exist locally.

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```

## Deployment

The `deploy` CI job runs automatically on pushes to `main`. It pulls the latest code on the server, rsyncs the static files to `/var/www/html`, and writes `last-updated.js` with the commit time of the deployed code (shown in the page footer).

To deploy manually from the server:

```bash
cd ~/eliza && git pull origin main
~/eliza/scripts/deploy.sh
```

## CI/CD

| Branch | Test | Deploy |
|--------|------|--------|
| `main` | ✓    | ✓      |
| `dev`  | ✓    | —      |
