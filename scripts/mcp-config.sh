#!/bin/bash

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Read the API key from .env if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  source "$PROJECT_DIR/.env"
fi

# Use placeholder if no API key found
API_KEY="${MAGNET_API_KEY:-your-api-key-here}"
BASE_URL="${MAGNET_WEB_API_BASE_URL:-http://magnet.run}"

echo "Copy this configuration to your MCP client (Claude Desktop, Cursor, or Claude Code):"
echo ""
echo "==================================================================="
cat <<EOF
{
  "command": "node",
  "args": [
    "$PROJECT_DIR/dist/index.js"
  ],
  "env": {
    "MAGNET_API_KEY": "$API_KEY",
    "MAGNET_WEB_API_BASE_URL": "$BASE_URL"
  }
}
EOF
echo "==================================================================="
echo ""
echo "Or use pnpm dev for hot reloading during development:"
echo ""
echo "==================================================================="
cat <<EOF
{
  "command": "pnpm",
  "args": [
    "--dir",
    "$PROJECT_DIR",
    "dev"
  ],
  "env": {
    "MAGNET_API_KEY": "$API_KEY",
    "MAGNET_WEB_API_BASE_URL": "$BASE_URL"
  }
}
EOF
echo "==================================================================="
