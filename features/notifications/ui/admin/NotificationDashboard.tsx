"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { NotificationRecord, NotificationType } from "@/types/notifications";
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPES } from "@/types/notifications";

type NotificationDashboardProps = {
  items: NotificationRecord[];
  unreadCount: number;
  filters: {
    notificationType?: NotificationType;
    from?: string;
    to?: string;
    status?: string;
  };
};

export function NotificationDashboard({ items, unreadCount, filters }: NotificationDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState(filters.notificationType ?? "");
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (notificationType) {
      params.set("notificationType", notificationType);
    } else {
      params.delete("notificationType");
    }

    if (from) {
      params.set("from", from);
    } else {
      params.delete("from");
    }

    if (to) {
      params.set("to", to);
    } else {
      params.delete("to");
    }

    router.push(`/admin/notifications?${params.toString()}`);
  }

  function clearFilters() {
    setNotificationType("");
    setFrom("");
    setTo("");
    router.push("/admin/notifications");
  }

  async function markAllRead() {
    setPending("all");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to mark notifications as read.");
      }
      setMessage("All notifications marked as read.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to mark notifications as read.");
    } finally {
      setPending(null);
    }
  }

  async function markRead(id: string) {
    setPending(id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] })
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to mark notification as read.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to mark notification as read.");
    } finally {
      setPending(null);
    }
  }

  async function archiveNotification(id: string) {
    setPending(`archive-${id}`);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archiveIds: [id] })
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to archive notification.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to archive notification.");
    } finally {
      setPending(null);
    }
  }

  async function deleteNotification(id: string) {
    setPending(`delete-${id}`);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to delete notification.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete notification.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={applyFilters} className="grid gap-3 border border-line bg-white p-4 md:grid-cols-4">
        <label className="space-y-1 text-xs uppercase tracking-[0.16em] text-stone">
          Type
          <select
            value={notificationType}
            onChange={(event) => setNotificationType(event.target.value)}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
          >
            <option value="">All types</option>
            {NOTIFICATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {NOTIFICATION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs uppercase tracking-[0.16em] text-stone">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
          />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-[0.16em] text-stone">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="mt-1 w-full border border-line bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-mist"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] text-stone transition-colors hover:bg-mist"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        <button
          type="button"
          disabled={pending === "all" || unreadCount === 0}
          onClick={markAllRead}
          className="border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-mist disabled:opacity-50"
        >
          {pending === "all" ? "Updating..." : "Mark All Read"}
        </button>
      </div>
      {message ? <p className="text-sm text-stone">{message}</p> : null}
      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-5 py-4 font-medium">Type</th>
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Created</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-stone">
                  No notifications yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-line align-top">
                  <td className="px-5 py-4 text-stone">{NOTIFICATION_TYPE_LABELS[item.notificationType]}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink">{item.title}</div>
                    <div className="text-xs text-stone">{item.body}</div>
                  </td>
                  <td className="px-5 py-4 capitalize text-stone">{item.status}</td>
                  <td className="px-5 py-4 text-stone">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {item.status === "unread" ? (
                        <button
                          type="button"
                          disabled={pending === item.id}
                          onClick={() => markRead(item.id)}
                          className="border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink hover:bg-mist disabled:opacity-50"
                        >
                          Read
                        </button>
                      ) : null}
                      {item.status !== "archived" ? (
                        <button
                          type="button"
                          disabled={pending === `archive-${item.id}`}
                          onClick={() => archiveNotification(item.id)}
                          className="border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink hover:bg-mist disabled:opacity-50"
                        >
                          Archive
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={pending === `delete-${item.id}`}
                        onClick={() => deleteNotification(item.id)}
                        className="border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-ink hover:bg-mist disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
