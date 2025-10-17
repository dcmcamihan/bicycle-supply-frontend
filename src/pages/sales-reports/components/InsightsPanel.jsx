import React from 'react';
import Icon from '../../../components/AppIcon';

const InsightsPanel = ({ insights }) => {
  const defaultInsights = insights || {
    topProducts: [
      { name: 'Trek Mountain Bike X1', sales: 45, revenue: 22500, trend: 'up' },
      { name: 'Specialized Road Bike', sales: 32, revenue: 19200, trend: 'up' },
      { name: 'Electric Commuter Bike', sales: 28, revenue: 16800, trend: 'down' },
      { name: 'Bike Helmet Pro', sales: 156, revenue: 7800, trend: 'up' },
      { name: 'Cycling Gloves', sales: 89, revenue: 2670, trend: 'stable' }
    ],
    paymentMethods: [
      { method: 'Credit Card', percentage: 45.2, amount: 58500 },
      { method: 'Debit Card', percentage: 28.7, amount: 37100 },
      { method: 'Cash', percentage: 18.3, amount: 23700 },
      { method: 'Digital Wallet', percentage: 7.8, amount: 10100 }
    ],
    staffPerformance: [
      { name: 'Mike Johnson', sales: 28, revenue: 34500, avgOrder: 1232 },
      { name: 'Lisa Chen', sales: 24, revenue: 29800, avgOrder: 1242 },
      { name: 'Tom Rodriguez', sales: 19, revenue: 22100, avgOrder: 1163 },
      { name: 'Sarah Kim', sales: 15, revenue: 18900, avgOrder: 1260 }
    ],
    peakHours: [
      { hour: '10:00 AM', transactions: 12, revenue: 8900 },
      { hour: '2:00 PM', transactions: 18, revenue: 12400 },
      { hour: '4:00 PM', transactions: 22, revenue: 15600 },
      { hour: '6:00 PM', transactions: 15, revenue: 9800 }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return { icon: 'TrendingUp', color: 'text-success' };
      case 'down':
        return { icon: 'TrendingDown', color: 'text-destructive' };
      default:
        return { icon: 'Minus', color: 'text-muted-foreground' };
    }
  };

  const InsightCard = ({ title, children, icon }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name={icon} size={18} className="text-primary" />
        <h3 className="font-body font-semibold text-sm text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Products */}
      <InsightCard title="Best Sellers" icon="Star">
        <div className="space-y-3">
          {defaultInsights?.topProducts?.map((product, index) => {
            const trendData = getTrendIcon(product?.trend);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground truncate">
                    {product?.name}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    {product?.sales} units sold
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-body text-sm font-bold text-foreground">
                      {formatCurrency(product?.revenue)}
                    </p>
                  </div>
                  <Icon 
                    name={trendData?.icon} 
                    size={14} 
                    className={trendData?.color}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </InsightCard>
      {/* Payment Methods */}
      <InsightCard title="Payment Distribution" icon="CreditCard">
        <div className="space-y-3">
          {defaultInsights?.paymentMethods?.map((payment, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground">
                  {payment?.method}
                </span>
                <span className="font-body text-sm font-bold text-foreground">
                  {payment?.percentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-smooth"
                  style={{ width: `${payment?.percentage}%` }}
                ></div>
              </div>
              <p className="font-caption text-xs text-muted-foreground">
                {formatCurrency(payment?.amount)} total
              </p>
            </div>
          ))}
        </div>
      </InsightCard>
      {/* Staff Performance */}
      <InsightCard title="Staff Performance" icon="Users">
        <div className="space-y-3">
          {defaultInsights?.staffPerformance?.map((staff, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={14} color="white" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">
                    {staff?.name}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    {staff?.sales} sales • Avg: {formatCurrency(staff?.avgOrder)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body text-sm font-bold text-foreground">
                  {formatCurrency(staff?.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>
      {/* Peak Hours */}
      <InsightCard title="Peak Hours" icon="Clock">
        <div className="space-y-3">
          {defaultInsights?.peakHours?.map((hour, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm font-medium text-foreground">
                  {hour?.hour}
                </p>
                <p className="font-caption text-xs text-muted-foreground">
                  {hour?.transactions} transactions
                </p>
              </div>
              <div className="text-right">
                <p className="font-body text-sm font-bold text-foreground">
                  {formatCurrency(hour?.revenue)}
                </p>
                <div className="w-16 bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-accent h-1 rounded-full transition-smooth"
                    style={{ width: `${(hour?.transactions / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>
      {/* Quick Actions */}
      <InsightCard title="Quick Actions" icon="Zap">
        <div className="space-y-2">
          <button className="w-full p-3 text-left bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} />
              <span className="font-body text-sm">Generate Custom Report</span>
            </div>
          </button>
          <button className="w-full p-3 text-left bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={16} />
              <span className="font-body text-sm">Email Daily Summary</span>
            </div>
          </button>
          <button className="w-full p-3 text-left bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} />
              <span className="font-body text-sm">Schedule Report</span>
            </div>
          </button>
        </div>
      </InsightCard>
    </div>
  );
};

export default InsightsPanel;