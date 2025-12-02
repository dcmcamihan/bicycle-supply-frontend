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
  const [employeesById, setEmployeesById] = useState({}); // cache employee data by id
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
        // eagerly fetch employee names for cashier/manager fields
        try {
          const ids = Array.from(new Set((list || []).flatMap(o => [o.cashier, o.manager].filter(Boolean))));
          if (ids.length) {
            const missing = ids.filter(id => id != null && !employeesById[String(id)]);
            if (missing.length) {
              const fetched = await Promise.all(missing.map(async (eid) => {
                try {
                  const r = await fetch(API_ENDPOINTS.EMPLOYEE(eid));
                  if (!r.ok) return { id: eid, data: null };
                  const d = await r.json();
                  return { id: eid, data: d };
                } catch (err) { return { id: eid, data: null }; }
              }));
              setEmployeesById(prev => {
                const next = { ...prev };
                fetched.forEach(f => { if (f && f.id != null) next[String(f.id)] = f.data || null; });
                return next;
              });
            }
          }
        } catch (e) {
          // ignore employee lookup errors
        }
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

  // When orders change (filtering/refresh), ensure we have employee names for displayed rows
  useEffect(() => {
    const loadMissingEmployees = async () => {
      try {
        const ids = Array.from(new Set((orders || []).flatMap(o => [o.cashier, o.manager].filter(Boolean))));
        const missing = ids.filter(id => id != null && !employeesById[String(id)]);
        if (missing.length === 0) return;
        const fetched = await Promise.all(missing.map(async (eid) => {
          try {
            const r = await fetch(API_ENDPOINTS.EMPLOYEE(eid));
            if (!r.ok) return { id: eid, data: null };
            const d = await r.json();
            return { id: eid, data: d };
          } catch (err) { return { id: eid, data: null }; }
        }));
        setEmployeesById(prev => {
          const next = { ...prev };
          fetched.forEach(f => { if (f && f.id != null) next[String(f.id)] = f.data || null; });
          return next;
        });
      } catch (err) {
        // ignore
      }
    };
    loadMissingEmployees();
  }, [orders]);

  const filtered = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return (orders || []).filter(o => String(o.sale_id).includes(q) || (o.sale_date && String(o.sale_date).toLowerCase().includes(q)));
  }, [orders, query]);

  const formatEmployeeLabel = (employee, id) => {
    if (!employee) return id ? `#${id}` : '-';
    // common shape: { first_name, middle_name, last_name } or { name }
    if (employee.first_name || employee.last_name) {
      const mi = employee.middle_name?.trim()?.[0] ? `${employee.middle_name.trim()[0]}. ` : '';
      return `${employee.first_name} ${mi}${employee.last_name || ''}`.trim();
    }
    if (employee.name) return employee.name;
    // fallback to id if no name
    return id ? `#${id}` : '-';
  };

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
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl sm:text-3xl mb-2">Pending Orders</h1>
          <p className="font-body text-xs sm:text-sm text-muted-foreground mb-6">Review and complete pending sales orders.</p>

          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="w-full sm:flex-1">
              <Input label="Search by ID or Date" value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={()=>setRefreshKey(k=>k+1)} iconName="RefreshCw" iconPosition="left" size="sm">
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>

          {error && <div className="text-xs sm:text-sm text-destructive mb-3">{error}</div>}
          {loading ? (
            <div className="text-xs sm:text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto bg-card border border-border rounded-lg">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold">Sale ID</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold hidden sm:table-cell">Date</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold">Cashier</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold hidden md:table-cell">Manager</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).length === 0 ? (
                    <tr><td className="py-4 px-2 sm:px-4 text-muted-foreground" colSpan={5}>No pending orders found.</td></tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.sale_id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">#{o.sale_id}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">{o.sale_date ? new Date(o.sale_date).toLocaleString() : '-'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="font-medium text-xs sm:text-sm">{formatEmployeeLabel(employeesById[String(o.cashier)], o.cashier)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{o.cashier ? `ID: ${o.cashier}` : ''}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                          <div className="font-medium text-xs sm:text-sm">{formatEmployeeLabel(employeesById[String(o.manager)], o.manager)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{o.manager ? `ID: ${o.manager}` : ''}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                          <Button size="xs" variant="success" onClick={()=>complete(o.sale_id)} iconName="Check" iconPosition="left">
                            <span className="hidden sm:inline">Complete</span>
                            <span className="sm:hidden">Done</span>
                          </Button>
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
