import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password"
};

export default function AdminForgotPasswordPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md border border-line bg-white p-8">
        <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm text-stone underline underline-offset-8">
          <ArrowLeft size={16} strokeWidth={1.7} />
          Back to login
        </Link>
        <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <Mail size={24} strokeWidth={1.6} />
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-stone">Password recovery</p>
        <h1 className="mt-4 text-4xl font-medium leading-tight text-ink">Forgot password</h1>
        <p className="mt-5 text-sm leading-6 text-stone">
          Placeholder screen for future Supabase password reset emails. No email is sent in the mock version.
        </p>
        <form className="mt-10 space-y-5">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Admin email</span>
            <input
              type="email"
              placeholder="admin@atelierlune.example"
              className="mt-2 h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            Send Reset Placeholder
          </button>
        </form>
      </div>
    </section>
  );
}
