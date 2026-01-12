// JSON-RPC 2.0 types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id?: string | number | null;
}

// Document content type (JSON format used by Magnet API)
import type { JSONContent } from '@tiptap/react'; // Internal type, not exposed to users
import { z } from 'zod';

export type DocumentContent = JSONContent;

const DocumentMarkSchema = z
  .object({
    type: z.string(),
    attrs: z.record(z.string(), z.any()).optional(),
  })
  .catchall(z.any());

export const DocumentContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.string(), z.any()).optional(),
      content: z.array(DocumentContentSchema).optional(),
      marks: z.array(DocumentMarkSchema).optional(),
      text: z.string().optional(),
    })
    .catchall(z.any()),
);

// Issue type (mirrors Prisma Task model)
export interface Issue {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  docContent: DocumentContent;
  status: string;
  assigneeClerkId?: string | null;
  createdClerkId: string;
  branchName: string | null;
  baseBranch: string;
  linearIssueId?: string | null;
  organizationId: string;
}

// Issue with markdown preview (used in list responses)
export interface IssueWithMarkdownPreview {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  markdownPreview: string;
  status: string;
  assigneeClerkId?: string | null;
  createdClerkId: string;
  branchName: string | null;
  baseBranch: string;
  linearIssueId?: string | null;
  organizationId: string;
}

// Create issue params
export interface CreateIssueParams {
  title?: string;
  description: string;
  docContent: DocumentContent;
  status?: string;
  baseBranch: string;
}

// Update issue params
export interface UpdateIssueParams {
  title?: string;
  docContent?: DocumentContent;
  status?: string;
  assigneeClerkId?: string;
  baseBranch?: string;
}

// Page types (copied from magnet-electron shared types)
// Page type enum matching Prisma schema
export const PageTypeSchema = z.enum(['note', 'context_doc_label', 'sprint_planning']);
export type PageType = z.infer<typeof PageTypeSchema>;

// Base properties schema - can be extended for specific page types
export const BasePagePropertiesSchema = z.object({}).passthrough();

// Context documentation properties
export const ContextDocPropertiesSchema = BasePagePropertiesSchema.extend({});

// Sprint planning properties
export const SprintPlanningPropertiesSchema = BasePagePropertiesSchema.extend({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

// Union of all page properties
export const PagePropertiesSchema = z.union([
  SprintPlanningPropertiesSchema,
  ContextDocPropertiesSchema,
  BasePagePropertiesSchema,
]);

export type PageProperties = z.infer<typeof PagePropertiesSchema>;
export type ContextDocProperties = z.infer<typeof ContextDocPropertiesSchema>;
export type SprintPlanningProperties = z.infer<typeof SprintPlanningPropertiesSchema>;

// Default properties for each page type
export const DEFAULT_PAGE_PROPERTIES: Record<PageType, PageProperties> = {
  note: {},
  context_doc_label: {},
  sprint_planning: {},
};

// Helper to get display name for page type
export function getPageTypeDisplayName(pageType: PageType): string {
  switch (pageType) {
    case 'note':
      return 'Note';
    case 'context_doc_label':
      return 'Context Doc';
    case 'sprint_planning':
      return 'Sprint Planning';
  }
}

// Base schema with common fields shared across all page types (excludes docContent)
export const PageBaseSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string().min(1),
  createdClerkId: z.string(),
  organizationId: z.string(),
  pageType: PageTypeSchema,
  properties: PagePropertiesSchema,
});

// Schema for pages with full document content
export const PageSchemaWithDocContent = PageBaseSchema.extend({
  docContent: DocumentContentSchema,
});

// Schema for pages with markdown preview (used in list responses)
export const PageSchemaWithMarkdownPreview = PageBaseSchema.extend({
  markdownPreview: z.string(),
});

// PageSchema represents a page that can be either with docContent or with markdownPreview
export const PageSchema = z.union([PageSchemaWithDocContent, PageSchemaWithMarkdownPreview]);

export type PageBase = z.infer<typeof PageBaseSchema>;
export type PageWithDocContent = z.infer<typeof PageSchemaWithDocContent>;
export type PageWithMarkdownPreview = z.infer<typeof PageSchemaWithMarkdownPreview>;
export type MagnetPage = z.infer<typeof PageSchema>;

