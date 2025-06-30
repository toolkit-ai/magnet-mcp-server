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

// Issue type (mirrors Prisma Task model)
export interface Issue {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  docContent: any;
  state: string;
  assigneeClerkId?: string | null;
  createdClerkId: string;
  organizationId: string;
} 