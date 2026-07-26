"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSessionRecord } from "@/types/security";

type ActiveSessionsTableProps = {
  items: AdminSessionRecord[];
};

export function ActiveSessionsTable({ items }: ActiveSessionsTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function revokeSession(sessionId: string) {
    setPendingId(sessionId);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/security/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to revoke session.");
      }

      setMessage("Session revoked.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to revoke session.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-stone">{message}</p> : null}
      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-5 py-4 font-medium">User</th>
              <th className="px-5 py-4 font-medium">Device</th>
              <th className="px-5 py-4 font-medium">Last Seen</th>
              <th className="px-5 py-4 font-medium">Expires</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-stone">
                  No active sessions.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink">{item.userEmail}</div>
                    {item.isCurrent ? <div className="text-xs text-emerald-700">Current session</div> : null}
                  </td>
                  <td className="px-5 py-4 text-stone">{item.deviceLabel}</td>
                  <td className="px-5 py-4 text-stone">{new Date(item.lastSeenAt).toLocaleString()}</td>
                  <td className="px-5 py-4 text-stone">{new Date(item.expiresAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={pendingId === item.id || item.isCurrent}
                      onClick={() => revokeSession(item.id)}
                      className="border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingId === item.id ? "Revoking..." : "Revoke"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
