export type DelegationFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;
