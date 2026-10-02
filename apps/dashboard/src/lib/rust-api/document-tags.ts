import { RustApiError } from "./overview";

export type DocumentTag = {
  id: string;
  name: string;
  slug?: string;
};

export type CreateDocumentTagInput = {
  name: string;
};

export type DeleteDocumentTagInput = {
  id: string;
};

export type DocumentTagAssignmentInput = {
  documentId: string;
  tagId: string;
};

/** Approximate @sindresorhus/slugify for document tag create (Rust requires slug). */
export function slugifyDocumentTagName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function rustFetch(
  url: string,
  accessToken: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(8_000),
  });
}

export async function fetchDocumentTags(
  baseUrl: string,
  accessToken: string | null,
): Promise<DocumentTag[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(`${baseUrl}/api/v1/document-tags`, accessToken);

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as DocumentTag[];
  return payload.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));
}

export async function createDocumentTag(
  baseUrl: string,
  accessToken: string | null,
  input: CreateDocumentTagInput,
): Promise<DocumentTag> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(`${baseUrl}/api/v1/document-tags`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      slug: slugifyDocumentTagName(input.name),
    }),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as DocumentTag;
}

export async function deleteDocumentTag(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteDocumentTagInput,
): Promise<{ id: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/document-tags/${encodeURIComponent(input.id)}`,
    accessToken,
    { method: "DELETE" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as { id: string };
}

export async function createDocumentTagAssignment(
  baseUrl: string,
  accessToken: string | null,
  input: DocumentTagAssignmentInput,
): Promise<{ documentId: string; tagId: string; teamId?: string }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/document-tag-assignments`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        documentId: input.documentId,
        tagId: input.tagId,
      }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as {
    documentId: string;
    tagId: string;
    teamId?: string;
  };
}

export async function deleteDocumentTagAssignment(
  baseUrl: string,
  accessToken: string | null,
  input: DocumentTagAssignmentInput,
): Promise<{ documentId: string; tagId: string; teamId?: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/document-tag-assignments`,
    accessToken,
    {
      method: "DELETE",
      body: JSON.stringify({
        documentId: input.documentId,
        tagId: input.tagId,
      }),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as {
    documentId: string;
    tagId: string;
    teamId?: string;
  };
}
