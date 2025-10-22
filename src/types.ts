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