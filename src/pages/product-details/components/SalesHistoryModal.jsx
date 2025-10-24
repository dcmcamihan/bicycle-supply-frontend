import React from 'react';
import Button from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../config/api';

const SalesHistoryModal = ({ isOpen, onClose, productId }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    const load = async () => {
      if (!isOpen || !productId) return;
      setLoading(true); setError('');
      try {
        const out = [];
        const res = await fetch(API_ENDPOINTS.SALES);
        const sales = res.ok ? await res.json() : [];
        for (const sale of sales) {
          try {
            const detRes = await fetch(API_ENDPOINTS.SALE_DETAILS(sale.sale_id));
            if (!detRes.ok) continue;
            const details = await detRes.json();
            for (const d of details) {
              if (Number(d.product_id) === Number(productId)) {
                out.push({
                  sale_id: sale.sale_id,
                  date: sale.sale_date ? new Date(sale.sale_date).toISOString().slice(0,10) : '',
                  quantity: Number(d.quantity_sold) || 0,
                });
              }
            }
          } catch {}
        }
        out.sort((a,b)=> new Date(b.date)-new Date(a.date));
        setRows(out);
      } catch (e) {
        setError(e?.message || 'Failed to load sales history');
      } finally { setLoading(false); }
    };
    load();
  }, [isOpen, productId]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-heading font-semibold">Sales History</h3>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={18} />
        </div>
        {error && <div className="text-sm text-destructive mb-2">{error}</div>}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No sales found for this product.</div>
        ) : (
          <div className="max-h-96 overflow-auto border border-border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 border-b border-border">Sale #</th>
                  <th className="text-left p-2 border-b border-border">Date</th>
                  <th className="text-right p-2 border-b border-border">Qty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.sale_id}-${i}`} className="hover:bg-muted/50">
                    <td className="p-2 border-b border-border">{r.sale_id}</td>
                    <td className="p-2 border-b border-border">{r.date}</td>
                    <td className="p-2 border-b border-border text-right">{r.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryModal;
