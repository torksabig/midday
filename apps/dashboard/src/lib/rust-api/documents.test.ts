import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildDocumentsListQuery,
  normalizeDocumentCheckAttachments,
  normalizeDocumentListItem,
  normalizeDocumentsList,
  normalizeRelatedDocument,
} from "./documents";

type RawDocumentsListResponse = components["schemas"]["DocumentsListResponse"];
type RawDocumentDetailRow = components["schemas"]["DocumentDetailRow"];
type RawRelatedDocumentItem = components["schemas"]["RelatedDocumentItem"];

test("buildDocumentsListQuery encodes filters like the façade", () => {
  expect(
    buildDocumentsListQuery({
      cursor: "24",
      pageSize: 24,
      q: "invoice",
      tags: ["tag-1", "tag-2"],
      start: "2026-01-01",
      end: "2026-01-31",
    }),
  ).toBe(
    "?cursor=24&pageSize=24&q=invoice&start=2026-01-01&end=2026-01-31&tags=tag-1&tags=tag-2",
  );
});

test("normalizes snake_case documents list payloads", () => {
  const payload = {
    meta: {
      cursor: "24",
      has_previous_page: false,
      has_next_page: true,
    },
    data: [
      {
        id: "doc-1",
        name: "team/receipt.pdf",
        title: "Receipt",
        summary: "Office supplies",
        date: "2026-01-02",
        metadata: { size: 12, mimetype: "application/pdf" },
        path_tokens: ["team", "receipt.pdf"],
        processing_status: "completed",
        created_at: "2026-01-02T10:00:00Z",
        document_tag_assignments: [
          {
            document_tag: {
              id: "tag-1",
              name: "Ops",
              slug: "ops",
            },
          },
        ],
      },
    ],
  } as unknown as RawDocumentsListResponse;

  const list = normalizeDocumentsList(payload);

  expect(list.meta).toEqual({
    cursor: "24",
    hasPreviousPage: false,
    hasNextPage: true,
  });
  expect(list.data[0]).toMatchObject({
    id: "doc-1",
    name: "team/receipt.pdf",
    title: "Receipt",
    pathTokens: ["team", "receipt.pdf"],
    processingStatus: "completed",
    createdAt: "2026-01-02T10:00:00Z",
    documentTagAssignments: [
      {
        documentTag: {
          id: "tag-1",
          name: "Ops",
          slug: "ops",
        },
      },
    ],
  });
});

test("normalizes document detail and related items", () => {
  const detail = normalizeDocumentListItem({
    id: "doc-1",
    name: "team/receipt.pdf",
    title: "Receipt",
    summary: null,
    date: null,
    metadata: null,
    path_tokens: ["team", "receipt.pdf"],
    processing_status: "pending",
    created_at: "2026-01-02T10:00:00Z",
    document_tag_assignments: [],
  } as RawDocumentDetailRow);

  expect(detail.pathTokens).toEqual(["team", "receipt.pdf"]);
  expect(detail.processingStatus).toBe("pending");

  const related = normalizeRelatedDocument({
    id: "doc-2",
    name: "related.pdf",
    metadata: { size: 1 },
    path_tokens: ["a", "related.pdf"],
    tag: "ops",
    title: "Related",
    summary: "Similar",
  } as RawRelatedDocumentItem);

  expect(related).toEqual({
    id: "doc-2",
    name: "related.pdf",
    metadata: { size: 1 },
    pathTokens: ["a", "related.pdf"],
    tag: "ops",
    title: "Related",
    summary: "Similar",
  });
});

test("normalizes document check-attachments payload", () => {
  expect(
    normalizeDocumentCheckAttachments({
      hasAttachments: true,
      attachments: [
        { id: "att-1", transactionId: "tx-1", name: "receipt.pdf" },
      ],
      documentName: "vault/doc.pdf",
    }),
  ).toEqual({
    hasAttachments: true,
    attachments: [
      { id: "att-1", transactionId: "tx-1", name: "receipt.pdf" },
    ],
    documentName: "vault/doc.pdf",
  });
});
