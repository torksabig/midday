export type MatchSuggestionPayload = {
  transactionId: string;
  name: string;
  amount: number;
  currency: string;
  date: string;
  nameScore?: number;
  amountScore: number;
  currencyScore: number;
  dateScore: number;
  confidenceScore: number;
  matchType: string;
  isAlreadyMatched: boolean;
};

export type MatchNotification = {
  inboxId: string;
  action: "auto_matched" | "suggestion_created" | string;
  suggestion: MatchSuggestionPayload;
};

export type BatchProcessMatchingRustBody = {
  executed: boolean;
  processed: number;
  autoMatched: number;
  suggestions: number;
  noMatches: number;
  errors: number;
  notifications: MatchNotification[];
};

export type MatchTransactionsBidirectionalRustBody = {
  executed: boolean;
  processed: number;
  autoMatched: number;
  suggestions: number;
  noMatches: number;
  forwardMatches: number;
  reverseMatches: number;
  notifications: MatchNotification[];
};

export function inboxMatchingDelegationTarget(
  job:
    | "batch-process-matching"
    | "match-transactions-bidirectional",
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
    url: `${base}/api/v1/workers/${job}`,
    token,
  };
}

export async function postBatchProcessMatching(
  payload: { teamId: string; inboxIds: string[] },
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<BatchProcessMatchingRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`batch-process-matching rust failed: ${response.status}`);
  }
  return (await response.json()) as BatchProcessMatchingRustBody;
}

export async function postMatchTransactionsBidirectional(
  payload: { teamId: string; newTransactionIds: string[] },
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<MatchTransactionsBidirectionalRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `match-transactions-bidirectional rust failed: ${response.status}`,
    );
  }
  return (await response.json()) as MatchTransactionsBidirectionalRustBody;
}
