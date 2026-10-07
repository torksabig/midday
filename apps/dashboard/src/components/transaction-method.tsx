"use client";

import type { TransactionListItem } from "@/lib/rust-api/transactions";
import { useI18n } from "@/locales/client";

type Props = {
  method: TransactionListItem["method"];
};

export function TransactionMethod({ method }: Props) {
  const t = useI18n();

  // @ts-expect-error
  return t(`transaction_methods.${method}`);
}
