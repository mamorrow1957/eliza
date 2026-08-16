# ELIZA — DOCTOR Script

A browser-based implementation of [ELIZA](https://en.wikipedia.org/wiki/ELIZA), the classic 1966 natural-language chatbot from the MIT Artificial Intelligence Laboratory. Runs the original DOCTOR script, which responds as a Rogerian psychotherapist.

## What it is

ELIZA is a pure static web app — one HTML file and one JavaScript file, no build step, no dependencies at runtime. It runs entirely in the browser.

The retro green-on-black terminal aesthetic is intentional.

## Project layout

```
index.html          — UI shell (layout, styles, input handling)
eliza.js            — ELIZA engine (pattern matching, DOCTOR script rules)
tests/
  eliza.spec.js     — Playwright end-to-end tests
scripts/
  deploy.sh         — Rsync to /var/www/html on the host
.gitlab-ci.yml      — CI: run tests (Docker/node:20), deploy on main
```

## Development

No build step required. Open `index.html` directly in a browser.

## Testing

Tests use [Playwright](https://playwright.dev/) and run against the local `index.html` via a `file://` URL.

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```

## Deployment

The `deploy` CI job runs automatically on pushes to `main`. It pulls the latest code on the server and rsyncs the static files to `/var/www/html`.

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
