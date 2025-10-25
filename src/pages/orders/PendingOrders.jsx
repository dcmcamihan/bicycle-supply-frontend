import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import API_ENDPOINTS from '../../config/api';
import { useToast } from '../../components/ui/Toast';

const PendingOrders = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const url = `${API_ENDPOINTS.SALES}?status=Pending`;
        const res = await fetch(url);
        if (!res.ok) {
          const t = await res.text(); throw new Error(t || 'Failed to load pending orders');
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setOrders(list || []);
      } catch (e) {
        setError(e?.message || 'Failed to load pending orders');
        setOrders([]);
        try { toast?.error && toast.error(e?.message || 'Failed to load pending orders'); } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return (orders || []).filter(o => String(o.sale_id).includes(q) || (o.sale_date && String(o.sale_date).toLowerCase().includes(q)));
  }, [orders, query]);

  const complete = async (id) => {
    try {
      setError('');
      const res = await fetch(`${API_ENDPOINTS.SALES}/${id}/complete`, { method: 'POST' });
      if (!res.ok) {
        const t = await res.text(); throw new Error(t || 'Failed to complete order');
      }
      setRefreshKey(k => k + 1);
      try { toast?.success && toast.success('Order marked as Completed'); } catch {}
    } catch (e) {
      setError(e?.message || 'Failed to complete order');
      try { toast?.error && toast.error(e?.message || 'Failed to complete order'); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-6xl mx-auto">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl mb-2">Pending Orders</h1>
          <p className="font-body text-muted-foreground mb-6">Review and complete pending sales orders.</p>

          <div className="bg-card border border-border rounded-lg p-4 mb-4 flex items-end gap-4">
            <Input label="Search by ID or Date" value={query} onChange={e=>setQuery(e.target.value)} />
            <Button variant="outline" onClick={()=>setRefreshKey(k=>k+1)} iconName="RefreshCw" iconPosition="left">Refresh</Button>
          </div>

          {error && <div className="text-sm text-destructive mb-3">{error}</div>}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto bg-card border border-border rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 px-3">Sale ID</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Cashier</th>
                    <th className="py-2 px-3">Manager</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).length === 0 ? (
                    <tr><td className="py-4 px-3 text-muted-foreground" colSpan={5}>No pending orders found.</td></tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.sale_id} className="border-t border-border">
                        <td className="py-2 px-3 font-medium">#{o.sale_id}</td>
                        <td className="py-2 px-3">{o.sale_date ? new Date(o.sale_date).toLocaleString() : '-'}</td>
                        <td className="py-2 px-3">{o.cashier ?? '-'}</td>
                        <td className="py-2 px-3">{o.manager ?? '-'}</td>
                        <td className="py-2 px-3 text-right">
                          <Button size="sm" onClick={()=>complete(o.sale_id)} iconName="Check" iconPosition="left">Complete</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingOrders;
