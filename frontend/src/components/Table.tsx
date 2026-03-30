import React from 'react';

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

const Table = React.memo(<T extends { id: string | number }>({ 
  data, 
  columns, 
  loading, 
  emptyMessage = "No records found." 
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-[0.2em] transition-all">
          <tr className="border-b border-white/5">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-8 py-5 font-bold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, rowIdx) => (
            <tr 
              key={item.id} 
              className="group hover:bg-white/[0.02] transition-colors"
              style={{ animationDelay: `${rowIdx * 50}ms`, animation: 'animate-in' }}
            >
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  className={`px-8 py-4 text-slate-300 font-medium transition-colors group-hover:text-white ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-8 py-20 text-center">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <div className="p-4 bg-slate-800/50 rounded-full mb-4 opacity-50">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-600" />
                  </div>
                  <span className="font-semibold text-lg">{emptyMessage}</span>
                  <span className="text-sm mt-1 opacity-60">Try adding a new record to get started.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default Table as <T>(props: TableProps<T> & { ref?: React.ForwardedRef<any> }) => React.ReactElement;
