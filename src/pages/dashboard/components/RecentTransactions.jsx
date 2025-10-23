import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../config/api';

const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return await res.json();
  };

  const getSaleDetailsAndAmount = async (saleId) => {
    const details = await fetchJson(API_ENDPOINTS.SALE_DETAILS(saleId));
    let totalAmount = 0;
    const itemNames = [];
    for (const d of details) {
      const prod = await fetchJson(API_ENDPOINTS.PRODUCT(d.product_id));
      const price = parseFloat(prod.price) || 0;
      totalAmount += price * (d.quantity_sold || 0);
      itemNames.push(prod.product_name);
    }
    return { totalAmount, itemsLabel: itemNames.join(', ') };
  };

  const getCustomerName = async (customerId) => {
    if (!customerId) return 'Walk-in Customer';
    try {
      const data = await fetchJson(API_ENDPOINTS.CUSTOMER(customerId));
      return `${data.first_name} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name}`;
    } catch {
      return `Customer #${customerId}`;
    }
  };

  const getPaymentMethod = async (saleId) => {
    try {
      const payData = await fetchJson(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(saleId));
      let code = '';
      if (Array.isArray(payData) && payData.length > 0) code = payData[0].payment_method_code || '';
      else if (payData.payment_method_code) code = payData.payment_method_code;
      if (!code) return '';
      try {
        const method = await fetchJson(API_ENDPOINTS.PAYMENT_METHOD(code));
        return method.name || code;
      } catch {
        return code;
      }
    } catch { return ''; }
  };

  const loadRecent = async () => {
    setLoading(true);
    try {
      const sales = await fetchJson(API_ENDPOINTS.SALES);
      // Sort by sale_date desc
      sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
      const top = sales.slice(0, 5);
      const mapped = await Promise.all(top.map(async s => {
        const [custName, pm, amt] = await Promise.all([
          getCustomerName(s.customer_id),
          getPaymentMethod(s.sale_id),
          getSaleDetailsAndAmount(s.sale_id)
        ]);
        return {
          id: s.sale_id,
          customer: custName,
          items: amt.itemsLabel,
          amount: amt.totalAmount,
          paymentMethod: pm || 'Payment',
          timestamp: new Date(s.sale_date),
          status: 'completed'
        };
      }));
      setTransactions(mapped);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecent(); }, []);

  const displayedTransactions = showAll ? transactions : transactions?.slice(0, 3);

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Credit Card': case'Debit Card':
        return 'CreditCard';
      case 'Cash':
        return 'Banknote';
      case 'Digital Payment':
        return 'Smartphone';
      default:
        return 'DollarSign';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

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
          <Icon name="Clock" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="ExternalLink"
          iconPosition="right"
          onClick={loadRecent}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      <div className="space-y-4">
        {displayedTransactions?.map((transaction) => (
          <div
            key={transaction?.id}
            className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-smooth"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name={getPaymentIcon(transaction?.paymentMethod)} size={16} className="text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-body font-medium text-foreground truncate">
                  {transaction?.customer}
                </h4>
                <span className="font-data text-sm font-semibold text-foreground">
                  ₱{transaction?.amount?.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="font-caption text-xs text-muted-foreground truncate">
                  {transaction?.items}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`font-caption text-xs capitalize ${getStatusColor(transaction?.status)}`}>
                    {transaction?.status}
                  </span>
                  <span className="font-caption text-xs text-muted-foreground">
                    {formatTime(transaction?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {transactions?.length > 3 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setShowAll(!showAll)}
            iconName={showAll ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {showAll ? 'Show Less' : `Show ${transactions?.length - 3} More`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;