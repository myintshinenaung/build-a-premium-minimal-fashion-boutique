"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_STORAGE_KEY,
  DEFAULT_ADMIN_SESSION_MAX_AGE,
  EXTENDED_ADMIN_SESSION_MAX_AGE,
  MOCK_ADMIN_USER
} from "@/lib/admin-auth";

const inputClass =
  "mt-2 h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState(MOCK_ADMIN_USER.email);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password to create a mock admin session.");
      return;
    }

    const maxAge = remember ? EXTENDED_ADMIN_SESSION_MAX_AGE : DEFAULT_ADMIN_SESSION_MAX_AGE;
    const session = {
      user: { ...MOCK_ADMIN_USER, email },
      issuedAt: new Date().toISOString(),
      expiresIn: maxAge,
      provider: "mock"
    };

    document.cookie = `${ADMIN_SESSION_COOKIE}=mock-session; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
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
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Use any password for mock login"
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
        className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
      >
        Enter Dashboard
        <ArrowRight size={17} strokeWidth={1.7} />
      </button>
      <p className="text-xs leading-5 text-stone">
        Mock authentication only. This session architecture is ready to be swapped for Supabase Auth later.
      </p>
    </form>
  );
}
