import type { NotificationDeliveryLog } from "@/types/notifications";

type DeliveryLogTableProps = {
  items: NotificationDeliveryLog[];
};

export function DeliveryLogTable({ items }: DeliveryLogTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Timestamp</th>
            <th className="px-5 py-4 font-medium">Channel</th>
            <th className="px-5 py-4 font-medium">Recipient</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Error</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-stone">
                No delivery logs yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="px-5 py-4 text-stone">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4 capitalize text-ink">{item.channel}</td>
                <td className="px-5 py-4 text-stone">{item.recipient}</td>
                <td className="px-5 py-4 capitalize text-stone">{item.status}</td>
                <td className="px-5 py-4 text-stone">{item.error ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
