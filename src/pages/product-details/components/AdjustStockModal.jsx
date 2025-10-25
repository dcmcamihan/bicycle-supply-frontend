import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import API_ENDPOINTS from '../../../config/api';
import { useToast } from '../../../components/ui/Toast';

const AdjustStockModal = ({ isOpen, onClose, productId, currentQoh = 0, onAdjusted }) => {
  const toast = useToast();
  const [delta, setDelta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]); // {date, type, quantity, ref, notes}
  const [historyEdits, setHistoryEdits] = useState([]); // editable quantities per row
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 5; // fixed rows per page

  // Required fields for Supply
  const [supplierId, setSupplierId] = useState(null);
  const [paymentMethodCode, setPaymentMethodCode] = useState('');
  const [saleAttendant, setSaleAttendant] = useState('');
  const [manager, setManager] = useState('13'); // default same as POS
  const [reason, setReason] = useState('Inventory adjustment');

  // Options
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  useEffect(() => {
    setDelta('');
    setError('');
  }, [isOpen]);

  // Prefill from product and fetch options
  useEffect(() => {
    const init = async () => {
      try {
        if (productId) {
          const res = await fetch(API_ENDPOINTS.PRODUCT(productId));
          if (res.ok) {
            const data = await res.json();
            if (data?.supplier_id) setSupplierId(String(data.supplier_id));
          }
        }
      } catch {}
      try {
        const supRes = await fetch(API_ENDPOINTS.SUPPLIERS);
        if (supRes.ok) {
          const sup = await supRes.json();
          setSupplierOptions((sup || []).map(s => ({ value: String(s.supplier_id), label: s.supplier_name })));
        }
      } catch {}
      try {
        const pmRes = await fetch(API_ENDPOINTS.PAYMENT_METHODS);
        if (pmRes.ok) {
          const pms = await pmRes.json();
          setPaymentOptions((pms || []).map(m => ({ value: String(m.payment_method_code || m.code), label: m.name || m.payment_method_code })));
          const cash = (pms || []).find(m => (m.payment_method_code || m.code) === 'CASH');
          if (cash) setPaymentMethodCode('CASH');
        }
      } catch {}
      try {
        const empRes = await fetch(API_ENDPOINTS.EMPLOYEES);
        if (empRes.ok) {
          const emps = await empRes.json();
          setEmployeeOptions((emps || []).map(e => ({ value: String(e.employee_id), label: `${e.first_name} ${e.last_name}` })));
          if ((emps || []).length > 0) setSaleAttendant(String(emps[0].employee_id));
        }
      } catch {}
    };
    if (isOpen) init();
  }, [isOpen, productId]);

  // Load stock history (read-only UI)
  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      const rows = [];
      try {
        // Supplies -> positive qty
        const sdRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS);
        if (sdRes.ok) {
          const sds = await sdRes.json();
          const filtered = (sds || []).filter(d => Number(d.product_id) === Number(productId));
          // Map each with supply header date if available
          for (const d of filtered) {
            let date = null;
            try {
              if (d.supply_id) {
                const sRes = await fetch(API_ENDPOINTS.SUPPLY(d.supply_id));
                if (sRes.ok) {
                  const s = await sRes.json();
                  date = s?.supply_date || null;
                }
              }
            } catch {}
            rows.push({ date: date || d.created_at || new Date().toISOString(), type: 'Supply', quantity: Number(d.quantity_supplied)||0, ref: d.supply_id ? `Supply #${d.supply_id}` : '-', notes: '' });
          }
        }
      } catch {}
      try {
        // Stockouts -> negative qty
        const soRes = await fetch(API_ENDPOINTS.STOCKOUTS);
        if (soRes.ok) {
          const sos = await soRes.json();
          const filtered = (sos || []).filter(o => Number(o.product_id) === Number(productId));
          for (const o of filtered) {
            rows.push({ date: o.stockout_date || o.created_at || new Date().toISOString(), type: 'Stockout', quantity: -Math.abs(Number(o.quantity_removed)||0), ref: o.stockout_id ? `Stockout #${o.stockout_id}` : '-', notes: o.reason || '' });
          }
        }
      } catch {}
      try {
        // Stock Adjustments -> +/- qty from details
        const qs = new URLSearchParams({ page: '1', pageSize: '200', product_id: String(productId) });
        const adjRes = await fetch(`${API_ENDPOINTS.STOCK_ADJUSTMENTS}?${qs.toString()}`);
        if (adjRes.ok) {
          const resp = await adjRes.json();
          const adjs = Array.isArray(resp) ? resp : (resp?.data || []);
          for (const a of adjs) {
            const details = a.details || [];
            for (const d of details) {
              if (Number(d.product_id) === Number(productId)) {
                rows.push({ date: a.transaction_date || new Date().toISOString(), type: 'Adjustment', quantity: Number(d.quantity)||0, ref: a.adjustment_id ? `Adj #${a.adjustment_id}` : '-', notes: a.remarks || '' });
              }
            }
          }
        }
      } catch {}
      // Sort desc date
      rows.sort((a,b) => new Date(b.date) - new Date(a.date));
      setHistory(rows);
      setHistoryEdits(rows.map(r => Number(r.quantity) || 0));
      setHistoryLoading(false);
    };
    if (isOpen && productId) loadHistory();
  }, [isOpen, productId, historyRefreshKey]);

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = history.slice(startIdx, startIdx + pageSize);

  if (!isOpen) return null;

  const handleAdjust = async () => {
    setError('');
    // Compute total delta from edits vs original quantities
    const totalDelta = historyEdits.reduce((sum, v, i) => sum + ((Number(v)||0) - (Number(history[i]?.quantity)||0)), 0);
    if (!totalDelta || Number.isNaN(totalDelta) || totalDelta === 0) {
      setError('No changes detected. Adjust one or more rows to proceed.');
      return;
    }
    setLoading(true);
    try {
      const genId = () => {
        try { return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; } catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
      };
      const payload = {
        client_request_id: genId(),
        adjustment_type: 'manual',
        transaction_date: new Date().toISOString(),
        remarks: 'Manual adjustment via Product Details',
        processed_by: null,
        details: [{ product_id: Number(productId), quantity: Number(totalDelta) }]
      };
      const res = await fetch(API_ENDPOINTS.STOCK_ADJUSTMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text().catch(()=> '');
        let msg = 'Failed to save stock adjustment';
        try { const j = JSON.parse(txt || '{}'); msg = j.message || j.error || msg; } catch { if (txt) msg = txt; }
        throw new Error(msg);
      }
      const data = await res.json().catch(()=>({}));
      if (onAdjusted) onAdjusted(Number(totalDelta));
      // Reload history and keep modal open so user sees the change immediately
      setHistoryRefreshKey(k => k + 1);
      try { toast?.success && toast.success('Stock adjusted successfully'); } catch {}
    } catch (e) {
      setError(e?.message || 'Failed to apply stock adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1400 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-raised">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Adjust Stock</h3>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Current QOH: <span className="font-medium text-foreground">{currentQoh}</span></div>
          {/* Per-transaction editing below; overall adjustment is computed from row edits */}
          {/* Disabled fields retained for UI layout but not editable */}
          <div className="opacity-60 pointer-events-none select-none">
            <div className="grid grid-cols-2 gap-2">
              <Select label="Supplier" options={supplierOptions} value={supplierId} onChange={()=>{}} placeholder="Select supplier" />
              <Select label="Payment Method" options={paymentOptions} value={paymentMethodCode} onChange={()=>{}} placeholder="Select payment method" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Select label="Sale Attendant" options={employeeOptions} value={saleAttendant} onChange={()=>{}} placeholder="Select employee" />
              <Input label="Manager ID" type="number" value={manager} onChange={()=>{}} placeholder="Manager ID" />
            </div>
            <Input className="mt-2" label="Reason" type="text" value={reason} onChange={()=>{}} placeholder="e.g., Damaged, Shrinkage" />
          </div>

          {/* Stock History */}
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="font-body font-semibold text-sm text-foreground mb-2">Stock History</h4>
            {historyLoading ? (
              <div className="text-sm text-muted-foreground">Loading history…</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-muted-foreground">No history found for this product.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((h, i) => {
                      const globalIdx = startIdx + i;
                      return (
                      <tr key={i} className="border-t border-border">
                        <td className="py-2 pr-4">{new Date(h.date).toLocaleString()}</td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 border border-border"
                              onClick={() => setHistoryEdits(prev => prev.map((v, idx) => idx===globalIdx ? (Number(v||0)-1) : v))}
                            >−</button>
                            <input
                              type="number"
                              className={`w-24 px-2 py-1 bg-input border border-border rounded font-body text-sm ${ (Number(historyEdits[i])||0) >= 0 ? 'text-success' : 'text-destructive'}`}
                              value={historyEdits[globalIdx] ?? 0}
                              onChange={(e) => {
                                const v = e.target.value;
                                setHistoryEdits(prev => prev.map((x, idx) => idx===globalIdx ? v : x));
                              }}
                            />
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 border border-border"
                              onClick={() => setHistoryEdits(prev => prev.map((v, idx) => idx===globalIdx ? (Number(v||0)+1) : v))}
                            >+</button>
                            <span className="text-xs text-muted-foreground ml-2">Original: <span className={`font-medium ${h.quantity>=0 ? 'text-success' : 'text-destructive'}`}>{h.quantity > 0 ? `+${h.quantity}` : h.quantity}</span></span>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                {/* Pagination controls (fixed 5 rows per page) */}
                <div className="flex items-center justify-end mt-3 text-sm gap-2">
                  <span className="text-muted-foreground">Page {page} of {totalPages}</span>
                  <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
                  <button className="px-2 py-1 border border-border rounded disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
                </div>
              </div>
            )}
          </div>
          {error && <div className="text-xs text-destructive">{error}</div>}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              variant="default"
              onClick={handleAdjust}
              loading={loading}
              iconName="Save"
              iconPosition="left"
              disabled={Number(delta) < 0 && Math.abs(Number(delta)) > Number(currentQoh || 0)}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
