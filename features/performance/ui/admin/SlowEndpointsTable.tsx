import type { SlowEndpointStat, SlowQueryStat } from "@/types/performance";

type SlowEndpointsTableProps = {
  endpoints: SlowEndpointStat[];
  queries: SlowQueryStat[];
};

export function SlowEndpointsTable({ endpoints, queries }: SlowEndpointsTableProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="overflow-x-auto border border-line bg-white">
        <div className="border-b border-line px-5 py-4 text-sm font-medium text-ink">Slow Endpoints</div>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-5 py-4 font-medium">Path</th>
              <th className="px-5 py-4 font-medium">Avg</th>
              <th className="px-5 py-4 font-medium">Max</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-stone">
                  No slow endpoints recorded.
                </td>
              </tr>
            ) : (
              endpoints.slice(0, 10).map((entry) => (
                <tr key={entry.path} className="border-t border-line">
                  <td className="px-5 py-4 text-ink">{entry.path}</td>
                  <td className="px-5 py-4 text-stone">{entry.averageMs}ms</td>
                  <td className="px-5 py-4 text-stone">{entry.maxMs}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto border border-line bg-white">
        <div className="border-b border-line px-5 py-4 text-sm font-medium text-ink">Slow Queries</div>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-5 py-4 font-medium">Query</th>
              <th className="px-5 py-4 font-medium">Avg</th>
              <th className="px-5 py-4 font-medium">Max</th>
            </tr>
          </thead>
          <tbody>
            {queries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-stone">
                  No slow queries recorded.
                </td>
              </tr>
            ) : (
              queries.slice(0, 10).map((entry) => (
                <tr key={entry.label} className="border-t border-line">
                  <td className="px-5 py-4 text-ink">{entry.label}</td>
                  <td className="px-5 py-4 text-stone">{entry.averageMs}ms</td>
                  <td className="px-5 py-4 text-stone">{entry.maxMs}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
