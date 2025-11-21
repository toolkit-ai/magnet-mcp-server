
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
  PageMarkdownPreview
} from "./types";

const MAGNET_WEB_API_BASE_URL = process.env.MAGNET_WEB_API_BASE_URL || "https://www.magnet.run";
const MAGNET_API_KEY = process.env.MAGNET_API_KEY as string;
if (!MAGNET_API_KEY) {
  throw new Error("MAGNET_API_KEY is not set");
}

export async function listIssues(): Promise<IssueMarkdownPreview[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/markdown?previewOnly=true`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to list issues: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  // Magnet API markdown endpoint returns { issues, users } - issues have markdownPreview, not docContent
  return data.issues as IssueMarkdownPreview[];
}

export async function getIssue({ id,  }: { id: string;}): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to get issue: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  // Magnet API returns { issue }
  return data.issue as Issue;
}

export async function createIssue(params: CreateIssueParams): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to create issue: ${res.status} ${await res.text()}`);
  }
  const issue: any = await res.json();
  return issue as Issue;
}

export async function updateIssue({ id, updates }: { id: string; updates: UpdateIssueParams }): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update issue: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  // Magnet API returns { issue }
  return data.issue as Issue;
}

// Page API functions
export async function listPages(): Promise<PageMarkdownPreview[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/markdown?previewOnly=true`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to list pages: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  // Magnet API markdown endpoint returns { pages, users } - pages have markdownPreview, not docContent
  return data.pages as PageMarkdownPreview[];
}

export async function getPage({ id }: { id: string; }): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to get page: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  // Magnet API returns { page, users } - extract just page
  return data.page as Page;
}

export async function createPage(params: CreatePageParams): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to create page: ${res.status} ${await res.text()}`);
  }
  const page: any = await res.json();
  return page as Page;
}

export async function updatePage({ id, updates }: { id: string; updates: UpdatePageParams }): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update page: ${res.status} ${await res.text()}`);
  }
  // Magnet API returns the page directly (not wrapped in { page, users })
  const page: any = await res.json();
  return page as Page;
}

// Markdown-based issue API functions
export async function createIssueWithMarkdown(params: IssueCreateWithMarkdownParams): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/markdown`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to create issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const issue: any = await res.json();
  return issue as Issue;
}

export async function updateIssueWithMarkdown({ id, params }: { id: string; params: IssueUpdateWithMarkdownParams }): Promise<Issue> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}/markdown`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to update issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const data: any = await res.json();
  return data.issue as Issue;
}

export async function getIssueMarkdown({ id, previewOnly = false }: { id: string; previewOnly?: boolean }): Promise<IssueWithMarkdown | IssueMarkdownPreview> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/issues/${encodeURIComponent(id)}/markdown`);
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to get issue: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const data: any = await res.json();
  if (previewOnly) {
    return data as IssueMarkdownPreview;
  }
  return data.issue as IssueWithMarkdown;
}

export async function listIssuesMarkdown({ organizationId, previewOnly = false }: { organizationId?: string; previewOnly?: boolean }): Promise<IssueWithMarkdown[] | IssueMarkdownPreview[]> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/issues/markdown`);
  if (organizationId) {
    url.searchParams.set('organizationId', organizationId);
  }
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to list issues: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const data: any = await res.json();
  if (previewOnly) {
    return data.issues as IssueMarkdownPreview[];
  }
  return data.issues as IssueWithMarkdown[];
}

// Markdown-based page API functions
export async function createPageWithMarkdown(params: PageCreateWithMarkdownParams): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/markdown`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to create page: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const page: any = await res.json();
  return page as Page;
}

export async function updatePageWithMarkdown({ id, params }: { id: string; params: PageUpdateWithMarkdownParams }): Promise<Page> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}/markdown`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to update page: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const page: any = await res.json();
  return page as Page;
}

export async function getPageMarkdown({ id, previewOnly = false }: { id: string; previewOnly?: boolean }): Promise<PageWithMarkdown | PageMarkdownPreview> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/pages/${encodeURIComponent(id)}/markdown`);
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to get page: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const data: any = await res.json();
  if (previewOnly) {
    return data as PageMarkdownPreview;
  }
  return data.page as PageWithMarkdown;
}

export async function listPagesMarkdown({ organizationId, previewOnly = false }: { organizationId?: string; previewOnly?: boolean }): Promise<PageWithMarkdown[] | PageMarkdownPreview[]> {
  const url = new URL(`${MAGNET_WEB_API_BASE_URL}/api/pages/markdown`);
  if (organizationId) {
    url.searchParams.set('organizationId', organizationId);
  }
  if (previewOnly) {
    url.searchParams.set('previewOnly', 'true');
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": MAGNET_API_KEY as string,
      "Content-Type": "application/json",
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
    throw new Error(`Failed to list pages: ${res.status} ${errorData.error || errorData.details || res.statusText}`);
  }
  const data: any = await res.json();
  if (previewOnly) {
    return data.pages as PageMarkdownPreview[];
  }
  return data.pages as PageWithMarkdown[];
} 