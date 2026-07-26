import type { AuditLogEntry } from "@/types/security";

type AuditLogTableProps = {
  items: AuditLogEntry[];
};

export function AuditLogTable({ items }: AuditLogTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Timestamp</th>
            <th className="px-5 py-4 font-medium">User</th>
            <th className="px-5 py-4 font-medium">Action</th>
            <th className="px-5 py-4 font-medium">Resource</th>
            <th className="px-5 py-4 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-stone">
                No audit events recorded yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-line align-top">
                <td className="px-5 py-4 text-stone">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">{item.userName}</div>
                  <div className="text-xs text-stone">{item.userEmail ?? "—"}</div>
                </td>
                <td className="px-5 py-4 capitalize text-ink">{item.action.replace(/_/g, " ")}</td>
                <td className="px-5 py-4 text-stone">
                  {item.resource}
                  {item.resourceId ? ` · ${item.resourceId}` : ""}
                </td>
                <td className="px-5 py-4 text-xs text-stone">{JSON.stringify(item.details)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
