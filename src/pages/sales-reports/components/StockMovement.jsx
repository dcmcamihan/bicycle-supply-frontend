import React, { useMemo, useState } from 'react';
import API_ENDPOINTS from '../../../config/api';

// movements: [{ date, type: 'Supply'|'Stockout'|'Adjustment', remarks, lines: [{product_id, quantity}] }]
const StockMovement = ({ movements = [] }) => {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [productsById, setProductsById] = useState({}); // cache: { [id]: { product_name, ... } }
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(movements.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = useMemo(() => movements.slice(startIdx, startIdx + pageSize), [movements, startIdx, pageSize]);

  const summarize = (m) => {
    const total = (m.lines || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    const pos = total >= 0;
    const count = (m.lines || []).length;
    return { total, pos, count };
  };

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch { return d; }
  };

  // Fetch and cache product details for a set of ids
  const fetchProductNames = async (ids = []) => {
    const missing = ids.filter(id => id != null && !productsById[String(id)]);
    if (missing.length === 0) return;

    try {
      const results = await Promise.all(missing.map(async (pid) => {
        try {
          const res = await fetch(API_ENDPOINTS.PRODUCT(pid));
          if (!res.ok) return { id: pid, data: null };
          const data = await res.json();
          return { id: pid, data };
        } catch (err) {
          return { id: pid, data: null };
        }
      }));

      setProductsById(prev => {
        const next = { ...prev };
        results.forEach(r => {
          if (r && r.id != null) next[String(r.id)] = r.data || { product_name: String(r.id) };
        });
        return next;
      });
    } catch (err) {
      // ignore fetch errors; leave fallback to id
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle mt-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground mb-1">Stock Movement History</h2>
          <p className="font-body text-sm text-muted-foreground">Supplies, stockouts, and adjustments in the selected range.</p>
        </div>
        <div className="text-sm text-muted-foreground">{movements.length} movement{movements.length === 1 ? '' : 's'}</div>
      </div>

      {movements.length === 0 ? (
        <div className="text-sm text-muted-foreground mt-4">No stock movements found.</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Net Qty</th>
                <th className="py-2 pr-4">Details</th>
                <th className="py-2 pr-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((m, idx) => {
                const { total, pos, count } = summarize(m);
                const rowKey = startIdx + idx;
                return (
                  <React.Fragment key={rowKey}>
                    <tr className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="py-2 pr-4 align-top w-48">{formatDate(m.date)}</td>
                      <td className="py-2 pr-4 align-top w-32">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${m.type === 'Supply' ? 'bg-success/10 text-success' : m.type === 'Stockout' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2 pr-4 align-top">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${pos ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {pos ? '+' : ''}{total} qty
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">{count} line{count === 1 ? '' : 's'}</div>
                      </td>
                      <td className="py-2 pr-4 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-sm text-primary hover:underline"
                            onClick={async () => {
                              const willOpen = !expanded[rowKey];
                              if (willOpen) {
                                const ids = (m.lines || []).map(l => l.product_id).filter(Boolean);
                                await fetchProductNames(ids);
                              }
                              setExpanded(e => ({ ...e, [rowKey]: !e[rowKey] }));
                            }}
                          >
                            {expanded[rowKey] ? 'Hide items' : 'Show items'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded[rowKey] && (
                      <tr className="border-b border-border bg-muted/30">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(m.lines || []).map((line, i) => {
                              const pid = String(line.product_id);
                              const prod = productsById[pid];
                              const label = prod && prod.product_name ? prod.product_name : (prod && prod.name ? prod.name : pid);
                              return (
                                <div key={i} className="flex items-center justify-between bg-white/50 p-2 rounded border border-border">
                                  <div className="text-sm font-medium">Product: <span className="font-normal">{label}</span></div>
                                  <div className={`text-sm font-semibold ${Number(line.quantity) >= 0 ? 'text-success' : 'text-destructive'}`}>{Number(line.quantity) >= 0 ? '+' : ''}{line.quantity}</div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm gap-2">
            <div className="text-muted-foreground">Showing {Math.min(movements.length, startIdx + 1)} - {Math.min(movements.length, startIdx + pageSize)} of {movements.length}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
              <span className="text-muted-foreground">Page {page} of {totalPages}</span>
              <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovement;
