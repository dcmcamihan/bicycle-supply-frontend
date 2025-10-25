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

  // History state
  const [history, setHistory] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // code -> description
  const [histStatus, setHistStatus] = useState(''); // '', PEND, APPR, POST
  const [histQuery, setHistQuery] = useState(''); // return_id or sale_detail_id
  const [histStart, setHistStart] = useState(''); // yyyy-mm-dd
  const [histEnd, setHistEnd] = useState('');
  const [histPage, setHistPage] = useState(1);
  const pageSize = 10;

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
      try {
        // Load RETURN and SLRTSTAT (Sales Return Status) references
        const [resReturn, resSlrt] = await Promise.all([
          fetch(API_ENDPOINTS.STATUSES_BY_REFERENCE('RETURN')),
          fetch(API_ENDPOINTS.STATUSES_BY_REFERENCE('SLRTSTAT'))
        ]);
        const dataReturn = resReturn.ok ? await resReturn.json() : [];
        const dataSlrt = resSlrt.ok ? await resSlrt.json() : [];
        const map = {};
        for (const s of [...dataReturn, ...dataSlrt]) { map[String(s.status_code)] = s.description || s.status_code; }
        setStatusMap(map);
      } catch {}
      try {
        const rRes = await fetch(API_ENDPOINTS.RETURN_AND_REPLACEMENTS);
        const rData = rRes.ok ? await rRes.json() : [];
        const rows = Array.isArray(rData) ? rData : [];
        setHistory(rows);
        // Resolve any unknown status codes by querying /status/:id
        const unknown = new Set();
        for (const r of rows) {
          const code = String(r.return_status);
          if (!code) continue;
          if (!statusMap[code]) unknown.add(code);
        }
        if (unknown.size > 0) {
          const entries = Array.from(unknown);
          const fetched = await Promise.all(entries.map(async (code) => {
            try {
              const res = await fetch(`${API_ENDPOINTS.STATUSES}/${code}`);
              if (res.ok) {
                const s = await res.json();
                return [code, s?.description || code];
              }
            } catch {}
            return [code, code];
          }));
          setStatusMap(prev => {
            const next = { ...prev };
            for (const [code, desc] of fetched) next[String(code)] = desc;
            return next;
          });
        }
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
          return_status: '2001',
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
      // Refresh history after successful submission
      try {
        const rRes = await fetch(API_ENDPOINTS.RETURN_AND_REPLACEMENTS);
        const rData = rRes.ok ? await rRes.json() : [];
        const rows = Array.isArray(rData) ? rData : [];
        setHistory(rows);
        setHistPage(1);
        // Resolve any unknown status codes
        const unknown = new Set();
        for (const r of rows) {
          const code = String(r.return_status || '');
          if (!code) continue;
          if (!statusMap[code]) unknown.add(code);
        }
        if (unknown.size > 0) {
          const entries = Array.from(unknown);
          const fetched = await Promise.all(entries.map(async (code) => {
            try {
              const res = await fetch(`${API_ENDPOINTS.STATUSES}/${code}`);
              if (res.ok) { const s = await res.json(); return [code, s?.description || '']; }
            } catch {}
            return [code, ''];
          }));
          setStatusMap(prev => {
            const next = { ...prev };
            for (const [code, desc] of fetched) next[String(code)] = desc;
            return next;
          });
        }
      } catch {}
    } catch (e1) {
      setError(e1?.message || 'Failed to process return');
    } finally { setSubmitting(false); }
  };

  // Derived: filter + paginate history
  const filteredHistory = useMemo(() => {
    let rows = history;
    if (histStatus) rows = rows.filter(r => String(r.return_status) === histStatus);
    if (histQuery) {
      const q = histQuery.toLowerCase();
      rows = rows.filter(r => String(r.return_id||'').includes(q) || String(r.sale_detail_id||'').includes(q));
    }
    if (histStart) {
      const s = new Date(histStart);
      rows = rows.filter(r => r.transaction_date && new Date(r.transaction_date) >= s);
    }
    if (histEnd) {
      const e = new Date(histEnd);
      // include end day
      e.setHours(23,59,59,999);
      rows = rows.filter(r => r.transaction_date && new Date(r.transaction_date) <= e);
    }
    return rows.sort((a,b)=> new Date(b.transaction_date||0)-new Date(a.transaction_date||0));
  }, [history, histStatus, histQuery, histStart, histEnd]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const pagedHistory = useMemo(() => {
    const start = (histPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, histPage]);

  // Build dynamic status options from history + status map
  const historyStatusOptions = useMemo(() => {
    const codes = Array.from(new Set((history || []).map(r => String(r.return_status)).filter(Boolean)));
    const opts = codes.map(code => ({ value: code, label: statusMap[String(code)] || 'Unknown' }));
    return [{ value: '', label: 'All' }, ...opts];
  }, [history, statusMap]);

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-5xl">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl mb-2">Process Return</h1>
          <p className="font-body text-muted-foreground mb-6">Handle customer returns and replacements.</p>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                <h4 className="font-heading font-semibold text-sm mb-3">Return / Refund History</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 items-end flex-wrap">
                      <Select
                        label="Status"
                        value={histStatus}
                        onChange={setHistStatus}
                        options={[
                          { value: '', label: 'All' },
                          { value: 'PEND', label: 'Pending' },
                          { value: 'APPR', label: 'Approved' },
                          { value: 'POST', label: 'Posted' },
                        ]}
                        className="w-36"
                      />
                      <Input label="Start" type="date" value={histStart} onChange={(e)=>{ setHistStart(e.target.value); setHistPage(1); }} />
                      <Input label="End" type="date" value={histEnd} onChange={(e)=>{ setHistEnd(e.target.value); setHistPage(1); }} />
                      <Input label="Search (ID or Sale Detail)" value={histQuery} onChange={(e)=>{ setHistQuery(e.target.value); setHistPage(1); }} className="min-w-[180px]" />
                      <Button variant="ghost" onClick={()=>{ setHistStatus(''); setHistStart(''); setHistEnd(''); setHistQuery(''); setHistPage(1); }}>Clear</Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left px-3 py-2">Return ID</th>
                          <th className="text-left px-3 py-2">Date</th>
                          <th className="text-left px-3 py-2">Status</th>
                          <th className="text-left px-3 py-2">Sale Detail ID</th>
                          <th className="text-left px-3 py-2">Qty</th>
                          <th className="text-left px-3 py-2">Replacement Product</th>
                          <th className="text-left px-3 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pagedHistory.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No history found.</td>
                          </tr>
                        )}
                        {pagedHistory.map(r => (
                          <tr key={r.return_id} className="hover:bg-muted/40">
                            <td className="px-3 py-2 font-data">{r.return_id}</td>
                            <td className="px-3 py-2">{r.transaction_date ? new Date(r.transaction_date).toLocaleString() : ''}</td>
                            <td className="px-3 py-2">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">{statusMap[String(r.return_status)] || 'Unknown'}</span>
                            </td>
                            <td className="px-3 py-2">{r.sale_detail_id}</td>
                            <td className="px-3 py-2">{r.quantity}</td>
                            <td className="px-3 py-2">{r.replacement_product_id || '-'}</td>
                            <td className="px-3 py-2 truncate max-w-[220px]" title={r.remarks || ''}>{r.remarks || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">Page {histPage} of {totalPages}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=> setHistPage(p=> Math.max(1, p-1))} disabled={histPage<=1}>Previous</Button>
                      <Button variant="outline" size="sm" onClick={()=> setHistPage(p=> Math.min(totalPages, p+1))} disabled={histPage>=totalPages}>Next</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProcessReturn;
