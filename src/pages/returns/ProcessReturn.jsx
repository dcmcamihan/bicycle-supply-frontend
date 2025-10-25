import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import API_ENDPOINTS from '../../config/api';
import { useToast } from '../../components/ui/Toast';

const ProcessReturn = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sales, setSales] = useState([]);
  const [saleQuery, setSaleQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);
  const [returnLines, setReturnLines] = useState([]); // {sale_detail_id, product_id, name, qtyPurchased, qtyReturn}
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState('refund'); // refund | replacement
  const [replacementProductId, setReplacementProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const toast = useToast();

  // Load sales and products lists
  useEffect(() => {
    const load = async () => {
      try {
        const sRes = await fetch(API_ENDPOINTS.SALES);
        const sData = sRes.ok ? await sRes.json() : [];
        setSales(sData);
      } catch {}
      try {
        const pRes = await fetch(API_ENDPOINTS.PRODUCTS);
        const pData = pRes.ok ? await pRes.json() : [];
        setProducts(pData);
      } catch {}
    };
    load();
  }, []);

  // When a sale is selected, fetch details
  useEffect(() => {
    const loadDetails = async () => {
      setSaleDetails([]);
      setReturnLines([]);
      if (!selectedSale) return;
      try {
        const dRes = await fetch(API_ENDPOINTS.SALE_DETAILS(selectedSale.sale_id));
        const details = dRes.ok ? await dRes.json() : [];
        const lines = [];
        for (const d of details) {
          try {
            const pRes = await fetch(API_ENDPOINTS.PRODUCT(d.product_id));
            const p = pRes.ok ? await pRes.json() : {};
            lines.push({
              sale_detail_id: d.sale_detail_id,
              product_id: d.product_id,
              name: p.product_name || `Product #${d.product_id}`,
              qtyPurchased: d.quantity_sold || 0,
              qtyReturn: 0,
            });
          } catch {
            lines.push({ sale_detail_id: d.sale_detail_id, product_id: d.product_id, name: `Product #${d.product_id}` , qtyPurchased: d.quantity_sold || 0, qtyReturn: 0 });
          }
        }
        setSaleDetails(details);
        setReturnLines(lines);
      } catch {}
    };
    loadDetails();
  }, [selectedSale]);

  const filteredSales = useMemo(() => {
    if (!saleQuery) return sales;
    const q = saleQuery.toLowerCase();
    return sales.filter(s => String(s.sale_id).includes(q) || (s.sale_date && String(s.sale_date).toLowerCase().includes(q)));
  }, [sales, saleQuery]);

  const totalReturnQty = useMemo(() => returnLines.reduce((sum, l) => sum + (Number(l.qtyReturn)||0), 0), [returnLines]);

  const handleQtyChange = (idx, val) => {
    const v = Math.max(0, Number(val)||0);
    setReturnLines(prev => prev.map((l,i)=> i===idx ? { ...l, qtyReturn: Math.min(v, Number(l.qtyPurchased)||0) } : l));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedSale) { setError('Select a sale first.'); return; }
    const anyReturn = returnLines.some(l => Number(l.qtyReturn)>0);
    if (!anyReturn) { setError('Set at least one return quantity.'); return; }
    if (!reason.trim()) { setError('Provide a reason for the return.'); return; }
    try {
      setSubmitting(true);
      // Create return rows (PENDING) with quantity and optional replacement product
      const createdReturnIds = [];
      for (const l of returnLines) {
        const qty = Number(l.qtyReturn) || 0;
        if (qty <= 0) continue;
        const body = {
          sale_detail_id: l.sale_detail_id,
          quantity: qty,
          return_status: 'PEND',
          transaction_date: new Date().toISOString(),
          remarks: `Sale #${selectedSale.sale_id} • ${reason}`,
        };
        if (actionType === 'replacement' && replacementProductId) {
          body.replacement_product_id = Number(replacementProductId);
        }
        const rRes = await fetch(API_ENDPOINTS.RETURN_AND_REPLACEMENTS, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const rData = await rRes.json().catch(()=>({}));
        if (!rRes.ok) throw new Error(rData?.message || rData?.error || 'Failed to create return');
        const rid = rData?.return_id || rData?.id;
        if (rid) createdReturnIds.push(rid);
      }

      // Approve and post each return row (creates stock adjustments server-side)
      const genId = () => {
        try { return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; } catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
      };
      for (const rid of createdReturnIds) {
        const appr = await fetch(`${API_ENDPOINTS.RETURN_AND_REPLACEMENTS}/${rid}/approve`, { method: 'POST' });
        if (!appr.ok) {
          const t = await appr.text(); throw new Error(t || `Failed to approve return ${rid}`);
        }
        const post = await fetch(`${API_ENDPOINTS.RETURN_AND_REPLACEMENTS}/${rid}/post`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_request_id: genId() }) });
        if (!post.ok) {
          const t = await post.text(); throw new Error(t || `Failed to post return ${rid}`);
        }
      }
      setSuccess('Return processed successfully.');
      try { toast?.success && toast.success('Return posted successfully'); } catch {}
    } catch (e1) {
      setError(e1?.message || 'Failed to process return');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-5xl">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl mb-2">Process Return</h1>
          <p className="font-body text-muted-foreground mb-6">Handle customer returns and replacements.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2"><Icon name="Search" size={18}/>Find Sale</h3>
                <div className="flex gap-3">
                  <Input label="Search by Sale ID or Date" value={saleQuery} onChange={e=>setSaleQuery(e.target.value)} />
                  <Select
                    label="Select Sale"
                    value={selectedSale?.sale_id || ''}
                    onChange={(id) => {
                      const s = sales.find(x => String(x.sale_id) === String(id));
                      setSelectedSale(s || null);
                    }}
                    options={filteredSales.map(s=>({ value: s.sale_id, label: `#${s.sale_id} • ${s.sale_date ? new Date(s.sale_date).toLocaleString() : ''}` }))}
                    placeholder="Choose a sale"
                    className="min-w-[260px]"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-heading font-semibold text-lg mb-3">Items to Return</h3>
                {returnLines.length === 0 && (
                  <p className="text-sm text-muted-foreground">Select a sale to view items.</p>
                )}
                <div className="space-y-3">
                  {returnLines.map((l, idx) => (
                    <div key={l.sale_detail_id} className="flex items-center justify-between gap-4 p-3 bg-muted/40 rounded-lg">
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground">Purchased: {l.qtyPurchased}</div>
                      </div>
                      <div className="w-40">
                        <Input label="Qty Return" type="number" min={0} max={l.qtyPurchased} value={l.qtyReturn} onChange={e=>handleQtyChange(idx, e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-heading font-semibold text-lg mb-3">Resolution</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Select
                    label="Action"
                    value={actionType}
                    onChange={setActionType}
                    options={[
                      { value: 'refund', label: 'Refund' },
                      { value: 'replacement', label: 'Replacement' },
                    ]}
                    className="w-48"
                  />
                  {actionType === 'replacement' && (
                    <Select
                      label="Replacement Product"
                      value={replacementProductId}
                      onChange={setReplacementProductId}
                      options={products.map(p=>({ value: String(p.product_id || p.id), label: p.product_name || p.name }))}
                      placeholder="Select product"
                      className="min-w-[260px]"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Reason</label>
                  <textarea value={reason} onChange={e=>setReason(e.target.value)} className="w-full px-3 py-2 bg-input border border-border rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Describe the reason for return or replacement"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={()=>{ setSelectedSale(null); setReturnLines([]); setReason(''); setActionType('refund'); setReplacementProductId(''); }}>Reset</Button>
                <Button onClick={submit} loading={submitting} disabled={submitting || totalReturnQty<=0}>Submit</Button>
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              {success && <div className="text-sm text-success">{success}</div>}
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-heading font-semibold text-sm mb-2">Summary</h4>
                <div className="text-sm text-muted-foreground">Total items to return: <span className="font-medium text-foreground">{totalReturnQty}</span></div>
                <div className="text-xs text-muted-foreground mt-2">Submission will require backend returns endpoint and DB table (return_and_replacement) to be available.</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-heading font-semibold text-sm mb-2">Tips</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Select the original sale to validate quantities.</li>
                  <li>Refund reduces revenue; Replacement adds stock back for returned item and removes stock for replacement.</li>
                  <li>Document the reason for audit.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProcessReturn;
