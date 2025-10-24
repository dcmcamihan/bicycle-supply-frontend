import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

import Button from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../config/api';

const SalesChart = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week'); // 'day' | 'week' | 'month'
  const [sales, setSales] = useState([]); // raw sales
  const [loading, setLoading] = useState(false);

  // Theme palette for bars (uses project CSS variables)
  const BAR_COLORS = useMemo(() => [
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-destructive)'
  ], []);

  // Fetch sales and, if total_amount is missing, compute from sale details using product prices
  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.SALES);
        if (!res.ok) throw new Error('Failed to fetch sales');
        const salesList = await res.json();

        // Build product price map to compute totals when unit_price is not returned in sale details
        let priceMap = new Map();
        try {
          const prodRes = await fetch(API_ENDPOINTS.PRODUCTS);
          if (prodRes.ok) {
            const prods = await prodRes.json();
            for (const p of prods) {
              priceMap.set(Number(p.product_id || p.id), Number(p.price || 0));
            }
          }
        } catch {}

        // Normalize: ensure sale_date and total_amount
        const enriched = [];
        for (const s of salesList) {
          const saleId = s?.sale_id || s?.id;
          const saleDate = s?.sale_date || s?.date || s?.created_at;
          let total = Number(s?.total_amount ?? 0);
          if (!total) {
            try {
              const dRes = await fetch(API_ENDPOINTS.SALE_DETAILS(saleId));
              if (dRes.ok) {
                const dets = await dRes.json();
                total = dets.reduce((sum, d) => {
                  const pid = Number(d.product_id);
                  const qty = Number(d.quantity_sold ?? d.quantity ?? 0);
                  const price = priceMap.get(pid) || 0;
                  return sum + (price * qty);
                }, 0);
              }
            } catch {}
          }
          enriched.push({ sale_id: saleId, sale_date: saleDate, total_amount: total });
        }
        setSales(enriched);
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  // Build day (hourly), weekly and monthly aggregates from sales
  const { dayData, weeklyData, monthlyData } = useMemo(() => {
    // Helpers
    const formatDay = (d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    const startOfWeek = (d) => { const x = new Date(d); const day = x.getDay(); const diff = x.getDate() - day; return new Date(x.setDate(diff)); };
    const weekKey = (d) => {
      const sow = startOfWeek(d); sow.setHours(0,0,0,0);
      const month = sow.getMonth() + 1; const day = sow.getDate();
      return `${sow.getFullYear()}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    };
    const hourLabel = (h) => `${h.toString().padStart(2,'0')}:00`;

    // Day (today by hour 0..23)
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0,0,0,0);
    const endToday = new Date(now); endToday.setHours(23,59,59,999);
    const hourTotalsToday = new Array(24).fill(0);
    const hourOrdersToday = new Array(24).fill(0);
    for (const s of sales) {
      const d = new Date(s.sale_date);
      if (isNaN(d)) continue;
      if (d >= startToday && d <= endToday) {
        const h = d.getHours();
        hourTotalsToday[h] += Number(s.total_amount || 0);
        hourOrdersToday[h] += 1;
      }
    }
    const dayData = hourTotalsToday.map((amt, h) => ({ name: hourLabel(h), sales: amt, orders: hourOrdersToday[h] }));

    // Last 7 days by day label
    const dayTotals = new Map();
    const dayOrders = new Map();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (6 - i)); d.setHours(0,0,0,0); return d;
    });
    for (const s of sales) {
      const d = new Date(s.sale_date);
      if (isNaN(d)) continue;
      // Only include last 7 days
      if (d >= last7[0] && d <= now) {
        const key = d.toDateString();
        dayTotals.set(key, (dayTotals.get(key) || 0) + Number(s.total_amount || 0));
        dayOrders.set(key, (dayOrders.get(key) || 0) + 1);
      }
    }
    const weekly = last7.map(d => {
      const key = d.toDateString();
      return { name: formatDay(d), sales: dayTotals.get(key) || 0, orders: dayOrders.get(key) || 0 };
    });

    // Last 4 weeks by week start
    const weekTotals = new Map();
    const weekOrders = new Map();
    for (const s of sales) {
      const d = new Date(s.sale_date);
      if (isNaN(d)) continue;
      const key = weekKey(d);
      weekTotals.set(key, (weekTotals.get(key) || 0) + Number(s.total_amount || 0));
      weekOrders.set(key, (weekOrders.get(key) || 0) + 1);
    }
    // Sort week keys asc, take last 4 (most recent)
    let sortedWeeks = Array.from(weekTotals.keys()).sort((a,b) => new Date(a) - new Date(b)).slice(-4);
    // If no sales at all, fabricate the last 4 week buckets relative to now
    if (sortedWeeks.length === 0) {
      const now = new Date();
      const starts = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - (i * 7));
        const k = weekKey(d);
        starts.push(k);
      }
      sortedWeeks = starts;
    }
    const monthly = sortedWeeks.map((wk, idx) => ({ name: `Week ${idx+1}`, sales: weekTotals.get(wk) || 0, orders: weekOrders.get(wk) || 0 }));

    return { dayData, weeklyData: weekly, monthlyData: monthly };
  }, [sales]);

  const currentData = (
    timeRange === 'day' ? dayData :
    timeRange === 'week' ? weeklyData : monthlyData
  );
  const hasAnyData = Array.isArray(currentData) && currentData.some(d => (Number(d.sales) || 0) > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-raised backdrop-glass">
          <p className="font-body font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              ></div>
              <span className="font-caption text-sm text-muted-foreground">
                {entry?.dataKey === 'sales' ? 'Sales: ₱' : 'Orders: '}
                {entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Sales Performance</h3>
          <p className="font-caption text-sm text-muted-foreground">Track your daily and weekly sales trends</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={timeRange === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('day')}
              className="px-3 py-1"
            >
              Day
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('week')}
              className="px-3 py-1"
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('month')}
              className="px-3 py-1"
            >
              Month
            </Button>
          </div>
          
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
              iconName={chartType === 'bar' ? 'LineChart' : 'BarChart3'}
              iconSize={16}
            >
              <span className="sr-only">Toggle chart type</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full h-80" aria-label="Sales Performance Chart">
        {(!hasAnyData && !loading) ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
            No sales data available for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="var(--font-caption)"
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="var(--font-caption)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {currentData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="var(--font-caption)"
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="var(--font-caption)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      {loading && (
        <p className="mt-2 text-xs text-muted-foreground">Loading sales data...</p>
      )}
    </div>
  );
};

export default SalesChart;