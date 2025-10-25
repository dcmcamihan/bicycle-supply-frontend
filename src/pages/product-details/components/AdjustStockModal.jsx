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
            let supplierName = '';
            try {
              if (d.supply_id) {
                const sRes = await fetch(API_ENDPOINTS.SUPPLY(d.supply_id));
                if (sRes.ok) {
                  const s = await sRes.json();
                  date = s?.supply_date || null;
                  supplierName = s?.supplier_name || '';
                }
              }
            } catch {}
            rows.push({
              date: date || d.created_at || new Date().toISOString(),
              type: 'Supply',
              quantity: Number(d.quantity_supplied)||0,
              ref: d.supply_id ? `Supply #${d.supply_id}` : '-',
              supplier: supplierName,
              notes: d.remarks || '',
              supply_detail_id: d.supply_details_id ?? d.supply_detail_id,
              supply_id: d.supply_id,
              product_id: d.product_id
            });
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
    const changedRows = historyEdits
      .map((v, i) => ({ newQty: Number(v), origQty: Number(history[i]?.quantity), detail: history[i] }))
      .filter(row => row.newQty !== row.origQty);
    if (changedRows.length === 0) {
      setError('No changes detected. Adjust one or more rows to proceed.');
      return;
    }
    setLoading(true);
    let anySuccess = false;
    let errorMessages = [];
    for (const row of changedRows) {
      let updated = false;
      try {
        // Use supply_detail_id directly from history row
        const supplyDetailId = row.detail.supply_detail_id;
        if (typeof supplyDetailId !== 'undefined' && supplyDetailId !== null && !isNaN(Number(supplyDetailId))) {
          // Optionally fetch the latest supply detail for logging
          let supplyDetail = null;
          try {
            const sdRes = await fetch(API_ENDPOINTS.SUPPLY_DETAIL(supplyDetailId));
            if (sdRes.ok) {
              supplyDetail = await sdRes.json();
              console.log('DEBUG: Fetched supplyDetail for update:', supplyDetail);
            }
          } catch {}
          const putPayload = {
            supply_details_id: Number(supplyDetailId),
            supply_id: Number(row.detail.supply_id),
            product_id: Number(row.detail.product_id),
            quantity_supplied: Number(row.newQty)
          };
          console.log('DEBUG: PUT payload:', putPayload);
          const putRes = await fetch(`${API_ENDPOINTS.SUPPLY_DETAIL(supplyDetailId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putPayload)
          });
          if (putRes.ok) {
            anySuccess = true;
            updated = true;
            // Log stock adjustment transaction for this supply
            try {
              // Build remarks for this supply
              const detailsSummary = `The quantity of Product #${row.detail.product_id} from Supply #${row.detail.supply_id || row.detail.supply_detail_id} has been changed from ${row.origQty} to ${row.newQty}.`;
              // Get logged-in auth_user from localStorage
              let processedBy = null;
              try {
                const authUserStr = localStorage.getItem('auth_user');
                let authUser = null;
                if (authUserStr) {
                  authUser = JSON.parse(authUserStr);
                  console.log('DEBUG: authUser from localStorage:', authUser);
                  processedBy = authUser?.id || authUser?.username || authUser || null;
                }
              } catch {}
              const adjustmentPayload = {
                // adjustment_id omitted (auto-increment)
                client_request_id: null,
                return_id: null,
                adjustment_type: 'manual',
                transaction_date: new Date().toISOString(),
                remarks: `${detailsSummary}`,
                processed_by: processedBy
              };
              console.log('DEBUG: Stock Adjustment Payload:', adjustmentPayload);
              const res = await fetch(API_ENDPOINTS.STOCK_ADJUSTMENTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adjustmentPayload)
              });
              let resJson = null;
              try {
                resJson = await res.json();
              } catch {
                resJson = null;
              }
              console.log('DEBUG: Stock Adjustment POST response:', res.status, resJson);
              // Post stock adjustment detail if adjustment_id is returned
              const adjustmentId = resJson?.adjustment_id || resJson?.id;
              if (adjustmentId) {
                const detailPayload = {
                  adjustment_id: adjustmentId,
                  product_id: Number(row.detail.product_id),
                  quantity: Number(row.newQty)
                };
                try {
                  const detailRes = await fetch(API_ENDPOINTS.STOCK_ADJUSTMENT_DETAILS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailPayload)
                  });
                  let detailResText = '';
                  try {
                    detailResText = await detailRes.text();
                  } catch {}
                  console.log('DEBUG: Stock Adjustment Detail POST response:', detailRes.status, detailResText);
                } catch (err) {
                  console.error('Failed to log stock adjustment detail:', err);
                }
              }
            } catch (err) {
              console.error('Failed to log stock adjustment:', err);
            }
          } else {
            const txt = await putRes.text().catch(()=> '');
            let msg = `Failed to update supply detail for Supply Detail ID #${supplyDetailId}`;
            try { const j = JSON.parse(txt || '{}'); msg = j.message || j.error || msg; } catch { if (txt) msg = txt; }
            errorMessages.push(msg);
          }
        } else {
          console.log('DEBUG: Row object missing supply_detail_id:', row.detail);
          errorMessages.push('Invalid supply_detail_id for update');
        }
      } catch (e) {
        errorMessages.push(e?.message || 'Unknown error updating supply detail');
      }
    }
    if (anySuccess) {
      if (onAdjusted) onAdjusted();
      setHistoryRefreshKey(k => k + 1);
      try { toast?.success && toast.success('Supply quantities updated successfully'); } catch {}
    }
    if (errorMessages.length > 0) {
      setError(errorMessages.join('\n'));
    } else if (!anySuccess) {
      setError('No supply details were updated.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-1400 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-raised">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Adjust Stock</h3>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Product ID: <span className="font-medium text-foreground">{productId}</span></div>
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

          {/* Stock History (Supplies only) */}
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="font-body font-semibold text-sm text-foreground mb-2">Supply History</h4>
            {historyLoading ? (
              <div className="text-sm text-muted-foreground">Loading history…</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-muted-foreground">No supply history found for this product.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Quantity Supplied</th>
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
                      );
                    })}
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
