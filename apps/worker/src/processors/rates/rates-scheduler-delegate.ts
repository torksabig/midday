import type { DelegationFetch } from "../../utils/delegation-fetch";

export type ExchangeRateRow = {
  base: string;
  target: string;
  rate: number;
  updatedAt: string;
};

export type RatesSchedulerRustBody = {
  executed: boolean;
  totalProcessed: number;
  batchesProcessed: number;
};

export function ratesSchedulerDelegationTarget(
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
    url: `${base}/api/v1/workers/rates-scheduler`,
    token,
  };
}

export async function postRatesScheduler(
  rates: ExchangeRateRow[],
  batchSize: number,
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<RatesSchedulerRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rates, batchSize }),
  });
  if (!response.ok) {
    throw new Error(`rates-scheduler rust failed: ${response.status}`);
  }
  return (await response.json()) as RatesSchedulerRustBody;
}
