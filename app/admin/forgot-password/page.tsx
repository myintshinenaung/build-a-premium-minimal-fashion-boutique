import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AdminForgotPasswordForm } from "@/components/admin/auth/AdminForgotPasswordForm";

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
          Enter your admin email and Supabase will send a password reset link.
        </p>
        <AdminForgotPasswordForm />
      </div>
    </section>
  );
}
