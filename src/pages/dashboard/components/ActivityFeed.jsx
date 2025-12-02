import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../../../config/api';

const ActivityFeed = () => {
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadActivities = async () => {
    setLoading(true);
    try {
      const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
      const out = [];

      // Fetch all data in parallel
      const [salesRes, suppliesRes, stockoutsRes, productsRes] = await Promise.all([
        fetch(API_ENDPOINTS.SALES),
        fetch(API_ENDPOINTS.SUPPLIES),
        fetch(API_ENDPOINTS.STOCKOUTS),
        fetch(API_ENDPOINTS.PRODUCTS)
      ]);

      // Build product price map
      const priceMap = new Map();
      if (productsRes.ok) {
        const products = await productsRes.json();
        const productArray = Array.isArray(products) ? products : (products?.data || []);
        for (const p of productArray) {
          priceMap.set(Number(p.product_id || p.id), Number(p.price || p.unit_price || 0));
        }
      }

      // Process sales with parallel detail fetching
      if (salesRes.ok) {
        const sales = await salesRes.json();
        const saleDetailsPromises = sales.slice(0, 50).map(sale => ({
          sale,
          detailsPromise: fetch(API_ENDPOINTS.SALE_DETAILS(sale?.sale_id || sale?.id))
        }));

        for (const { sale, detailsPromise } of saleDetailsPromises) {
          try {
            const detRes = await detailsPromise;
            if (detRes.ok) {
              const details = await detRes.json();
              let names = [];
              let calculatedTotal = 0;

              // Calculate total from details using product price map
              for (const d of details) {
                const productName = d?.product_name || `Product #${d?.product_id}`;
                names.push(productName);
                
                const pid = Number(d?.product_id);
                const price = d?.unit_price !== undefined && d?.unit_price !== null ? Number(d?.unit_price) : (priceMap.get(pid) || 0);
                const qty = Number(d?.quantity_sold ?? d?.quantity ?? 0);
                calculatedTotal += price * qty;
              }

              // Only add if there's a valid total
              if (calculatedTotal > 0 || names.length > 0) {
                out.push({
                  id: `sale-${sale?.sale_id || sale?.id}`,
                  type: 'sale',
                  title: 'Sale completed',
                  description: names.slice(0, 3).join(', '),
                  amount: currency.format(calculatedTotal),
                  timestamp: new Date(sale?.sale_date || sale?.date || sale?.created_at),
                  user: sale?.cashier_name || 'POS',
                  icon: 'ShoppingCart',
                  color: 'text-success bg-success/10'
                });
              }
            }
          } catch {}
        }
      }

      // Process supplies with parallel detail fetching
      if (suppliesRes.ok) {
        const supplies = await suppliesRes.json();
        const supplyDetailsPromises = supplies.slice(0, 30).map(sup => ({
          sup,
          detailsPromise: fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(sup?.supply_id || sup?.id))
        }));

        for (const { sup, detailsPromise } of supplyDetailsPromises) {
          try {
            const sdRes = await detailsPromise;
            if (sdRes.ok) {
              const sds = await sdRes.json();
              let names = [];
              let qty = 0;
              for (const d of sds) {
                names.push(d?.product_name || `Product #${d?.product_id}`);
                qty += Number(d?.quantity_supplied ?? d?.quantity ?? 0);
              }
              out.push({
                id: `supply-${sup?.supply_id || sup?.id}`,
                type: 'inventory',
                title: 'Stock received',
                description: `${names.slice(0, 3).join(', ')} (+${qty})`,
                timestamp: new Date(sup?.supply_date || sup?.date || sup?.created_at),
                user: sup?.supplier_name || 'Supplier',
                icon: 'Package',
                color: 'text-primary bg-primary/10'
              });
            }
          } catch {}
        }
      }

      // Process stockouts with parallel detail fetching
      if (stockoutsRes.ok) {
        const stockouts = await stockoutsRes.json();
        const stockoutDetailsPromises = stockouts.slice(0, 30).map(so => ({
          so,
          detailsPromise: API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT ? 
            fetch(API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT(so?.stockout_id || so?.id)) : 
            Promise.resolve(null)
        }));

        for (const { so, detailsPromise } of stockoutDetailsPromises) {
          const soId = so?.stockout_id || so?.id;
          const ts = so?.stockout_date || so?.date || so?.created_at;
          const productName = so?.product_name || `Product #${so?.product_id}`;
          
          try {
            const detRes = await detailsPromise;
            if (detRes && detRes.ok) {
              const dets = await detRes.json();
              for (const d of dets) {
                const removed = Number(d?.quantity_removed ?? d?.quantity ?? 0);
                out.push({
                  id: `stockout-${soId}-${d.product_id}`,
                  type: 'inventory',
                  title: 'Inventory adjustment',
                  description: `${d?.product_name || `Product #${d?.product_id}`} (-${Math.abs(removed)})`,
                  timestamp: new Date(ts),
                  user: so?.manager_name || 'Manager',
                  icon: 'Edit',
                  color: 'text-warning bg-warning/10'
                });
              }
            } else {
              const removed = Number(so?.quantity_removed ?? 0);
              if (removed) {
                out.push({
                  id: `stockout-${soId}`,
                  type: 'inventory',
                  title: 'Inventory adjustment',
                  description: `${productName} (-${Math.abs(removed)})`,
                  timestamp: new Date(ts),
                  user: so?.manager_name || 'Manager',
                  icon: 'Edit',
                  color: 'text-warning bg-warning/10'
                });
              }
            }
          } catch {}
        }
      }

      // Sort and limit to 25 most recent
      out.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(out.slice(0, 25));
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
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
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
          iconPosition="left"
          onClick={loadActivities}
          disabled={loading}
          className="text-xs sm:text-sm whitespace-nowrap"
        >
          <span className="hidden sm:inline">Refresh</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 sm:mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setFilter(option?.value)}
            className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-md font-body text-xs sm:text-sm transition-smooth whitespace-nowrap flex-shrink-0 ${
              filter === option?.value
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={option?.icon} size={12} />
            <span className="hidden sm:inline">{option?.label}</span>
          </button>
        ))}
      </div>
      {/* Activity List */}
      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary mb-2" />
            <p className="font-body text-sm text-muted-foreground">Loading activities...</p>
          </div>
        ) : filteredActivities?.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Icon name="Inbox" size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground mb-2 text-sm">No activities found</p>
            <p className="font-caption text-xs sm:text-sm text-muted-foreground">
              Try adjusting your filter settings
            </p>
          </div>
        ) : (
          filteredActivities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex gap-3 p-2 sm:p-3 hover:bg-muted/50 rounded-lg transition-smooth min-w-0"
            >
              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity?.color}`}>
                <Icon name={activity?.icon} size={14} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                  <h4 className="font-body font-medium text-foreground text-sm truncate">
                    {activity?.title}
                  </h4>
                  {activity?.amount && (
                    <span className={`font-data text-xs sm:text-sm font-semibold flex-shrink-0 ${
                      activity?.amount?.startsWith('-') ? 'text-destructive' : 'text-success'
                    }`}>
                      {activity?.amount}
                    </span>
                  )}
                </div>
                
                <p className="font-caption text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                  {activity?.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                  <span className="font-caption text-muted-foreground truncate">
                    by {activity?.user}
                  </span>
                  <span className="font-caption text-muted-foreground">
                    {formatTime(activity?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <Button
          variant="ghost"
          fullWidth
          iconName="ExternalLink"
          iconPosition="right"
          onClick={() => navigate('/sales-reports')}
          className="text-xs sm:text-sm"
        >
          View Full Activity Log
        </Button>
      </div>
    </div>
  );
};

export default ActivityFeed;