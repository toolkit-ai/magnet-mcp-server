import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getIssue, listIssues } from "./magnetApi.js";
import { z } from "zod";

const mcpServer = new McpServer({
  name: "magnet-mcp-server",
  version: "0.1.0"
});

// Zod schemas for tool input
const GetIssueByIdInputSchema = {
  id: z.string().describe("The issue ID")
};
const ListIssuesInputSchema = {
  organizationId: z.string().describe("The organization ID")
};

// Register tools for direct invocation
mcpServer.registerTool(
  "get_issue_by_id",
  {
    title: "Get Issue by ID",
    description: "Fetch a single issue by its ID from Magnet.",
    inputSchema: GetIssueByIdInputSchema
  },
  async (input: { id: string }, request: any) => {
    try {
      const issue = await getIssue({ id: input.id });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(issue, null, 2)
        }]
      };
    } catch (error) {
      throw error;
    }
  }
);

mcpServer.registerTool(
  "list_issues",
  {
    title: "List Issues",
    description: "List all issues for an organization in Magnet.",
    inputSchema: ListIssuesInputSchema
  },
  async (input: { organizationId: string }, request: any) => {
    try {
      const issues = await listIssues({ organizationId: input.organizationId });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(issues, null, 2)
        }]
      };
    } catch (error) {
      throw error;
    }
  }
);

// Create stdio transport for MCP
const transport = new StdioServerTransport();

// transport._ondata = (data: any) => {
//   console.log("data", data.toString());
// }

// transport.onmessage = (message: any) => {
//   console.log("message", message.toString());
// }

// transport.onerror = (error: any) => {
//   console.error("Transport error:", error.toString());
// }
// Connect the MCP server to the transport
mcpServer.connect(transport);

// // Add error handling
// transport.onerror = (error: any) => {
//   console.error("Transport error:", error.toString());
// };

// transport.onclose = () => {
//   console.error("Transport closed");
// };

