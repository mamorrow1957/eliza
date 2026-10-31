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
  eliza.spec.js     — Playwright end-to-end tests (84 tests)
scripts/
  deploy.sh         — Rsync to /var/www/html on the host, writes last-updated.js, then stamps ?v=<commit> into the deployed script URLs
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

The `deploy` CI job runs automatically on pushes to `main`. It pulls the latest code on the server, rsyncs the static files to `/var/www/html`, writes `last-updated.js` with the commit time of the deployed code (shown in the page footer), and stamps the commit into the script URLs of the deployed page (`eliza.js?v=<commit>`) so caches never serve an old script. The server's nginx also sends `Cache-Control: no-cache` for `.js` and `.html` files; that setting lives on the server, not in this repo.

### Caching (Cloudflare)

`eliza.morroweb.com` is served through Cloudflare, which caches static files (such as `.js`) and tells browsers to keep them for up to 4 hours. Two things keep a deploy from showing stale code:

- `deploy.sh` stamps the commit into the script URLs (`eliza.js?v=<commit>`), so every deploy loads a new address that no cache has seen.
- The server's nginx sends `Cache-Control: no-cache` for `.js` and `.html`, so Cloudflare re-checks them on every request.

If a change still looks missing on the live site, hard-reload the page first (Cmd+Shift+R). If that does not help, purge the file in the Cloudflare dashboard: **Caching → Configuration → Custom Purge**, enter the full URL (for example `https://eliza.morroweb.com/eliza.js`), and click **Purge**.

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
