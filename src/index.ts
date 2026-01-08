#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createIssueWithMarkdown,
  updateIssueWithMarkdown,
  getIssueMarkdown,
  listIssuesMarkdown,
  createPageWithMarkdown,
  updatePageWithMarkdown,
  getPageMarkdown,
  listPagesMarkdown,
  uploadChat,
  search,
} from './magnetApi.js';
import { z } from 'zod';

const mcpServer = new McpServer({
  name: 'magnet-mcp-server',
  version: '0.1.0',
});

// Input schemas for markdown-based tools
const CreateIssueWithMarkdownInputSchema = {
  title: z
    .string()
    .optional()
    .describe('Title of the issue. If not provided, will be auto-generated from the description.'),
  description: z
    .string()
    .describe('Description of the issue. Used for title generation if title is not provided.'),
  markdown: z
    .string()
    .describe(
      'Markdown content for the issue body. Supports standard markdown syntax including headings, lists, code blocks, links, etc.',
    ),
  status: z
    .enum(['todo', 'in_progress', 'done', 'blocked'])
    .optional()
    .describe('Status of the issue'),
  organizationId: z
    .string()
    .optional()
    .describe('ID of the organization. Optional when using API key authentication.'),
  baseBranch: z
    .string()
    .describe("Git-safe branch name for the base branch (e.g., 'main', 'canary')"),
  properties: z.record(z.unknown()).optional().describe('Optional issue properties'),
};

const UpdateIssueWithMarkdownInputSchema = {
  id: z.string().describe('ID of the issue to update'),
  title: z.string().optional().describe('New title for the issue'),
  markdown: z.string().describe('New markdown content for the issue body'),
  status: z
    .enum(['todo', 'in_progress', 'done', 'blocked'])
    .optional()
    .describe('New status for the issue'),
  assigneeClerkId: z.string().optional().describe('Clerk user ID of the assignee'),
};

const GetIssueMarkdownInputSchema = {
  id: z.string().describe('The issue ID'),
  previewOnly: z
    .boolean()
    .optional()
    .describe('If true, returns markdown preview (first 100 words) instead of full markdown'),
};

const ListIssuesMarkdownInputSchema = {
  organizationId: z
    .string()
    .optional()
    .describe('ID of the organization. Optional when using API key authentication.'),
  previewOnly: z
    .boolean()
    .optional()
    .describe('If true, returns markdown previews instead of full markdown'),
};

const CreatePageWithMarkdownInputSchema = {
  title: z.string().describe('Title of the page'),
  markdown: z.string().describe('Markdown content for the page body'),
  organizationId: z
    .string()
    .optional()
    .describe('ID of the organization. Optional when using API key authentication.'),
  pageType: z
    .enum(['note', 'context_doc_label', 'sprint_planning'])
    .optional()
    .describe("Type of page. Defaults to 'note'."),
  properties: z.record(z.unknown()).optional().describe('Optional page properties (type-specific)'),
};

const UpdatePageWithMarkdownInputSchema = {
  id: z.string().describe('ID of the page to update'),
  title: z.string().optional().describe('New title for the page'),
  markdown: z.string().describe('New markdown content for the page body'),
  properties: z.record(z.unknown()).optional().describe('New page properties (type-specific)'),
};

const GetPageMarkdownInputSchema = {
  id: z.string().describe('The page ID'),
  previewOnly: z
    .boolean()
    .optional()
    .describe('If true, returns markdown preview instead of full markdown'),
};

const ListPagesMarkdownInputSchema = {
  organizationId: z
    .string()
    .optional()
    .describe('ID of the organization. Optional when using API key authentication.'),
  previewOnly: z
    .boolean()
    .optional()
    .describe('If true, returns markdown previews instead of full markdown'),
};

// Issue tools (using markdown)

