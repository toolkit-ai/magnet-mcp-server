#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getIssue, listIssues, createIssue, updateIssue } from "./magnetApi.js";
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

// TipTap JSON Content Schema (recursive for nested content)
const TipTapJSONContentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    attrs: z.record(z.any()).optional(),
    content: z.array(TipTapJSONContentSchema).optional(),
    marks: z.array(z.object({
      type: z.string(),
      attrs: z.record(z.any()).optional()
    })).optional(),
    text: z.string().optional()
  })
);

const CreateIssueInputSchema = {
  title: z.string().optional().describe("The issue title (optional, will be auto-generated if not provided)"),
  description: z.string().describe("A brief description of the issue"),
  docContent: TipTapJSONContentSchema.describe("The issue content in TipTap JSON format"),
  status: z.string().optional().describe("Issue status (e.g., 'todo', 'in_progress', 'done')"),
  organizationId: z.string().describe("The organization ID"),
  baseBranch: z.string().describe("The base branch for pull requests (e.g., 'main', 'canary')")
};

const UpdateIssueInputSchema = {
  id: z.string().describe("The issue ID to update"),
  title: z.string().optional().describe("Updated issue title"),
  docContent: TipTapJSONContentSchema.optional().describe("Updated issue content in TipTap JSON format"),
  status: z.string().optional().describe("Updated issue status"),
  assigneeClerkId: z.string().optional().describe("Updated assignee Clerk user ID"),
  baseBranch: z.string().optional().describe("Updated base branch")
};

// Register tools for direct invocation
mcpServer.registerTool(
  "get_issue_by_id",
  {
    title: "Get Issue by ID",
    description: "Fetch a single issue by its ID from Magnet. The issue includes a 'baseBranch' field which indicates the target branch for any pull requests related to this issue.",
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
    description: "List all issues for an organization in Magnet. Each issue includes a 'baseBranch' field which indicates the target branch for any pull requests related to that issue.",
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

mcpServer.registerTool(
  "create_issue",
  {
    title: "Create Issue",
    description: "Create a new issue in Magnet. The issue content must be provided in TipTap JSON format. A simple example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Issue description'}]}]}",
    inputSchema: CreateIssueInputSchema
  },
  async (input: any, request: any) => {
    try {
      const issue = await createIssue({
        title: input.title,
        description: input.description,
        docContent: input.docContent,
        status: input.status,
        organizationId: input.organizationId,
        baseBranch: input.baseBranch
      });
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
  "update_issue",
  {
    title: "Update Issue",
    description: "Update an existing issue in Magnet. You can update the title, content (in TipTap JSON format), status, assignee, or base branch. Only provide the fields you want to update.",
    inputSchema: UpdateIssueInputSchema
  },
  async (input: any, request: any) => {
    try {
      const updates: any = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.docContent !== undefined) updates.docContent = input.docContent;
      if (input.status !== undefined) updates.status = input.status;
      if (input.assigneeClerkId !== undefined) updates.assigneeClerkId = input.assigneeClerkId;
      if (input.baseBranch !== undefined) updates.baseBranch = input.baseBranch;

      const issue = await updateIssue({ id: input.id, updates });
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

//console.log("Magnet MCP Server is running...");
// // Add error handling
// transport.onerror = (error: any) => {
//   console.error("Transport error:", error.toString());
// };

// transport.onclose = () => {
//   console.error("Transport closed");
// };

