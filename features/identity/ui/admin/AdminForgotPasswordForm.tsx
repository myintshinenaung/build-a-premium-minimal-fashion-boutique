"use client";

import Link from "next/link";
import { useState } from "react";

const inputClass =
  "mt-2 h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter the email address for your admin account.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Unable to send reset email.");
        return;
      }

      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch {
      setError("Unable to send reset email. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Admin email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@atelierlune.example"
          autoComplete="email"
          className={inputClass}
        />
      </label>
      {error ? <p className="border border-line bg-mist px-4 py-3 text-sm text-ink">{error}</p> : null}
      {message ? <p className="border border-line bg-mist px-4 py-3 text-sm text-ink">{message}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Reset Email"}
      </button>
    </form>
  );
}
