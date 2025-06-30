import fetch from "node-fetch";
import { Issue } from "./types";

const MAGNET_WEB_API_BASE_URL = process.env.MAGNET_WEB_API_BASE_URL || "http://magnet.run";
const MAGNET_API_KEY = process.env.MAGNET_API_KEY as string;
if (!MAGNET_API_KEY) {
  throw new Error("MAGNET_API_KEY is not set");
}

export async function listIssues({ organizationId }: { organizationId: string;  }): Promise<Issue[]> {
  const url = `${MAGNET_WEB_API_BASE_URL}/api/issues?organizationId=${encodeURIComponent(organizationId)}`;
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