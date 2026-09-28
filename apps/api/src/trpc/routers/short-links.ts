import {
  createShortLinkForDocumentSchema,
  createShortLinkSchema,
  getShortLinkSchema,
} from "@api/schemas/short-links";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateShortLinkGet,
  tryDelegateShortLinkCreate,
} from "@api/services/replacement-delegation";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@api/trpc/init";
import {
  createShortLink,
  getDocumentById,
  getShortLinkByShortId,
} from "@midday/db/queries";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { signedUrl } from "@midday/supabase/storage";

export const shortLinksRouter = createTRPCRouter({
  createForUrl: protectedProcedure
    .input(createShortLinkSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateShortLinkCreate(
          { url: input.url, type: "redirect" },
          accessToken,
        );
        if (delegated.delegated) {
          const result = delegated.link as { shortId?: string };
          return {
            ...result,
            shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/s/${result?.shortId}`,
          };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const result = await createShortLink(db, {
        url: input.url,
        teamId: teamId!,
        userId: session.user.id,
        type: "redirect",
      });

      if (!result) {
        throw new Error("Failed to create short link");
      }

      return {
        ...result,
        shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/s/${result.shortId}`,
      };
    }),

  createForDocument: protectedProcedure
    .input(createShortLinkForDocumentSchema)
    .mutation(
      async ({
        ctx: { db, teamId, session, supabase, accessToken },
        input,
      }) => {
        const document = await getDocumentById(db, {
          id: input.documentId,
          filePath: input.filePath,
          teamId: teamId!,
        });

        if (!document) {
          throw new Error("Document not found");
        }

        // First create the signed URL for the file (Supabase stays in Node)
        const response = await signedUrl(supabase, {
          bucket: "vault",
          path: document.pathTokens?.join("/") ?? "",
          expireIn: input.expireIn,
          options: {
            download: true,
          },
        });

        if (!response.data?.signedUrl) {
          throw new Error("Failed to create signed URL for file");
        }

        const expiresAt = input.expireIn
          ? new Date(Date.now() + input.expireIn * 1000).toISOString()
          : undefined;
        // @ts-expect-error metadata shape from storage
        const mimeType = document.metadata?.contentType ?? undefined;
        // @ts-expect-error metadata shape from storage
        const size = document.metadata?.size ?? undefined;

        // Postgres insert can be delegated; signed URL already created above
        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateShortLinkCreate(
            {
              url: response.data.signedUrl,
              type: "download",
              fileName: document.name ?? undefined,
              mimeType,
              size,
              expiresAt,
            },
            accessToken,
          );
          if (delegated.delegated) {
            const result = delegated.link as { shortId?: string };
            return {
              ...result,
              shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/s/${result?.shortId}`,
              originalUrl: response.data.signedUrl,
            };
          }
          assertLegacyIdentityFallbackAllowed();
        }

        const result = await createShortLink(db, {
          url: response.data.signedUrl,
          teamId: teamId!,
          userId: session.user.id,
          type: "download",
          fileName: document.name ?? undefined,
          mimeType,
          size,
          expiresAt,
        });

        if (!result) {
          throw new Error("Failed to create short link");
        }

        return {
          ...result,
          shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/s/${result.shortId}`,
          originalUrl: response.data.signedUrl,
        };
      },
    ),

  get: publicProcedure
    .input(getShortLinkSchema)
    .query(async ({ ctx: { db }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateShortLinkGet(input.shortId);
        if (delegated !== null) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getShortLinkByShortId(db, input.shortId);
    }),
});
