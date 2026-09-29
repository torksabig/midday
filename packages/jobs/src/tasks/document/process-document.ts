import { getDb } from "@jobs/init";
import { processDocumentSchema } from "@jobs/schema";
import {
  postProcessDocumentStatus,
  processDocumentDelegationTarget,
} from "@jobs/utils/process-document-delegate";
import { updateDocumentByPath } from "@midday/db/queries";
import { loadDocument } from "@midday/documents/loader";
import { getContentSample } from "@midday/documents/utils";
import { createClient } from "@midday/supabase/job";
import { schemaTask, tasks } from "@trigger.dev/sdk";
import { classifyDocument } from "./classify-document";
import { classifyImage } from "./classify-image";
import { convertHeic } from "./convert-heic";

async function markProcessDocumentFailed(
  filePath: string[],
  teamId: string,
): Promise<void> {
  const target = processDocumentDelegationTarget();
  if (target) {
    try {
      await postProcessDocumentStatus(
        {
          teamId,
          pathTokens: filePath,
          processingStatus: "failed",
        },
        target,
      );
      return;
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      console.warn(
        "process-document rust failed; falling back to drizzle",
        error instanceof Error ? error.message : error,
      );
    }
  }
  await updateDocumentByPath(getDb(), {
    pathTokens: filePath,
    teamId,
    processingStatus: "failed",
  });
}

// NOTE: Process documents and images for classification
export const processDocument = schemaTask({
  id: "process-document",
  schema: processDocumentSchema,
  maxDuration: 60,
  queue: {
    concurrencyLimit: 50,
  },
  run: async ({ mimetype, filePath, teamId }) => {
    const supabase = createClient();

    // Create activity for document upload
    await tasks.trigger("notification", {
      type: "document_uploaded",
      teamId,
      fileName: filePath.join("/"),
      filePath: filePath,
      mimeType: mimetype,
    });

    try {
      // If the file is a HEIC we need to convert it to a JPG
      if (mimetype === "image/heic") {
        await convertHeic.triggerAndWait({
          filePath,
        });
      }

      // If the file is an image, we have a special classifier for it
      if (mimetype.startsWith("image/")) {
        await classifyImage.trigger({
          fileName: filePath.join("/"),
          teamId,
        });

        return;
      }

      const { data: fileData } = await supabase.storage
        .from("vault")
        .download(filePath.join("/"));

      if (!fileData) {
        throw new Error("File not found");
      }

      const document = await loadDocument({
        content: fileData,
        metadata: { mimetype },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      const sample = getContentSample(document);

      await classifyDocument.trigger({
        content: sample,
        fileName: filePath.join("/"),
        teamId,
      });

      // Create activity for successful document processing
      await tasks.trigger("notification", {
        type: "document_processed",
        teamId,
        fileName: filePath.join("/"),
        filePath: filePath,
        mimeType: mimetype,
        contentLength: document.length,
        sampleLength: sample.length,
      });
    } catch (error) {
      console.error(error);

      await markProcessDocumentFailed(filePath, teamId);
    }
  },
});
