import Link from "next/link";

type NotificationBellProps = {
  unreadCount: number;
};

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  return (
    <Link
      href="/admin/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-stone transition-colors hover:bg-mist hover:text-ink"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3a5 5 0 0 0-5 5v2.1c0 .5-.2 1-.5 1.4L5 14h14l-1.5-2.5c-.3-.4-.5-.9-.5-1.4V8a5 5 0 0 0-5-5Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
    </Link>
  );
}
