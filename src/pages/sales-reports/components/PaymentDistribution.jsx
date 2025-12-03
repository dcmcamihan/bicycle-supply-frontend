import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentDistribution = ({ data = [], loading = false }) => {
  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Wallet" size={20} className="text-accent" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Payment Distribution</h3>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Icon name="Loader" size={32} className="animate-spin text-accent mb-2" />
          <p className="font-body text-sm text-muted-foreground">Loading data...</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Wallet" size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-muted-foreground text-sm">No data for selected range.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p, idx) => {
            const pct = totalAmount > 0 ? Math.round((p.amount / totalAmount) * 100) : 0;
            return (
              <div key={idx} className="p-3 bg-muted/40 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-body text-sm text-foreground">{p.method || 'Unknown'}</p>
                  <p className="font-heading font-semibold text-foreground">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(p.amount || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.count || 0} transactions</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded mt-2">
                  <div className="h-2 bg-accent rounded" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentDistribution;
