"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { viewerQueryOptions } from "@/lib/rust-api/viewer-client";

type Props = {
  value: number;
  currency: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
};

export function AnimatedNumber({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
}: Props) {
  const hasReceivedValue = useRef(false);

  useEffect(() => {
    if (value !== 0) {
      hasReceivedValue.current = true;
    }
  }, [value]);

  const { data: user } = useQuery({
    ...viewerQueryOptions(),
    retry: false,
    throwOnError: false,
  });
  const localeToUse = locale || user?.locale;

  return (
    <NumberFlow
      value={value}
      animated={hasReceivedValue.current}
      format={{
        style: "currency",
        currency: currency ?? "USD",
        minimumFractionDigits,
        maximumFractionDigits,
      }}
      willChange
      locales={localeToUse ?? "en"}
    />
  );
}
