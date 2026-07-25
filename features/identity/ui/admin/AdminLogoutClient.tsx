"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

export function AdminLogoutClient() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    async function signOut() {
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" });
      } finally {
        if (isActive) {
          router.replace("/admin/login");
          router.refresh();
        }
      }
    }

    void signOut();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md border border-line bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <LogOut size={24} strokeWidth={1.6} />
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-stone">Signing out</p>
        <h1 className="mt-4 text-3xl font-medium text-ink">Ending admin session</h1>
        <p className="mt-4 text-sm leading-6 text-stone">You will be redirected to the admin login page.</p>
        <Link href="/admin/login" className="mt-8 inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-medium text-white">
          Return to Login
        </Link>
      </div>
    </section>
  );
}
