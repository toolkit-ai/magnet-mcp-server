import fetch from "node-fetch";
import { Issue, CreateIssueParams, UpdateIssueParams, Page, CreatePageParams, UpdatePageParams } from "./types";

const MAGNET_WEB_API_BASE_URL = process.env.MAGNET_WEB_API_BASE_URL || "http://magnet.run";
const MAGNET_API_KEY = process.env.MAGNET_API_KEY as string;
if (!MAGNET_API_KEY) {
  throw new Error("MAGNET_API_KEY is not set");
}

export async function listIssues(): Promise<Issue[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues`;
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
  // Magnet API returns { issues, users }, we want just issues
  return data.issues as Issue[];
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
export async function listPages(): Promise<Page[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/pages`;
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
  // Magnet API returns { pages, users }
  return data.pages as Page[];
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
  // Magnet API returns { page, users }
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
  const data: any = await res.json();
  // Magnet API returns the page directly (not wrapped)
  return data as Page;
} 