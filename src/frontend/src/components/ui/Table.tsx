type Column = { key: string; label: string };
type TableProps<T extends Record<string, any>> = {
  columns: Column[];
  data: T[];
  className?: string;
};
export default function Table<T extends Record<string, any>>({ columns, data, className = "" }: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0 rounded-xl shadow ${className}`}>
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-primary-light text-gray-900">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-3 sm:px-4 py-2 font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-primary-pale dark:[&>tr:nth-child(odd)]:bg-gray-800 dark:[&>tr:nth-child(even)]:bg-gray-700">
          {data.map((row, i) => (
            <tr key={i} className="divide-x divide-gray-100 dark:divide-gray-700">
              {columns.map((c) => (
                <td key={c.key} className="px-3 sm:px-4 py-2">{String(row[c.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
