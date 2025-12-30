# Magnet MCP Server

MCP server that integrates Claude and other MCP clients with Magnet, a task/issue management platform. Exposes tools for reading, creating, and updating issues and pages via markdown.

## Commands

- `pnpm build` - Compile TypeScript to dist/
- `pnpm dev` - Build and run with tsx (hot reloading)
- `pnpm start` - Run compiled server from dist/
- `pnpm mcp-config` - Generate MCP client configuration snippets

## Architecture

Three source files in `src/`:

- **index.ts** - MCP server initialization, tool registration (8 tools)
- **magnetApi.ts** - HTTP client for Magnet REST API endpoints
- **types.ts** - TypeScript interfaces and Zod validation schemas

## Code Patterns

### Tool Registration
```typescript
mcpServer.registerTool(
  "tool_id",
  { title, description, inputSchema: ZodSchema },
  async (input, request) => {
    const result = await apiFunction(input);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);
```

### API Functions
- Use markdown APIs (`*WithMarkdown` functions) for user-facing operations
- All API functions use `fetch()` with `x-api-key` header authentication
- Error handling checks status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found)

### Type Conventions
- `Issue` / `IssueWithMarkdown` - Issues with JSON or markdown content
- `Page` / `PageWithMarkdown` - Pages with JSON or markdown content
- `*MarkdownPreview` - Truncated preview variants (first 100 words)

## Environment Variables

- `MAGNET_API_KEY` (required) - API key from Magnet workspace settings
- `MAGNET_WEB_API_BASE_URL` (optional) - Defaults to https://www.magnet.run

## Slash Commands

- `/publish` - Publish package to NPM (runs the npm-deploy skill)
- `/setup-local-mcp` - Set up local MCP server for development

## Development

Node.js >= 22.2.0 required (managed via Volta). No test framework configured - test manually via MCP clients (Claude Desktop, Cursor, Claude Code).
