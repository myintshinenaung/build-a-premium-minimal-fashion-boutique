import type { NotificationTemplate } from "@/types/notifications";
import { NOTIFICATION_TYPE_LABELS, TEMPLATE_CATEGORY_LABELS } from "@/types/notifications";

type NotificationTemplateTableProps = {
  items: NotificationTemplate[];
};

export function NotificationTemplateTable({ items }: NotificationTemplateTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Name</th>
            <th className="px-5 py-4 font-medium">Category</th>
            <th className="px-5 py-4 font-medium">Type</th>
            <th className="px-5 py-4 font-medium">Channels</th>
            <th className="px-5 py-4 font-medium">Subject</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-line align-top">
              <td className="px-5 py-4 font-medium text-ink">{item.name}</td>
              <td className="px-5 py-4 text-stone">{TEMPLATE_CATEGORY_LABELS[item.category]}</td>
              <td className="px-5 py-4 text-stone">{NOTIFICATION_TYPE_LABELS[item.notificationType]}</td>
              <td className="px-5 py-4 text-stone">{item.channels.join(", ")}</td>
              <td className="px-5 py-4 text-stone">{item.subjectTemplate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
