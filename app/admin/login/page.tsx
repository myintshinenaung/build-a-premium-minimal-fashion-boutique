import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Login"
};

export default function AdminLoginPage() {
  return (
    <section className="grid min-h-screen bg-white lg:grid-cols-[0.92fr_1.08fr]">
      <div className="flex items-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.34em] text-ink">
            Atelier Lune
          </Link>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.24em] text-stone">Secure admin area</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight text-ink md:text-5xl">Admin login</h1>
          <p className="mt-5 text-sm leading-6 text-stone">
            Sign in with your authorized staff account. Access is validated through Supabase Auth and restricted to
            allowlisted emails or admin roles.
          </p>

          <Suspense fallback={<div className="mt-10 h-64 border border-line bg-mist" />}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>

      <div className="hidden bg-mist p-8 lg:flex lg:items-center">
        <div className="w-full border border-line bg-white p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
            <LockKeyhole size={24} strokeWidth={1.6} />
          </div>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-stone">Production admin access</p>
          <h2 className="mt-4 max-w-lg text-4xl font-medium leading-tight text-ink">A private workspace for product, media, banner, and store operations.</h2>
          <div className="mt-10 grid gap-4 text-sm text-stone">
            <p className="border-t border-line pt-4">Supabase Auth sessions protect admin routes and API endpoints.</p>
            <p className="border-t border-line pt-4">Only allowlisted emails or accounts with an admin role can sign in.</p>
            <p className="border-t border-line pt-4">Public boutique pages remain separate from admin operations.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
