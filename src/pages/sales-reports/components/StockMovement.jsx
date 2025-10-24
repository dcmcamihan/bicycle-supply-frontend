import React, { useMemo, useState } from 'react';

// movements: [{ date, type: 'Supply'|'Stockout'|'Adjustment', remarks, lines: [{product_id, quantity}] }]
const StockMovement = ({ movements = [] }) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(movements.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = useMemo(() => movements.slice(startIdx, startIdx + pageSize), [movements, startIdx, pageSize]);

  const summarize = (m) => {
    const total = (m.lines || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    const pos = total >= 0;
    const count = (m.lines || []).length;
    return `${pos ? '+' : ''}${total} qty • ${count} line${count === 1 ? '' : 's'}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle mt-8">
      <h2 className="font-heading text-lg font-bold text-foreground mb-1">Stock Movement History</h2>
      <p className="font-body text-sm text-muted-foreground mb-4">Supplies, stockouts, and adjustments in the selected range.</p>
      {movements.length === 0 ? (
        <div className="text-sm text-muted-foreground">No stock movements found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Summary</th>
                <th className="py-2 pr-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((m, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="py-2 pr-4 align-top">{new Date(m.date).toLocaleString()}</td>
                  <td className="py-2 pr-4 align-top">{m.type}</td>
                  <td className={`py-2 pr-4 align-top ${((m.lines||[]).reduce((s,d)=>s+(Number(d.quantity)||0),0))>=0?'text-success':'text-destructive'}`}>{summarize(m)}</td>
                  <td className="py-2 pr-4 align-top">{m.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-end mt-3 text-sm gap-2">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovement;
