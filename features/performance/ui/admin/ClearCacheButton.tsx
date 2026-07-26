"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClearCacheButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function clearCache() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to clear cache.");
      }

      setMessage("Cache cleared.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to clear cache.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message ? <span className="text-sm text-stone">{message}</span> : null}
      <button
        type="button"
        disabled={pending}
        onClick={clearCache}
        className="border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-mist disabled:opacity-50"
      >
        {pending ? "Clearing..." : "Clear Cache"}
      </button>
    </div>
  );
}
