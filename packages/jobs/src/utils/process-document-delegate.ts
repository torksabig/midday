import type { DelegationFetch } from "./delegation-fetch";

export type ProcessDocumentStatusPayload = {
  teamId: string;
  pathTokens: string[];
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  title?: string;
  summary?: string;
};

export type ProcessDocumentRustBody = {
  executed: boolean;
  updated: number;
  documents: Array<{
    id: string;
    processingStatus?: string | null;
    title?: string | null;
    summary?: string | null;
  }>;
};

export function processDocumentDelegationTarget(
  env: NodeJS.ProcessEnv = process.env,
): { mode: "dual" | "replacement"; url: string; token: string } | null {
  const mode = env.MIDDAY_BACKEND_MODE?.trim();
  const base = env.REPLACEMENT_API_URL?.trim().replace(/\/$/, "");
  const token = (
    env.MIDDAY_WORKER_TOKEN ||
    env.REPLACEMENT_DELEGATION_TOKEN ||
    ""
  ).trim();
  if ((mode !== "dual" && mode !== "replacement") || !base || !token) {
    return null;
  }
  return {
    mode,
    url: `${base}/api/v1/workers/process-document`,
    token,
  };
}

export async function postProcessDocumentStatus(
  payload: ProcessDocumentStatusPayload,
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<ProcessDocumentRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`process-document rust failed: ${response.status}`);
  }
  return (await response.json()) as ProcessDocumentRustBody;
}
