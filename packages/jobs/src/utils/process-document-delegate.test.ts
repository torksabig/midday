import { describe, expect, test } from "bun:test";
import {
  postProcessDocumentStatus,
  processDocumentDelegationTarget,
} from "./process-document-delegate";

describe("processDocumentDelegationTarget", () => {
  test("stays off unless mode, url, and token are set", () => {
    expect(processDocumentDelegationTarget({})).toBeNull();
    expect(
      processDocumentDelegationTarget({
        MIDDAY_BACKEND_MODE: "legacy",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toBeNull();
    expect(
      processDocumentDelegationTarget({
        MIDDAY_BACKEND_MODE: "dual",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toEqual({
      mode: "dual",
      url: "http://127.0.0.1:8787/api/v1/workers/process-document",
      token: "secret",
    });
    expect(
      processDocumentDelegationTarget({
        MIDDAY_BACKEND_MODE: "replacement",
        REPLACEMENT_API_URL: "http://rust",
        REPLACEMENT_DELEGATION_TOKEN: "tok",
      }),
    ).toEqual({
      mode: "replacement",
      url: "http://rust/api/v1/workers/process-document",
      token: "tok",
    });
  });
});

test("postProcessDocumentStatus throws when rust is not ok", async () => {
  await expect(
    postProcessDocumentStatus(
      {
        teamId: "t",
        pathTokens: ["a", "b.pdf"],
        processingStatus: "failed",
      },
      { url: "http://x", token: "t" },
      async () => new Response("nope", { status: 500 }),
    ),
  ).rejects.toThrow("process-document rust failed: 500");
});

test("postProcessDocumentStatus returns body on success", async () => {
  const body = await postProcessDocumentStatus(
    {
      teamId: "t",
      pathTokens: ["a", "b.pdf"],
      processingStatus: "completed",
      title: "Doc",
    },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          updated: 1,
          documents: [
            { id: "d1", processingStatus: "completed", title: "Doc" },
          ],
        }),
        { status: 200 },
      ),
  );
  expect(body.executed).toBe(true);
  expect(body.updated).toBe(1);
  expect(body.documents[0]?.id).toBe("d1");
});
