import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawDocumentsListResponse = components["schemas"]["DocumentsListResponse"];
type RawDocumentListRow = components["schemas"]["DocumentListRow"];
type RawDocumentDetailRow = components["schemas"]["DocumentDetailRow"];
type RawRelatedDocumentItem = components["schemas"]["RelatedDocumentItem"];

export type DocumentsListParams = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  tags?: string[] | null;
  start?: string | null;
  end?: string | null;
};

export type DocumentTag = {
  id: string;
  name: string;
  slug: string | null;
};

export type DocumentTagAssignment = {
  documentTag: DocumentTag;
};

export type DocumentListItem = {
  id: string;
  name: string | null;
  title: string | null;
  summary: string | null;
  date: string | null;
  metadata: unknown;
  pathTokens: string[] | null;
  processingStatus: string | null;
  createdAt: string;
  documentTagAssignments: DocumentTagAssignment[];
};

export type DocumentsList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: DocumentListItem[];
};

export type DocumentDetail = DocumentListItem;

export type RelatedDocument = {
  id: string;
  name?: string | null;
  metadata?: unknown;
  pathTokens?: string[] | null;
  tag?: string | null;
  title?: string | null;
  summary?: string | null;
};

export function buildDocumentsListQuery(params: DocumentsListParams): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  for (const tag of params.tags ?? []) {
    if (tag) search.append("tags", tag);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeDocumentTagAssignments(
  raw: unknown,
): DocumentTagAssignment[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    const row = asRecord(entry);
    const tag = asRecord(row?.document_tag ?? row?.documentTag);
    if (!tag?.id || typeof tag.name !== "string") return [];
    return [
      {
        documentTag: {
          id: String(tag.id),
          name: tag.name,
          slug: (tag.slug as string | null | undefined) ?? null,
        },
      },
    ];
  });
}

export function normalizeDocumentListItem(
  row: RawDocumentListRow | RawDocumentDetailRow,
): DocumentListItem {
  return {
    id: row.id,
    name: row.name ?? null,
    title: row.title ?? null,
    summary: row.summary ?? null,
    date: row.date ?? null,
    metadata: row.metadata ?? null,
    pathTokens: row.path_tokens ?? null,
    processingStatus: row.processing_status ?? null,
    createdAt: row.created_at,
    documentTagAssignments: normalizeDocumentTagAssignments(
      row.document_tag_assignments,
    ),
  };
}

export function normalizeDocumentsList(
  payload: RawDocumentsListResponse,
): DocumentsList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? undefined,
      hasPreviousPage: payload.meta.has_previous_page,
      hasNextPage: payload.meta.has_next_page,
    },
    data: payload.data.map(normalizeDocumentListItem),
  };
}

export function normalizeRelatedDocument(
  row: RawRelatedDocumentItem,
): RelatedDocument {
  return {
    id: row.id,
    name: row.name,
    metadata: row.metadata,
    pathTokens: row.path_tokens ?? undefined,
    tag: row.tag,
    title: row.title,
    summary: row.summary,
  };
}

export async function fetchDocumentsList(
  baseUrl: string,
  accessToken: string | null,
  params: DocumentsListParams = {},
): Promise<DocumentsList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/documents${buildDocumentsListQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeDocumentsList(
    (await response.json()) as RawDocumentsListResponse,
  );
}

export async function fetchDocumentById(
  baseUrl: string,
  accessToken: string | null,
  id: string | null | undefined,
  filePath?: string | null,
): Promise<DocumentDetail | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const pathId = id && id.length > 0 ? id : "-";
  const search = new URLSearchParams();
  if (filePath) search.set("filePath", filePath);
  const qs = search.toString();

  const response = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(pathId)}${qs ? `?${qs}` : ""}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeDocumentListItem(
    (await response.json()) as RawDocumentDetailRow,
  );
}

export async function fetchRelatedDocuments(
  baseUrl: string,
  accessToken: string | null,
  id: string,
  pageSize = 20,
): Promise<RelatedDocument[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const search = new URLSearchParams();
  search.set("pageSize", String(pageSize));

  const response = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(id)}/related?${search}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawRelatedDocumentItem[];
  return payload.map(normalizeRelatedDocument);
}

