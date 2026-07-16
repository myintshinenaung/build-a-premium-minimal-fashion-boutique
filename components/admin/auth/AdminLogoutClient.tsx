"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_STORAGE_KEY } from "@/lib/admin-auth";

export function AdminLogoutClient() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = `${ADMIN_SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    const timeout = window.setTimeout(() => router.replace("/admin/login"), 500);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md border border-line bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <LogOut size={24} strokeWidth={1.6} />
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-stone">Signing out</p>
        <h1 className="mt-4 text-3xl font-medium text-ink">Ending mock session</h1>
        <p className="mt-4 text-sm leading-6 text-stone">You will be redirected to the admin login page.</p>
        <Link href="/admin/login" className="mt-8 inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-medium text-white">
          Return to Login
        </Link>
      </div>
    </section>
  );
}
