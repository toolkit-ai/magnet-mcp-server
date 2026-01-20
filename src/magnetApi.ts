import { z } from 'zod';
import {
  Issue,
  CreateIssueParams,
  UpdateIssueParams,
  Page,
  CreatePageParams,
  UpdatePageParams,
  IssueCreateWithMarkdownParams,
  IssueUpdateWithMarkdownParams,
  IssueWithMarkdown,
  IssueMarkdownPreview,
  PageCreateWithMarkdownParams,
  PageUpdateWithMarkdownParams,
  PageWithMarkdown,
  PageMarkdownPreview,
  ChatUploadParams,
  StoredChat,
  SearchParams,
  SearchResponse,
  SearchResponseSchema,
  SearchUserSchema,
  PaginationMeta,
  PaginatedIssuesResponse,
  PaginatedPagesResponse,
} from './types.js';

const MAGNET_WEB_API_BASE_URL = process.env.MAGNET_WEB_API_BASE_URL || 'https://www.magnet.run';
const MAGNET_API_KEY = process.env.MAGNET_API_KEY as string;
if (!MAGNET_API_KEY) {
  throw new Error('MAGNET_API_KEY is not set');
}

export async function listIssues(): Promise<IssueMarkdownPreview[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/markdown?previewOnly=true`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to list issues: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { issues: IssueMarkdownPreview[] };
  // Magnet API markdown endpoint returns { issues, users } - issues have markdownPreview, not docContent
  return data.issues;
}

export async function getIssue({ id }: { id: string }): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to get issue: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { issue: Issue };
  // Magnet API returns { issue }
  return data.issue;
}

export async function createIssue(params: CreateIssueParams): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to create issue: ${res.status} ${await res.text()}`);
  }
  const issue = (await res.json()) as Issue;
  return issue;
}

export async function updateIssue({
  id,
  updates,
}: {
  id: string;
  updates: UpdateIssueParams;
}): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update issue: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { issue: Issue };
  // Magnet API returns { issue }
  return data.issue;
}

// Page API functions
export async function listPages(): Promise<PageMarkdownPreview[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/markdown?previewOnly=true`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to list pages: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { pages: PageMarkdownPreview[] };
  // Magnet API markdown endpoint returns { pages, users } - pages have markdownPreview, not docContent
  return data.pages;
}

export async function getPage({ id }: { id: string }): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to get page: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { page: Page };
  // Magnet API returns { page, users } - extract just page
  return data.page;
}

export async function createPage(params: CreatePageParams): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to create page: ${res.status} ${await res.text()}`);
  }
  const page = (await res.json()) as Page;
  return page;
}

