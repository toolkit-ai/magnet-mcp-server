#!/bin/bash

# MCP Configuration Generator for Local Development
#
# This script generates MCP client configuration for testing the Magnet MCP server locally.
#
# Usage:
#   pnpm mcp-config
#
# Prerequisites:
#   1. Build the server first: pnpm build
#   2. Set MAGNET_API_KEY in .env file (optional, will use placeholder if not set)
#   3. Set MAGNET_WEB_API_BASE_URL in .env file (optional, defaults to http://magnet.run)
#
# The script outputs two configurations:
#   1. Production config using built files (dist/index.js)
#   2. Development config with hot reloading (pnpm dev)
#
# Copy the desired configuration into your MCP client's config file:
#   - Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json
#   - Claude Code: .vscode/claude-code.json (or global settings)
#   - Cursor: Cursor settings

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
