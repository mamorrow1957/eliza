#!/bin/bash
set -euo pipefail

if sudo test -d /var/www/html; then
  backup="/var/www/html.backup.$(date +%Y%m%d_%H%M%S)"
  echo "Backing up /var/www/html to ${backup}..."
  sudo cp -a /var/www/html "${backup}"
  echo "Backup complete."
fi

echo "Copying /home/michael/eliza to /var/www/html..."
sudo rsync -av --delete --delete-excluded \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='.claude' \
  --exclude='node_modules' \
  --exclude='tests' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='playwright.config.js' \
  --exclude='*.md' \
  /home/michael/eliza/ /var/www/html/

# Footer timestamp: when the deployed code last changed (commit time of the checkout's HEAD).
commit_time="$(git -C /home/michael/eliza log -1 --format=%cI)"
echo "Writing last-updated.js (${commit_time})..."
printf 'window.ELIZA_LAST_UPDATED = "%s";\n' "${commit_time}" | sudo tee /var/www/html/last-updated.js >/dev/null

# Cache busting: Cloudflare and browsers cache .js files, so stamp the commit into the script URLs of the
# deployed page (eliza.js?v=abc1234). Only the deployed copy of index.html is rewritten, never the repo's.
version="$(git -C /home/michael/eliza rev-parse --short HEAD)"
echo "Stamping script URLs with v=${version}..."
sudo sed -i \
  -e "s|src=\"last-updated.js\"|src=\"last-updated.js?v=${version}\"|" \
  -e "s|src=\"eliza.js\"|src=\"eliza.js?v=${version}\"|" \
  /var/www/html/index.html
for name in eliza.js last-updated.js; do
  sudo grep -q "src=\"${name}?v=${version}\"" /var/www/html/index.html || { echo "ERROR: ${name} version stamp was not applied"; exit 1; }
done
echo "Done."
