import React from 'react';
import Icon from '../../../components/AppIcon';

const BestSellers = ({ data = [] }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Star" size={20} className="text-primary" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Best Sellers</h3>
      </div>
      {(!data || data.length === 0) ? (
        <p className="font-caption text-sm text-muted-foreground">No data for selected range.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-data text-xs">{idx + 1}</div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-foreground truncate">{item.name}</p>
                  <p className="font-caption text-xs text-muted-foreground">{item.quantity} sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading font-semibold text-foreground">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.sales || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSellers;
