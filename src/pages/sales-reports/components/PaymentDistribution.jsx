import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentDistribution = ({ data = [] }) => {
  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Wallet" size={20} className="text-accent" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Payment Distribution</h3>
      </div>
      {(!data || data.length === 0) ? (
        <p className="font-caption text-sm text-muted-foreground">No data for selected range.</p>
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
