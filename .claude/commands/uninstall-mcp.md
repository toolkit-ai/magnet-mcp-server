---
description: Remove local or canary MCP server configurations
---

# Uninstall MCP Server

Help me remove MCP server configurations (magnet-local and/or magnet-canary).

Follow the mcp-uninstall skill instructions in `.claude/skills/mcp-uninstall/SKILL.md` to:

1. Ask which configuration to remove (local, canary, or both)
2. Check project (~/magnet-app/.mcp.json), Cursor, Claude Desktop, and global (~/.claude/) locations
3. Show what will be removed
4. Confirm before removing
5. Remove the configurations
6. Report results

Use the AskUserQuestion tool to gather information interactively.
