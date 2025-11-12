"use client";

import { useState, useTransition } from "react";

export function useServerAction<TPayload, TResult extends { ok: boolean; error?: string }>(
  action: (payload: TPayload) => Promise<TResult>
) {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const execute = (payload: TPayload, onSuccess?: () => void) => {
    setError("");
    startTransition(async () => {
      const result = await action(payload);
      if (!result.ok) {
        setError(result.error ?? "Error inesperado");
        return;
      }
      onSuccess?.();
    });
  };

  return { execute, isPending, error, setError };
}
