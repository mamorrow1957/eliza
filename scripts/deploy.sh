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
echo "Done."
