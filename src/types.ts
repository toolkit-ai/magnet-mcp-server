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

// TipTap JSON content type
export interface TipTapJSONContent {
  type?: string;
  attrs?: Record<string, any>;
  content?: TipTapJSONContent[];
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  text?: string;
}

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

// Page type (mirrors Prisma Page model)
export interface Page {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  docContent: TipTapJSONContent;
  pageType: string;
  properties: Record<string, any>;
  createdClerkId: string;
  organizationId: string;
}

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