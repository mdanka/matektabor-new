#!/usr/bin/env bash
set -euo pipefail

# Initialize dev environment for a git worktree.
# Worktrees share the git history but not untracked/ignored files like
# node_modules, so dependencies need to be installed separately.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Use correct Node version
if command -v fnm &>/dev/null; then
    fnm use --install-if-missing
elif command -v nvm &>/dev/null; then
    nvm install
fi

# Install root dependencies
echo "Installing root dependencies..."
yarn install --frozen-lockfile

# Install Cloud Functions dependencies
echo "Installing functions dependencies..."
(cd functions && yarn install --frozen-lockfile)

echo "Dev environment ready. Run 'yarn start' to launch."
