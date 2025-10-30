// JSON-RPC 2.0 types
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number | null;
}

// TipTap JSON content type (copied from magnet-electron shared types)
import type { JSONContent } from '@tiptap/react';
import { z } from 'zod';

export type TipTapJSONContent = JSONContent;

const TipTapMarkSchema = z
  .object({
    type: z.string(),
    attrs: z.record(z.string(), z.any()).optional(),
  })
  .catchall(z.any());

export const TipTapJSONContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.string(), z.any()).optional(),
      content: z.array(TipTapJSONContentSchema).optional(),
      marks: z.array(TipTapMarkSchema).optional(),
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
  docContent: TipTapJSONContent;
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
  docContent: TipTapJSONContent;
  status?: string;
  baseBranch: string;
}

// Update issue params
export interface UpdateIssueParams {
  title?: string;
  docContent?: TipTapJSONContent;
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

// Schema for pages with full TipTap document content
export const PageSchemaWithDocContent = PageBaseSchema.extend({
  docContent: TipTapJSONContentSchema,
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
  docContent: TipTapJSONContent;  
  pageType?: string;
  properties?: Record<string, any>;
}

// Update page params
export interface UpdatePageParams {
  title?: string;
  docContent?: TipTapJSONContent;
  properties?: Record<string, any>;
} 