import type { SystemHealthResponse } from "@/types/performance";

type SystemHealthPanelProps = {
  system: SystemHealthResponse;
};

export function SystemHealthPanel({ system }: SystemHealthPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-stone">Status</p>
        <p className="mt-2 text-2xl font-medium capitalize text-ink">{system.status}</p>
      </div>
      <div className="border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-stone">Database</p>
        <p className="mt-2 text-2xl font-medium text-ink">{system.database.connected ? "Connected" : "Offline"}</p>
        <p className="mt-1 text-sm text-stone">{system.database.latencyMs ?? "—"}ms latency</p>
      </div>
      <div className="border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-stone">Memory</p>
        <p className="mt-2 text-2xl font-medium text-ink">{system.memory.heapUsedMb} MB</p>
        <p className="mt-1 text-sm text-stone">RSS {system.memory.rssMb} MB</p>
      </div>
      <div className="border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-stone">Uptime</p>
        <p className="mt-2 text-2xl font-medium text-ink">{Math.floor(system.uptimeSeconds / 60)}m</p>
        <p className="mt-1 text-sm text-stone">Checked {new Date(system.checkedAt).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
