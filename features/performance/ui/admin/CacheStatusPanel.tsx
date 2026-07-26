import type { CacheStatsResponse } from "@/types/performance";

type CacheStatusPanelProps = {
  cache: CacheStatsResponse;
};

export function CacheStatusPanel({ cache }: CacheStatusPanelProps) {
  return (
    <div className="border border-line bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Hit Rate</p>
          <p className="mt-2 text-2xl font-medium text-ink">{(cache.hitRate * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Requests</p>
          <p className="mt-2 text-2xl font-medium text-ink">{cache.totalRequests}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone">Misses</p>
          <p className="mt-2 text-2xl font-medium text-ink">{cache.totalMisses}</p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Requests</th>
              <th className="px-4 py-3 font-medium">Misses</th>
              <th className="px-4 py-3 font-medium">TTL</th>
            </tr>
          </thead>
          <tbody>
            {cache.entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
                  No cache activity recorded yet.
                </td>
              </tr>
            ) : (
              cache.entries.map((entry) => (
                <tr key={entry.key} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{entry.key}</td>
                  <td className="px-4 py-3 text-stone">{entry.requests}</td>
                  <td className="px-4 py-3 text-stone">{entry.misses}</td>
                  <td className="px-4 py-3 text-stone">{entry.revalidateSeconds}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
