import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawTag = components["schemas"]["TagRow"];

export type Tag = {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
};

function normalizeTag(tag: RawTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    teamId: tag.teamId,
    createdAt: tag.createdAt,
  };
}

export async function fetchTags(
  baseUrl: string,
  accessToken: string | null,
): Promise<Tag[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/tags`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawTag[];
  return payload.map(normalizeTag);
}
