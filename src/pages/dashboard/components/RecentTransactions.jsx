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
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-subtle w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 min-w-0">
          <Icon name="Clock" size={20} className="text-primary flex-shrink-0" />
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground truncate">Recent Transactions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
          iconPosition="left"
          onClick={loadRecent}
          className="text-xs sm:text-sm whitespace-nowrap"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      <div className="space-y-2 sm:space-y-3 overflow-x-auto">
        {displayedTransactions?.map((transaction) => (
          <div
            key={transaction?.id}
            className="flex items-start sm:items-center gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-smooth min-w-0"
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name={getPaymentIcon(transaction?.paymentMethod)} size={14} className="text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                <h4 className="font-body font-medium text-foreground text-sm truncate">
                  {transaction?.customer}
                </h4>
                <span className="font-data text-xs sm:text-sm font-semibold text-foreground">
                  ₱{transaction?.amount?.toFixed(2)}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="font-caption text-xs text-muted-foreground line-clamp-1">
                  {transaction?.items}
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`font-caption capitalize ${getStatusColor(transaction?.status)}`}>
                    {transaction?.status}
                  </span>
                  <span className="font-caption text-muted-foreground">
                    {formatTime(transaction?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {transactions?.length > 3 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setShowAll(!showAll)}
            iconName={showAll ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            className="text-xs sm:text-sm"
          >
            {showAll ? 'Show Less' : `Show ${transactions?.length - 3} More`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;