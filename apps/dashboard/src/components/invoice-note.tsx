"use client";

import { Textarea } from "@midday/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { updateInvoiceFromRust } from "@/lib/rust-api/invoices-client";
import { useTRPC } from "@/trpc/client";

type Props = {
  id: string;
  defaultValue?: string | null;
};

export function InvoiceNote({ id, defaultValue }: Props) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue] = useDebounceValue(value, 500);

  const updateInvoiceMutation = useMutation({
    mutationFn: updateInvoiceFromRust,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.invoice.getById.queryKey({ id }),
      });
    },
  });

  const handleUpdate = useCallback(() => {
    if (debouncedValue !== defaultValue) {
      updateInvoiceMutation.mutate({
        id,
        internalNote:
          debouncedValue && debouncedValue.length > 0 ? debouncedValue : null,
      });
    }
  }, [debouncedValue, defaultValue, id, updateInvoiceMutation.mutate]);

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <Textarea
      defaultValue={defaultValue ?? ""}
      id="note"
      placeholder="Note"
      className="min-h-[100px] resize-none"
      onChange={(evt) => setValue(evt.target.value)}
    />
  );
}
