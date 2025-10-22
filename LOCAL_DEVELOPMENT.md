# Local Development Guide

## Prerequisites

- Node.js >= 22.2.0
- pnpm package manager

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/toolkit-ai/magnet-mcp-server.git
   cd magnet-mcp-server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.local` to `.env` and update with your values:

   ```bash
   cp .env.local .env
   ```

   Then edit `.env` and add your API key.

## Development Workflow

### Building the project

```bash
pnpm build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`.

### Running locally

```bash
# Build and run
pnpm dev

# Or run the compiled version
pnpm start
```

### Testing with MCP clients

To test the MCP server locally with Claude Desktop, Cursor, or Claude Code, update your MCP configuration to point to the local build:

```json
{
  "command": "node",
  "args": [
    "/absolute/path/to/magnet-mcp-server/dist/index.js"
  ],
  "env": {
    "MAGNET_API_KEY": "your-api-key-here"
  }
}
```

Or test directly with the dev script:

```json
{
  "command": "pnpm",
  "args": [
    "--dir",
    "/absolute/path/to/magnet-mcp-server",
    "dev"
  ],
  "env": {
    "MAGNET_API_KEY": "your-api-key-here"
  }
}
```

## Testing Against Local Magnet Server

If you're running a local instance of the Magnet web server (e.g., for development):

1. **Set the base URL environment variable:**
   ```bash
   export MAGNET_WEB_API_BASE_URL="http://localhost:3000"
   ```

2. **Get an API key from your local Magnet instance:**
   - Navigate to `http://localhost:3000/settings`
   - Generate an API key for your workspace
   - Set it as `MAGNET_API_KEY`

3. **Run the MCP server:**
   ```bash
   MAGNET_WEB_API_BASE_URL="http://localhost:3000" MAGNET_API_KEY="your-local-api-key" pnpm dev
   ```

## Available Tools

The MCP server provides the following tools:

- **`get_issue_by_id`**: Fetch a single issue by its ID
  - Input: `{ id: string }`
  - Returns: Full issue object including `baseBranch` field

- **`list_issues`**: List all issues for an organization
  - Input: `{ organizationId: string }`
  - Returns: Array of issue objects

## Project Structure

```
magnet-mcp-server/
├── src/
│   ├── index.ts         # Main MCP server setup
│   ├── magnetApi.ts     # API client for Magnet
│   └── types.ts         # TypeScript type definitions
├── dist/                # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Troubleshooting

### "MAGNET_API_KEY is not set" error

Make sure you've exported the `MAGNET_API_KEY` environment variable before running the server.

### Node version issues

Ensure you're using Node.js >= 22.2.0. You can check your version with:
```bash
node --version
```

If you're using `volta`, it will automatically use the correct version specified in `package.json`.

### Connection issues with local Magnet server

- Verify your local Magnet server is running
- Check that `MAGNET_WEB_API_BASE_URL` points to the correct URL
- Ensure the API key is valid for your local instance
