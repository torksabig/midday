"use client";

import { createClient } from "@midday/supabase/client";
import { cn } from "@midday/ui/cn";
import { Input } from "@midday/ui/input";
import { SubmitButton } from "@midday/ui/submit-button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  className?: string;
};

export function PasswordSignIn({ className }: Props) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = `${window.location.origin}/${searchParams.get("return_to") || ""}`;
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={cn("flex flex-col space-y-4", className)}>
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="false"
          autoCorrect="false"
          spellCheck="false"
          required
        />
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <SubmitButton
          type="submit"
          className="bg-primary px-6 py-4 text-secondary font-medium flex space-x-2 h-[40px] w-full"
          isSubmitting={isLoading}
        >
          Sign in
        </SubmitButton>
      </div>
    </form>
  );
}
