# Magnet MCP Server

An MCP server for interacting with Magnet (magnet.run)

## Setup

To set it up:

1. Generate an API key for your Workspace (Organization) at 
[https://magnet.run/settings](https://magnet.run/settings) or from the Settings -> MCP section of the Desktop app.

2. Set up your MCP server configuration:

**For Cursor or Claude Desktop** (add to your MCP settings JSON):
```json
{
  "Magnet": {
    "command": "npx",
    "args": [
      "-y",
      "@magnet-ai/magnet-mcp-server"
    ],
    "env": {
      "MAGNET_API_KEY": "your-api-key-here"
    }
  }
}
```

**For Claude Code** (run this command):
```bash
claude mcp add --transport stdio Magnet --env MAGNET_API_KEY=your-api-key-here -- npx -y @magnet-ai/magnet-mcp-server
```

### 💡 TIP:
If you are seeing issues getting your MCP server configuration working, consider that it might be an issue with the node / npx version, and try to put a full path to the npx you would like to use in the `"command"` field.

## Local Development

For instructions on developing and testing locally, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md).

