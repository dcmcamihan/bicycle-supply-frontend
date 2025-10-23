import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../../../config/api';

const ActivityFeed = () => {
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
        const productNameCache = new Map();
        const getProductName = async (pid) => {
          const k = Number(pid);
          if (productNameCache.has(k)) return productNameCache.get(k);
          try {
            const r = await fetch(API_ENDPOINTS.PRODUCT(k));
            if (r.ok) {
              const p = await r.json();
              const name = p.product_name || `#${k}`;
              productNameCache.set(k, name);
              return name;
            }
          } catch {}
          return `#${k}`;
        };

        const out = [];

        try {
          const salesRes = await fetch(API_ENDPOINTS.SALES);
          if (salesRes.ok) {
            const sales = await salesRes.json();
            for (const sale of sales) {
              const saleId = sale?.sale_id || sale?.id;
              const ts = sale?.sale_date || sale?.date || sale?.created_at;
              let total = Number(sale?.total_amount ?? 0);
              try {
                const detRes = await fetch(API_ENDPOINTS.SALE_DETAILS(saleId));
                if (detRes.ok) {
                  const details = await detRes.json();
                  let names = [];
                  if (!total) {
                    for (const d of details) {
                      const nm = await getProductName(d.product_id);
                      names.push(nm);
                      const unit = Number(d?.unit_price ?? 0);
                      const qty = Number(d?.quantity_sold ?? d?.quantity ?? 0);
                      total += unit * qty;
                    }
                  } else {
                    for (const d of details) {
                      const nm = await getProductName(d.product_id);
                      names.push(nm);
                    }
                  }
                  out.push({
                    id: `sale-${saleId}`,
                    type: 'sale',
                    title: 'Sale completed',
                    description: names.slice(0, 3).join(', '),
                    amount: currency.format(total),
                    timestamp: new Date(ts),
                    user: sale?.cashier_name || 'POS',
                    icon: 'ShoppingCart',
                    color: 'text-success bg-success/10'
                  });
                }
              } catch {}
            }
          }
        } catch {}

        try {
          const sRes = await fetch(API_ENDPOINTS.SUPPLIES);
          if (sRes.ok) {
            const supplies = await sRes.json();
            for (const sup of supplies) {
              const supId = sup?.supply_id || sup?.id;
              const ts = sup?.supply_date || sup?.date || sup?.created_at;
              try {
                const sdRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(supId));
                if (sdRes.ok) {
                  const sds = await sdRes.json();
                  let names = [];
                  let qty = 0;
                  for (const d of sds) {
                    const nm = await getProductName(d.product_id);
                    names.push(nm);
                    qty += Number(d?.quantity_supplied ?? d?.quantity ?? 0);
                  }
                  out.push({
                    id: `supply-${supId}`,
                    type: 'inventory',
                    title: 'Stock received',
                    description: `${names.slice(0, 3).join(', ')} (+${qty})`,
                    timestamp: new Date(ts),
                    user: sup?.supplier_name || 'Supplier',
                    icon: 'Package',
                    color: 'text-primary bg-primary/10'
                  });
                }
              } catch {}
            }
          }
        } catch {}

        try {
          const soRes = await fetch(API_ENDPOINTS.STOCKOUTS);
          if (soRes.ok) {
            const stockouts = await soRes.json();
            for (const so of stockouts) {
              const soId = so?.stockout_id || so?.id;
              const ts = so?.stockout_date || so?.date || so?.created_at;
              const pid = Number(so?.product_id);
              const removed = Number(so?.quantity_removed ?? 0);
              if (pid && removed) {
                const nm = await getProductName(pid);
                out.push({
                  id: `stockout-${soId}`,
                  type: 'inventory',
                  title: 'Inventory adjustment',
                  description: `${nm} (-${Math.abs(removed)})`,
                  timestamp: new Date(ts),
                  user: so?.manager_name || 'Manager',
                  icon: 'Edit',
                  color: 'text-warning bg-warning/10'
                });
                continue;
              }
              try {
                if (API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT) {
                  const detRes = await fetch(API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT(soId));
                  if (detRes.ok) {
                    const dets = await detRes.json();
                    for (const d of dets) {
                      const nm = await getProductName(d.product_id);
                      out.push({
                        id: `stockout-${soId}-${d.product_id}`,
                        type: 'inventory',
                        title: 'Inventory adjustment',
                        description: `${nm} (-${Math.abs(Number(d?.quantity_removed ?? d?.quantity ?? 0))})`,
                        timestamp: new Date(ts),
                        user: so?.manager_name || 'Manager',
                        icon: 'Edit',
                        color: 'text-warning bg-warning/10'
                      });
                    }
                  }
                }
              } catch {}
            }
          }
        } catch {}

        out.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(out.slice(0, 25));
      } catch {
        setActivities([]);
      }
    };
    load();
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'sale', label: 'Sales', icon: 'ShoppingCart' },
    { value: 'inventory', label: 'Inventory', icon: 'Package' }
  ];

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities?.filter(a => a?.type === filter);
  }, [activities, filter]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return timestamp?.toLocaleDateString();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Filter"
          iconPosition="left"
          onClick={() => console.log('Open filter options')}
        >
          Filter
        </Button>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setFilter(option?.value)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-body text-sm transition-smooth ${
              filter === option?.value
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={option?.icon} size={14} />
            <span className="hidden sm:inline">{option?.label}</span>
          </button>
        ))}
      </div>
      {/* Activity List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities?.map((activity) => (
          <div
            key={activity?.id}
            className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-smooth"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity?.color}`}>
              <Icon name={activity?.icon} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-body font-medium text-foreground">
                  {activity?.title}
                </h4>
                {activity?.amount && (
                  <span className={`font-data text-sm font-semibold ${
                    activity?.amount?.startsWith('-') ? 'text-destructive' : 'text-success'
                  }`}>
                    {activity?.amount}
                  </span>
                )}
              </div>
              
              <p className="font-caption text-sm text-muted-foreground mb-2">
                {activity?.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="font-caption text-xs text-muted-foreground">
                  by {activity?.user}
                </span>
                <span className="font-caption text-xs text-muted-foreground">
                  {formatTime(activity?.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredActivities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-muted-foreground mb-2">No activities found</p>
          <p className="font-caption text-sm text-muted-foreground">
            Try adjusting your filter settings
          </p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          fullWidth
          iconName="ExternalLink"
          iconPosition="right"
          onClick={() => navigate('/sales-reports')}
        >
          View Full Activity Log
        </Button>
      </div>
    </div>
  );
};

export default ActivityFeed;