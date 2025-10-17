import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentTransactions = () => {
  const [showAll, setShowAll] = useState(false);

  const transactions = [
    {
      id: "TXN-2023-001",
      customer: "Sarah Johnson",
      items: "Trek Mountain Bike, Helmet",
      amount: 1299.99,
      paymentMethod: "Credit Card",
      timestamp: new Date(Date.now() - 300000),
      status: "completed"
    },
    {
      id: "TXN-2023-002",
      customer: "Mike Chen",
      items: "Road Bike Accessories",
      amount: 89.50,
      paymentMethod: "Cash",
      timestamp: new Date(Date.now() - 900000),
      status: "completed"
    },
    {
      id: "TXN-2023-003",
      customer: "Emily Davis",
      items: "Bike Repair Service",
      amount: 45.00,
      paymentMethod: "Digital Payment",
      timestamp: new Date(Date.now() - 1800000),
      status: "pending"
    },
    {
      id: "TXN-2023-004",
      customer: "John Smith",
      items: "Electric Bike, Lock",
      amount: 2199.99,
      paymentMethod: "Credit Card",
      timestamp: new Date(Date.now() - 3600000),
      status: "completed"
    },
    {
      id: "TXN-2023-005",
      customer: "Lisa Wang",
      items: "Kids Bike, Training Wheels",
      amount: 189.99,
      paymentMethod: "Debit Card",
      timestamp: new Date(Date.now() - 7200000),
      status: "completed"
    }
  ];

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
          onClick={() => console.log('View all transactions')}
        >
          View All
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