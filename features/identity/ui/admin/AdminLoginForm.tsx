"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const inputClass =
  "mt-2 h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const unauthorizedMessage = searchParams.get("error") === "unauthorized"
    ? "This account is not authorized for admin access."
    : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(unauthorizedMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter your admin email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, remember })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Unable to sign in.");
        return;
      }

      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@atelierlune.example"
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your admin password"
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <div className="flex items-center justify-between gap-4 text-sm text-stone">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-ink" />
          Keep me signed in
        </label>
        <Link href="/admin/forgot-password" className="underline underline-offset-8">
          Forgot password
        </Link>
      </div>
      {error ? <p className="border border-line bg-mist px-4 py-3 text-sm text-ink">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Enter Dashboard"}
        <ArrowRight size={17} strokeWidth={1.7} />
      </button>
      <p className="text-xs leading-5 text-stone">Admin access is protected by Supabase Auth.</p>
    </form>
  );
}
