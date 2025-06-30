# Magnet MCP Server

An MCP server for interacting with Magnet (magnet.run)

To set it up:

1. Generate an API key for your Workspace (Organization) at 
[https://magnet.run/settings](https://magnet.run/settings)

2. Set up your MCP server JSON configuration in Cursor, Claude Code, Claude Desktop or wherever you're looking to use it. Here's an example configuraition
```
{
  "command": "npx",
  "args": [
    "magnet-mcp-server"
  ],
  "env": {
    "MAGNET_API_KEY": "your-api-key-here" //Go to https://magnet.run/settings
  }
}
```
