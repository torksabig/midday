import { useMemo } from "react";
import { useUserQuery } from "@/hooks/use-user";
import {
  getInvoiceDownloadApiUrl,
  getVaultFilesApiUrl,
} from "@/lib/files-api-url";

type FileUrlOptions =
  | {
      type: "proxy" | "download";
      filePath: string;
      filename?: string;
    }
  | {
      type: "invoice";
      invoiceId: string;
      isReceipt?: boolean;
      /** When set, download hits Rust directly (stored PDF); skips residual Node. */
      filePath?: string[] | string | null;
    }
  | {
      type: "url";
      url: string;
    };

/**
 * Hook to get an authenticated file URL with fileKey.
 * Handles both constructing URLs from file paths and adding fileKey to existing URLs.
 *
 * @param options - Either file path options or an existing URL
 * @returns Object with `url` (authenticated URL), `isLoading`, and `hasFileKey` state
 */
export function useFileUrl(options: FileUrlOptions | null) {
  const { data: user, isLoading } = useUserQuery();

  const result = useMemo(() => {
    if (!options) {
      return {
        url: null as string | null,
        isLoading,
        hasFileKey: !!user?.fileKey,
      };
    }

    if (options.type === "url") {
      // Handle relative URLs (starting with /) differently from absolute URLs
      if (options.url.startsWith("/")) {
        const [pathname, search] = options.url.split("?");
        const params = new URLSearchParams(search);
        if (user?.fileKey) {
          params.set("fk", user.fileKey);
        }
        const queryString = params.toString();
        return {
          url: queryString ? `${pathname}?${queryString}` : pathname,
          isLoading: false,
          hasFileKey: !!user?.fileKey,
        };
      }

      // Absolute URL - use full URL construction
      const url = new URL(options.url);
      // Add fileKey to all URLs that need authentication
      if (user?.fileKey) {
        url.searchParams.set("fk", user.fileKey);
      }
      return {
        url: url.toString(),
        isLoading: false,
        hasFileKey: !!user?.fileKey,
      };
    }

    // For other types, we need fileKey
    if (!user?.fileKey) {
      return {
        url: null as string | null,
        isLoading,
        hasFileKey: false,
      };
    }

    if (options.type === "invoice") {
      // Stored PDF → Rust; drafts/receipts → residual Node React-PDF
      const baseUrl = `${getInvoiceDownloadApiUrl({
        filePath: options.filePath,
        isReceipt: options.isReceipt,
      })}/files/download/invoice`;
      const url = new URL(baseUrl);
      url.searchParams.set("id", options.invoiceId);
      url.searchParams.set("fk", user.fileKey);
      if (options.isReceipt) {
        url.searchParams.set("type", "receipt");
      }
      return {
        url: url.toString(),
        isLoading: false,
        hasFileKey: true,
      };
    }

    // Build URL from file path (Rust vault proxy/download)
    const { type, filePath, filename } = options;
    const endpointPath = type === "download" ? `${type}/file` : type;
    const baseUrl = `${getVaultFilesApiUrl()}/files/${endpointPath}`;
    const url = new URL(baseUrl);

    if (type === "download") {
      url.searchParams.set("path", filePath);
      if (filename) {
        url.searchParams.set("filename", filename);
      }
    } else {
      url.searchParams.set("filePath", filePath);
    }

    url.searchParams.set("fk", user.fileKey);

    return {
      url: url.toString(),
      isLoading: false,
      hasFileKey: true,
    };
  }, [options, user?.fileKey, isLoading]);

  return result;
}
