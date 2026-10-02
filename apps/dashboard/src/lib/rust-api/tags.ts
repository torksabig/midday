import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawTag = components["schemas"]["TagRow"];
type TagMutationResponse = components["schemas"]["TagMutationResponse"];

export type Tag = {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
};

export type CreateTagInput = {
  name: string;
};

export type UpdateTagInput = {
  id: string;
  name: string;
};

export type DeleteTagInput = {
  id: string;
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

async function sendTagMutation(
  baseUrl: string,
  accessToken: string | null,
  path: string,
  init: RequestInit,
): Promise<TagMutationResponse> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as TagMutationResponse;
}

export function createTag(
  baseUrl: string,
  accessToken: string | null,
  input: CreateTagInput,
) {
  return sendTagMutation(baseUrl, accessToken, "/api/v1/tags", {
    method: "POST",
    body: JSON.stringify({ name: input.name }),
  });
}

export function updateTag(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateTagInput,
) {
  return sendTagMutation(baseUrl, accessToken, `/api/v1/tags/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({ name: input.name }),
  });
}

export function deleteTag(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTagInput,
) {
  return sendTagMutation(baseUrl, accessToken, `/api/v1/tags/${input.id}`, {
    method: "DELETE",
  });
}