mcpServer.registerTool(
  'get_issue_by_id',
  {
    title: 'Get Issue by ID',
    description:
      "Fetch a single issue by its ID from Magnet and return it as markdown. The issue includes a 'baseBranch' field which indicates the target branch for any pull requests related to this issue. Use previewOnly=true to get a markdown preview (first 100 words) instead of full content.",
    inputSchema: GetIssueMarkdownInputSchema,
  },
  async (input: { id: string; previewOnly?: boolean }) => {
    const issue = await getIssueMarkdown({ id: input.id, previewOnly: input.previewOnly });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'list_issues',
  {
    title: 'List Issues',
    description:
      "List all issues for your organization in Magnet with markdown content. The organization is determined automatically from your API key. Each issue includes a 'baseBranch' field which indicates the target branch for any pull requests related to that issue. Use previewOnly=true to get markdown previews (first 100 words) instead of full content.",
    inputSchema: ListIssuesMarkdownInputSchema,
  },
  async (input: { organizationId?: string; previewOnly?: boolean }) => {
    const issues = await listIssuesMarkdown({
      organizationId: input.organizationId,
      previewOnly: input.previewOnly,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issues, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'create_issue',
  {
    title: 'Create Issue',
    description:
      'Create a new issue in Magnet using markdown content. Supports standard markdown syntax including headings, lists, code blocks, links, etc.',
    inputSchema: CreateIssueWithMarkdownInputSchema,
  },
  async (input: {
    title?: string;
    description: string;
    markdown: string;
    status?: 'todo' | 'in_progress' | 'done' | 'blocked';
    organizationId?: string;
    baseBranch: string;
    properties?: Record<string, unknown>;
  }) => {
    const issue = await createIssueWithMarkdown({
      title: input.title,
      description: input.description,
      markdown: input.markdown,
      status: input.status,
      organizationId: input.organizationId,
      baseBranch: input.baseBranch,
      properties: input.properties,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'update_issue',
  {
    title: 'Update Issue',
    description:
      'Update an existing issue in Magnet using markdown content. Only provided fields will be updated. Supports standard markdown syntax including headings, lists, code blocks, links, etc.',
    inputSchema: UpdateIssueWithMarkdownInputSchema,
  },
  async (input: {
    id: string;
    title?: string;
    markdown: string;
    status?: 'todo' | 'in_progress' | 'done' | 'blocked';
    assigneeClerkId?: string;
  }) => {
    const params: {
      markdown: string;
      title?: string;
      status?: 'todo' | 'in_progress' | 'done' | 'blocked';
      assigneeClerkId?: string;
    } = {
      markdown: input.markdown,
    };
    if (input.title !== undefined) params.title = input.title;
    if (input.status !== undefined) params.status = input.status;
    if (input.assigneeClerkId !== undefined) params.assigneeClerkId = input.assigneeClerkId;

    const issue = await updateIssueWithMarkdown({ id: input.id, params });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    };
  },
);

// Page tools (using markdown)

mcpServer.registerTool(
  'get_page_by_id',
  {
    title: 'Get Page by ID',
    description:
      'Fetch a single page by its ID from Magnet and return it as markdown. Use previewOnly=true to get a markdown preview instead of full content.',
    inputSchema: GetPageMarkdownInputSchema,
  },
  async (input: { id: string; previewOnly?: boolean }) => {
    const page = await getPageMarkdown({ id: input.id, previewOnly: input.previewOnly });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(page, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'list_pages',
  {
    title: 'List Pages',
    description:
      'List all pages for your organization in Magnet with markdown content. The organization is determined automatically from your API key. Use previewOnly=true to get markdown previews instead of full content.',
    inputSchema: ListPagesMarkdownInputSchema,
  },
  async (input: { organizationId?: string; previewOnly?: boolean }) => {
    const pages = await listPagesMarkdown({
      organizationId: input.organizationId,
      previewOnly: input.previewOnly,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(pages, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'create_page',
  {
    title: 'Create Page',
    description:
      "Create a new page in Magnet using markdown content. Supports standard markdown syntax including headings, lists, code blocks, links, etc.\n\nPage types:\n- 'note' (default): A general note or document\n- 'sprint_planning': A sprint planning document\n- 'context_doc_label': A context documentation page",
    inputSchema: CreatePageWithMarkdownInputSchema,
  },
  async (input: {
    title: string;
    markdown: string;
    organizationId?: string;
    pageType?: 'note' | 'context_doc_label' | 'sprint_planning';
    properties?: Record<string, unknown>;
  }) => {
    const page = await createPageWithMarkdown({
      title: input.title,
      markdown: input.markdown,
      organizationId: input.organizationId,
      pageType: input.pageType,
      properties: input.properties,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(page, null, 2),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'update_page',
  {
    title: 'Update Page',
    description:
      'Update an existing page in Magnet using markdown content. Only provided fields will be updated. Supports standard markdown syntax including headings, lists, code blocks, links, etc.',
    inputSchema: UpdatePageWithMarkdownInputSchema,
  },
  async (input: {
    id: string;
    title?: string;
    markdown: string;
    properties?: Record<string, unknown>;
  }) => {
    const params: {
      markdown: string;
      title?: string;
      properties?: Record<string, unknown>;
    } = {
      markdown: input.markdown,
    };
    if (input.title !== undefined) params.title = input.title;
    if (input.properties !== undefined) params.properties = input.properties;

    const page = await updatePageWithMarkdown({ id: input.id, params });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(page, null, 2),
        },
      ],
    };
  },
);

// Chat tools
const UploadChatInputSchema = {
  filePath: z
    .string()
    .min(1)
    .describe(
      'Path to JSON file containing the full chat export (source, sessionId, projectPath, gitBranch, rawPayload)',
    ),
  title: z
    .string()
    .optional()
    .describe('Optional title override. Auto-generated from first message if not provided.'),
  organizationId: z
    .string()
    .optional()
    .describe('Organization ID. Optional when using API key authentication.'),
};

mcpServer.registerTool(
  'upload_chat',
  {
    title: 'Upload Chat',
    description:
      'Upload a chat session to Magnet for tracking and analysis. Returns the created chat with a viewUrl to see it in the web UI.',
    inputSchema: UploadChatInputSchema,
  },
  async (input: { filePath: string; title?: string; organizationId?: string }) => {
    // Read chat export data from file
    const fileContent = await readFile(input.filePath, 'utf-8');
    const exportData = JSON.parse(fileContent) as {
      source: 'CLAUDE_CODE' | 'CURSOR';
      sessionId: string;
      projectPath: string;
      gitBranch: string;
      rawPayload: unknown;
    };

    const chat = await uploadChat({
      title: input.title,
      organizationId: input.organizationId,
      source: exportData.source,
      sessionId: exportData.sessionId,
      projectPath: exportData.projectPath,
      gitBranch: exportData.gitBranch,
      rawPayload: exportData.rawPayload as import('./types.js').RawChatPayload,
    });

    const viewUrl = `${process.env.MAGNET_WEB_API_BASE_URL || 'https://www.magnet.run'}/chats/${chat.id}`;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ ...chat, viewUrl }, null, 2),
        },
      ],
    };
  },
);

// Search tools
const SearchInputSchema = {
  query: z.string().min(1).describe('Search term to match against document properties'),
  types: z
    .array(z.enum(['issue', 'page']))
    .optional()
    .describe("Resource types to search. Defaults to both ['issue', 'page']."),
  organizationId: z
    .string()
    .optional()
    .describe('Organization ID. Optional when using API key authentication.'),
};

mcpServer.registerTool(
  'search',
  {
    title: 'Search',
    description:
      'Search for issues and pages in Magnet. Searches across document properties including title and content. Returns matching results with user information (names only, no emails).',
    inputSchema: SearchInputSchema,
  },
  async (input: { query: string; types?: ('issue' | 'page')[]; organizationId?: string }) => {
    const result = await search({
      query: input.query,
      types: input.types,
      organizationId: input.organizationId,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
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
