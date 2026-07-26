import type { QueueStatsResponse } from "@/types/performance";

type QueueStatusPanelProps = {
  queues: QueueStatsResponse;
};

export function QueueStatusPanel({ queues }: QueueStatusPanelProps) {
  return (
    <div className="border border-line bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Pending</p>
          <p className="mt-2 text-2xl font-medium text-ink">{queues.pending}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Running</p>
          <p className="mt-2 text-2xl font-medium text-ink">{queues.running}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Completed</p>
          <p className="mt-2 text-2xl font-medium text-ink">{queues.completed}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Failed</p>
          <p className="mt-2 text-2xl font-medium text-ink">{queues.failed}</p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {queues.jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
                  No background jobs queued yet.
                </td>
              </tr>
            ) : (
              queues.jobs.slice(0, 12).map((job) => (
                <tr key={job.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{job.id}</td>
                  <td className="px-4 py-3 capitalize text-stone">{job.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 capitalize text-stone">{job.status}</td>
                  <td className="px-4 py-3 text-stone">{new Date(job.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
