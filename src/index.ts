#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getIssue, listIssues, createIssue, updateIssue, getPage, listPages, createPage, updatePage } from "./magnetApi.js";
import { z } from "zod";

const mcpServer = new McpServer({
  name: "magnet-mcp-server",
  version: "0.1.0"
});

// Zod schemas for tool input
const GetIssueByIdInputSchema = {
  id: z.string().describe("The issue ID")
};
const ListIssuesInputSchema = {};

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

// Page input schemas
const ListPagesInputSchema = {};

const GetPageByIdInputSchema = {
  id: z.string().describe("The page ID")
};

const CreatePageInputSchema = {
  title: z.string().describe("The page title"),
  docContent: TipTapJSONContentSchema.describe("The page content in TipTap JSON format"),
  pageType: z.string().optional().describe("Page type (e.g., 'note', 'sprint_planning', 'context_doc_label')"),
  properties: z.record(z.any()).optional().describe("Page properties as a JSON object")
};

const UpdatePageInputSchema = {
  id: z.string().describe("The page ID to update"),
  title: z.string().optional().describe("Updated page title"),
  docContent: TipTapJSONContentSchema.optional().describe("Updated page content in TipTap JSON format"),
  properties: z.record(z.any()).optional().describe("Updated page properties as a JSON object")
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
    description: "List all issues for your organization in Magnet. The organization is determined automatically from your API key. Each issue includes a 'baseBranch' field which indicates the target branch for any pull requests related to that issue.",
    inputSchema: ListIssuesInputSchema
  },
  async (input: any, request: any) => {
    try {
      const issues = await listIssues();
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
    description: "Create a new issue in Magnet. The issue content must be provided in TipTap JSON format. A simple example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Issue description'}]}]}. The organization is determined by your API key.",
    inputSchema: CreateIssueInputSchema
  },
  async (input: any, request: any) => {
    try {
      const issue = await createIssue({
        title: input.title,
        description: input.description,
        docContent: input.docContent,
        status: input.status,
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

// Register page tools
mcpServer.registerTool(
  "list_pages",
  {
    title: "List Pages",
    description: "List all pages for your organization in Magnet. The organization is determined automatically from your API key.",
    inputSchema: ListPagesInputSchema
  },
  async (input: any, request: any) => {
    try {
      const pages = await listPages();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(pages, null, 2)
        }]
      };
    } catch (error) {
      throw error;
    }
  }
);

mcpServer.registerTool(
  "get_page_by_id",
  {
    title: "Get Page by ID",
    description: "Fetch a single page by its ID from Magnet.",
    inputSchema: GetPageByIdInputSchema
  },
  async (input: { id: string }, request: any) => {
    try {
      const page = await getPage({ id: input.id });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(page, null, 2)
        }]
      };
    } catch (error) {
      throw error;
    }
  }
);

mcpServer.registerTool(
  "create_page",
  {
    title: "Create Page",
    description: "Create a new page in Magnet. The page content must be provided in TipTap JSON format. A simple example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Page content'}]}]}. The organization is determined automatically from your API key.\n\nPage types:\n- 'note' (default): A general note or document\n- 'sprint_planning': A sprint planning document\n- 'context_doc_label': A context documentation page\n\nIf pageType is not specified, it defaults to 'note'. Properties can be provided as an optional JSON object for additional metadata specific to the page type.",
    inputSchema: CreatePageInputSchema
  },
  async (input: any, request: any) => {
    try {
      const page = await createPage({
        title: input.title,
        docContent: input.docContent,
        pageType: input.pageType,
        properties: input.properties
      });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(page, null, 2)
        }]
      };
    } catch (error) {
      throw error;
    }
  }
);

mcpServer.registerTool(
  "update_page",
  {
    title: "Update Page",
    description: "Update an existing page in Magnet. You can update the title, content (in TipTap JSON format), or properties. Only provide the fields you want to update.",
    inputSchema: UpdatePageInputSchema
  },
  async (input: any, request: any) => {
    try {
      const updates: any = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.docContent !== undefined) updates.docContent = input.docContent;
      if (input.properties !== undefined) updates.properties = input.properties;

      const page = await updatePage({ id: input.id, updates });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(page, null, 2)
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

