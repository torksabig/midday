"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { bankAccountsQueryOptions } from "@/lib/rust-api/bank-accounts-client";
import { useTRPC } from "@/trpc/client";
import { BankAccount } from "./bank-account";

export function ManualAccounts() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    bankAccountsQueryOptions(trpc.bankAccounts.get.queryKey({ manual: true }), {
      manual: true,
    }),
  );

  if (data?.length === 0) {
    return null;
  }

  return (
    <div className="px-6 pb-6 space-y-6 divide-y">
      {data?.map((account) => (
        <BankAccount key={account.id} data={account} />
      ))}
    </div>
  );
}