// Schema for GET /api/pages endpoint response
export const GetPagesWithMarkdownPreviewSchema = z.object({
  pages: PageSchemaWithMarkdownPreview.array(),
  users: z.array(z.any()),
});

export const GetPagesWithDocContentSchema = z.object({
  pages: PageSchemaWithDocContent.array(),
  users: z.array(z.any()),
});

export type GetPagesWithMarkdownPreviewResponse = z.infer<typeof GetPagesWithMarkdownPreviewSchema>;
export type GetPagesWithDocContentResponse = z.infer<typeof GetPagesWithDocContentSchema>;

// Page type alias for backwards compatibility
// Use PageWithDocContent or PageWithMarkdownPreview based on context
export type Page = MagnetPage;

// Create page params
export interface CreatePageParams {
  title: string;
  docContent: DocumentContent;
  pageType?: string;
  properties?: Record<string, unknown>;
}

// Update page params
export interface UpdatePageParams {
  title?: string;
  docContent?: DocumentContent;
  properties?: Record<string, unknown>;
}

// Markdown-based issue params
export interface IssueCreateWithMarkdownParams {
  title?: string;
  description: string;
  markdown: string;
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  organizationId?: string;
  baseBranch: string;
  properties?: Record<string, unknown>;
}

export interface IssueUpdateWithMarkdownParams {
  title?: string;
  markdown: string;
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  assigneeClerkId?: string;
}

// Issue with markdown response types
export interface IssueWithMarkdown extends Omit<Issue, 'docContent'> {
  docContent: string; // Markdown string
}

export interface IssueMarkdownPreview {
  id: string;
  title: string;
  markdownPreview: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Markdown-based page params
export interface PageCreateWithMarkdownParams {
  title: string;
  markdown: string;
  organizationId?: string;
  pageType?: 'note' | 'context_doc_label' | 'sprint_planning';
  properties?: Record<string, unknown>;
}

export interface PageUpdateWithMarkdownParams {
  title?: string;
  markdown: string;
  properties?: Record<string, unknown>;
}

// Page with markdown response types
export interface PageWithMarkdown extends Omit<PageWithDocContent, 'docContent'> {
  docContent: string; // Markdown string
}

export interface PageMarkdownPreview {
  id: string;
  title: string;
  markdownPreview: string;
  pageType: PageType;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Chat types
export type ChatSource = 'CLAUDE_CODE' | 'CURSOR';

// Raw payload for Claude Code - array of JSONL lines as strings
export interface RawClaudeCodePayload {
  jsonlLines: string[];
}

// Raw payload for Cursor - composer data and bubbles from SQLite
export interface RawCursorPayload {
  composer: Record<string, unknown>;
  bubbles: Array<Record<string, unknown>>;
}

export type RawChatPayload = RawClaudeCodePayload | RawCursorPayload;

export interface ChatUploadParams {
  title?: string;
  source: ChatSource;
  sessionId: string;
  projectPath: string;
  gitBranch: string;
  rawPayload: RawChatPayload; // Server handles parsing and model extraction
  organizationId?: string;
}

export interface StoredChat {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  source: ChatSource;
  sessionId: string;
  projectPath: string;
  gitBranch: string;
  modelName: string;
  organizationId: string;
  uploadedByClerkId: string;
}

// Search types with Zod schemas for validation
export const SearchTypeSchema = z.enum(['issue', 'page']);
export type SearchType = z.infer<typeof SearchTypeSchema>;

export const SearchParamsSchema = z.object({
  query: z.string().min(1),
  types: z.array(SearchTypeSchema).optional(),
  organizationId: z.string().optional(),
});
export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const SearchResultSchema = z.object({
  id: z.string(),
  type: SearchTypeSchema,
  title: z.string(),
  status: z.string().optional(),
  pageType: PageTypeSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  organizationId: z.string(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchUserSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
});
export type SearchUser = z.infer<typeof SearchUserSchema>;

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number(),
  query: z.string(),
  users: z.array(SearchUserSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
