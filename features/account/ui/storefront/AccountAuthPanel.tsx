"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup" | "forgot";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-novora-border bg-white px-4 text-sm text-novora-ink outline-none transition-colors placeholder:text-novora-muted focus:border-novora-ink";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

export function AccountAuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const initialMode = (searchParams.get("mode") as AuthMode | null) ?? "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode === "signup" || initialMode === "forgot" ? initialMode : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => {
    if (mode === "signup") return "Create Account";
    if (mode === "forgot") return "Reset Password";
    return "Sign In";
  }, [mode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (mode === "forgot") {
        const response = await fetch("/api/account/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          setError(payload.message ?? "Unable to send reset email.");
          return;
        }

        setSuccess(payload.message ?? "If an account exists for that email, a reset link has been sent.");
        return;
      }

      const endpoint = mode === "signup" ? "/api/account/auth/signup" : "/api/account/auth/login";
      const body =
        mode === "signup"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as {
        message?: string;
        requiresEmailConfirmation?: boolean;
      };

      if (!response.ok) {
        setError(payload.message ?? "Unable to continue.");
        return;
      }

      if (payload.requiresEmailConfirmation) {
        setSuccess(payload.message ?? "Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Unable to continue. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-novora-border bg-white px-5 py-7 shadow-sm sm:px-7">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-novora-muted">Welcome to NOVORA</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-novora-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-novora-muted">
          Sign in to manage your orders, wishlist and account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Name</span>
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Email</span>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {mode !== "forgot" ? (
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Password</span>
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
              />
            </label>
          ) : null}

          {error ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{error}</p> : null}
          {success ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{success}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-novora-ink text-sm font-medium text-white transition-colors hover:bg-novora-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait…"
              : mode === "signup"
                ? "Create Account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Sign In"}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center text-sm text-novora-muted">
          {mode === "signin" ? (
            <>
              <button type="button" className="font-medium text-novora-ink underline-offset-4 hover:underline" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
              <p>
                New to NOVORA?{" "}
                <button type="button" className="font-medium text-novora-ink underline-offset-4 hover:underline" onClick={() => setMode("signup")}>
                  Create Account
                </button>
              </p>
            </>
          ) : null}

          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button type="button" className="font-medium text-novora-ink underline-offset-4 hover:underline" onClick={() => setMode("signin")}>
                Sign In
              </button>
            </p>
          ) : null}

          {mode === "forgot" ? (
            <button type="button" className="font-medium text-novora-ink underline-offset-4 hover:underline" onClick={() => setMode("signin")}>
              Back to Sign In
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-novora-muted">
        Prefer browsing first?{" "}
        <Link href="/shop" className={cn("font-medium text-novora-ink underline-offset-4 hover:underline")}>
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