export type DocumentCheckAttachments = {
  hasAttachments: boolean;
  attachments: Array<{
    id: string;
    transactionId?: string | null;
    name?: string | null;
  }>;
  documentName?: string | null;
};

export function normalizeDocumentCheckAttachments(
  payload: unknown,
): DocumentCheckAttachments {
  const row = deepCamelCaseKeys(payload) as Record<string, unknown>;
  const attachments = Array.isArray(row.attachments)
    ? (row.attachments as Array<Record<string, unknown>>).map((a) => ({
        id: String(a.id),
        transactionId: (a.transactionId as string | null | undefined) ?? null,
        name: (a.name as string | null | undefined) ?? null,
      }))
    : [];

  return {
    hasAttachments: Boolean(row.hasAttachments),
    attachments,
    ...(row.documentName != null
      ? { documentName: row.documentName as string | null }
      : {}),
  };
}

function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelCaseKeys);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        deepCamelCaseKeys(nested),
      ]),
    );
  }
  return value;
}

export async function fetchDocumentCheckAttachments(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<DocumentCheckAttachments> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(id)}/check-attachments`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeDocumentCheckAttachments(await response.json());
}

export type DeletedDocument = {
  id: string;
  pathTokens: string[] | null;
};

export async function deleteDocument(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<DeletedDocument> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = deepCamelCaseKeys(await response.json()) as Record<
    string,
    unknown
  >;
  return {
    id: String(row.id),
    pathTokens: Array.isArray(row.pathTokens)
      ? (row.pathTokens as string[])
      : null,
  };
}

export type ReprocessDocumentResult = {
  success: boolean;
  skipped: boolean;
  enqueue: boolean;
  filePath: string[];
  mimetype: string;
  document: { id: string; processingStatus: string };
};

export async function reprocessDocument(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<ReprocessDocumentResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(id)}/reprocess`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = deepCamelCaseKeys(await response.json()) as Record<
    string,
    unknown
  >;
  const document = (row.document ?? {}) as Record<string, unknown>;
  return {
    success: row.success !== false,
    skipped: Boolean(row.skipped),
    enqueue: Boolean(row.enqueue),
    filePath: Array.isArray(row.filePath) ? (row.filePath as string[]) : [],
    mimetype:
      typeof row.mimetype === "string"
        ? row.mimetype
        : "application/octet-stream",
    document: {
      id: String(document.id ?? id),
      processingStatus: String(document.processingStatus ?? "pending"),
    },
  };
}

export type ProcessDocumentItem = {
  filePath: string[];
  mimetype: string;
  size: number;
};

export type ProcessDocumentsResult = {
  toEnqueue: ProcessDocumentItem[];
  unsupportedCompleted: number;
};

export async function processDocuments(
  baseUrl: string,
  accessToken: string | null,
  items: ProcessDocumentItem[],
): Promise<ProcessDocumentsResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/documents/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(items),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = deepCamelCaseKeys(await response.json()) as Record<
    string,
    unknown
  >;
  const toEnqueue = Array.isArray(row.toEnqueue)
    ? (row.toEnqueue as Array<Record<string, unknown>>).flatMap((item) => {
        if (!Array.isArray(item.filePath) || typeof item.mimetype !== "string") {
          return [];
        }
        return [
          {
            filePath: item.filePath as string[],
            mimetype: item.mimetype,
            size: typeof item.size === "number" ? item.size : 0,
          },
        ];
      })
    : [];

  return {
    toEnqueue,
    unsupportedCompleted:
      typeof row.unsupportedCompleted === "number"
        ? row.unsupportedCompleted
        : 0,
  };
}

export async function createDocumentsSignedUrls(
  baseUrl: string,
  accessToken: string | null,
  paths: string[],
): Promise<string[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/documents/signed-urls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paths),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new RustApiError(500, "signed-urls response was not an array");
  }
  return payload.filter((u): u is string => typeof u === "string");
}
