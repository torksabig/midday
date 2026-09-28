import {
  createDocumentTagSchema,
  deleteDocumentTagSchema,
} from "@api/schemas/document-tags";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateDocumentTagCreate,
  tryDelegateDocumentTagDelete,
  tryDelegateDocumentTagsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  createDocumentTag,
  createDocumentTagEmbedding,
  deleteDocumentTag,
  getDocumentTags,
} from "@midday/db/queries";
import { Embed } from "@midday/documents/embed";
import slugify from "@sindresorhus/slugify";

export const documentTagsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateDocumentTagsGet(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getDocumentTags(db, teamId!);
  }),

  create: protectedProcedure
    .input(createDocumentTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const slug = slugify(input.name);
      let data: { id: string; name: string; slug: string } | null | undefined;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentTagCreate(
          input.name,
          slug,
          accessToken,
        );
        if (delegated.delegated) {
          data = delegated.tag;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (data === undefined) {
        data = await createDocumentTag(db, {
          teamId: teamId!,
          name: input.name,
          slug,
        });
      }

      // Embedding stays in the Node façade (parity with legacy create path).
      if (data) {
        const embedService = new Embed();
        const { embedding, model } = await embedService.embed(input.name);

        await createDocumentTagEmbedding(db, {
          slug: data.slug,
          name: input.name,
          embedding: JSON.stringify(embedding),
          model,
        });
      }

      return data;
    }),

  delete: protectedProcedure
    .input(deleteDocumentTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentTagDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.tag ?? undefined;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteDocumentTag(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),
});
