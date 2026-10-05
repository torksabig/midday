import JSZip from "jszip";
import { useState } from "react";
import { useUserQuery } from "@/hooks/use-user";
import { fetchInvoicePdfBlob } from "@/lib/fetch-invoice-pdf";
import { saveFile } from "@/lib/save-file";

type Invoice = {
  id: string;
  invoiceNumber: string | null;
};

export function useDownloadInvoicesZip() {
  const { data: user } = useUserQuery();
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownloadZip = async (invoices: Invoice[]) => {
    if (invoices.length === 0 || !user?.fileKey) {
      return;
    }

    setIsPending(true);
    setProgress({ current: 0, total: invoices.length });

    try {
      const zip = new JSZip();

      // Track used filenames to avoid duplicates
      const usedFilenames = new Set<string>();

      // Rust stored PDF first; Node React-PDF on no_stored_pdf
      const filePromises = invoices.map(async (invoice, index) => {
        try {
          const blob = await fetchInvoicePdfBlob({
            id: invoice.id,
            fk: user.fileKey!,
          });

          // Generate unique filename
          const baseName = invoice.invoiceNumber ?? `invoice-${invoice.id}`;
          let filename = `${baseName}.pdf`;
          let counter = 1;
          while (usedFilenames.has(filename)) {
            filename = `${baseName}-${counter}.pdf`;
            counter++;
          }
          usedFilenames.add(filename);

          zip.file(filename, blob);

          setProgress({ current: index + 1, total: invoices.length });
        } catch (error) {
          console.error(`Error processing invoice ${invoice.id}:`, error);
          // Continue with other invoices even if one fails
        }
      });

      await Promise.all(filePromises);

      // Check if any files were added to the zip
      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        throw new Error("No invoices could be downloaded. Please try again.");
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });

      const timestamp = new Date().toISOString().split("T")[0];
      await saveFile(zipBlob, `invoices-${timestamp}.zip`);
    } catch (error) {
      console.error("Failed to create invoice ZIP:", error);
      throw error;
    } finally {
      setIsPending(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    handleDownloadZip,
    isPending,
    progress,
  };
}