export async function updatePage({
  id,
  updates,
}: {
  id: string;
  updates: UpdatePageParams;
}): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update page: ${res.status} ${await res.text()}`);
  }
  // Magnet API returns the page directly (not wrapped in { page, users })
  const page = (await res.json()) as Page;
  return page;
}

// Markdown-based issue API functions
export async function createIssueWithMarkdown(
  params: IssueCreateWithMarkdownParams,
): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/markdown`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    throw new Error(
      `Failed to create issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const issue = (await res.json()) as Issue;
  return issue;
}

export async function updateIssueWithMarkdown({
  id,
  params,
}: {
  id: string;
  params: IssueUpdateWithMarkdownParams;
}): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}/markdown`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    if (res.status === 404) {
      throw new Error(`Not found: ${errorData.message || errorData.error}`);
    }
    throw new Error(
      `Failed to update issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const data = (await res.json()) as { issue: Issue };
  return data.issue;
}

export async function getIssueMarkdown({
  id,
  previewOnly = false,
}: {
  id: string;
  previewOnly?: boolean;
}): Promise<IssueWithMarkdown | IssueMarkdownPreview> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}/markdown`);
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    if (res.status === 404) {
      throw new Error(`Not found: ${errorData.message || errorData.error}`);
    }
    throw new Error(
      `Failed to get issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const data = (await res.json()) as IssueMarkdownPreview | { issue: IssueWithMarkdown };
  if (previewOnly) {
    return data as IssueMarkdownPreview;
  }
  return (data as { issue: IssueWithMarkdown }).issue;
}

export async function listIssuesMarkdown({
  organizationId,
  previewOnly = false,
  limit,
  cursor,
}: {
  organizationId?: string;
  previewOnly?: boolean;
  limit?: number;
  cursor?: string;
}): Promise<PaginatedIssuesResponse> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/issues/markdown`);
  if (organizationId) {
    url.searchParams.set('organizationId', organizationId);
  }
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit));
  }
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    throw new Error(
      `Failed to list issues: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const data = (await res.json()) as {
    issues: IssueMarkdownPreview[] | IssueWithMarkdown[];
    pagination: PaginationMeta;
  };
  return {
    issues: data.issues,
    pagination: data.pagination,
  };
}

// Markdown-based page API functions
export async function createPageWithMarkdown(params: PageCreateWithMarkdownParams): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/markdown`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    throw new Error(
      `Failed to create page: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const page = (await res.json()) as Page;
  return page;
}

export async function updatePageWithMarkdown({
  id,
  params,
}: {
  id: string;
  params: PageUpdateWithMarkdownParams;
}): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}/markdown`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    if (res.status === 404) {
      throw new Error(`Not found: ${errorData.message || errorData.error}`);
    }
    throw new Error(
      `Failed to update page: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const page = (await res.json()) as Page;
  return page;
}

export async function getPageMarkdown({
  id,
  previewOnly = false,
}: {
  id: string;
  previewOnly?: boolean;
}): Promise<PageWithMarkdown | PageMarkdownPreview> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}/markdown`);
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    if (res.status === 404) {
      throw new Error(`Not found: ${errorData.message || errorData.error}`);
    }
    throw new Error(
      `Failed to get page: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const data = (await res.json()) as PageMarkdownPreview | { page: PageWithMarkdown };
  if (previewOnly) {
    return data as PageMarkdownPreview;
  }
  return (data as { page: PageWithMarkdown }).page;
}

export async function listPagesMarkdown({
  organizationId,
  previewOnly = false,
  limit,
  cursor,
}: {
  organizationId?: string;
  previewOnly?: boolean;
  limit?: number;
  cursor?: string;
}): Promise<PaginatedPagesResponse> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/pages/markdown`);
  if (organizationId) {
    url.searchParams.set('organizationId', organizationId);
  }
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit));
  }
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    throw new Error(
      `Failed to list pages: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }
  const data = (await res.json()) as {
    pages: PageMarkdownPreview[] | PageWithMarkdown[];
    pagination: PaginationMeta;
  };
  return {
    pages: data.pages,
    pagination: data.pagination,
  };
}

// Chat API functions
export async function uploadChat(params: ChatUploadParams): Promise<StoredChat> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/chats`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': MAGNET_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) throw new Error('Unauthorized: Invalid or missing API key');
    if (res.status === 403) throw new Error('Forbidden: API key does not have access');
    if (res.status === 409)
      throw new Error(`Chat already exists: ${errorData.error || 'Duplicate sessionId'}`);
    throw new Error(`Failed to upload chat: ${res.status} ${errorData.error}`);
  }

  return (await res.json()) as StoredChat;
}

// Search API function
export async function search(params: SearchParams): Promise<SearchResponse> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/search`);
  url.searchParams.set('query', params.query);
  if (params.types?.length) {
    url.searchParams.set('types', params.types.join(','));
  }
  if (params.organizationId) {
    url.searchParams.set('organizationId', params.organizationId);
  }

  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': MAGNET_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 400) {
      throw new Error(`Validation error: ${errorData.error || JSON.stringify(errorData.details)}`);
    }
    if (res.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: API key does not have access to this organization');
    }
    throw new Error(
      `Failed to search: ${res.status} ${errorData.error || errorData.details || res.statusText}`,
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Search for "${params.query}" failed: server returned invalid JSON`);
  }

  const responseData = data as Record<string, unknown>;

  try {
    const rawUsers = Array.isArray(responseData.users) ? responseData.users : [];
    const filteredUsers = rawUsers
      .filter(
        (user): user is Record<string, unknown> =>
          user !== null && typeof user === 'object' && !Array.isArray(user),
      )
      .map((user) =>
        SearchUserSchema.parse({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        }),
      );

    return SearchResponseSchema.parse({
      results: responseData.results,
      total: responseData.total,
      query: responseData.query,
      users: filteredUsers,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Search response validation failed for query "${params.query}": ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      );
    }
    throw error;
  }
}
