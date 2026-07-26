import type { LoginHistoryEntry } from "@/types/security";

type LoginHistoryTableProps = {
  items: LoginHistoryEntry[];
};

export function LoginHistoryTable({ items }: LoginHistoryTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Timestamp</th>
            <th className="px-5 py-4 font-medium">Email</th>
            <th className="px-5 py-4 font-medium">Result</th>
            <th className="px-5 py-4 font-medium">Device</th>
            <th className="px-5 py-4 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-stone">
                No login attempts recorded yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="px-5 py-4 text-stone">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4 text-ink">{item.userEmail}</td>
                <td className="px-5 py-4">
                  <span className={item.success ? "text-emerald-700" : "text-red-700"}>
                    {item.success ? "Success" : "Failed"}
                  </span>
                  {!item.success && item.failureReason ? (
                    <div className="text-xs text-stone">{item.failureReason}</div>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-stone">{item.deviceLabel ?? "Unknown"}</td>
                <td className="px-5 py-4 text-stone">{item.ipAddress ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
