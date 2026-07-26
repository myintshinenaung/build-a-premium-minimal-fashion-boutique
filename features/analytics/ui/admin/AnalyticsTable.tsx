type AnalyticsTableProps = {
  columns: string[];
  rows: Array<Array<string | number>>;
  emptyMessage?: string;
};

export function AnalyticsTable({ columns, rows, emptyMessage = "No data for this range." }: AnalyticsTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-stone">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.18em] text-stone">
            {columns.map((column) => (
              <th key={column} className="px-3 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-line/70 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
