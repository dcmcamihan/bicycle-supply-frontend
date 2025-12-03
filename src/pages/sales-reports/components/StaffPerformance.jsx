import React from 'react';
import Icon from '../../../components/AppIcon';

const StaffPerformance = ({ data = [], loading = false }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Users" size={20} className="text-secondary" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Staff Performance</h3>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Icon name="Loader" size={32} className="animate-spin text-secondary mb-2" />
          <p className="font-body text-sm text-muted-foreground">Loading data...</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Users" size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-muted-foreground text-sm">No data for selected range.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
              <div className="min-w-0">
                <p className="font-body text-sm text-foreground truncate">{s.staff || `Employee #${s.cashierId}`}</p>
                <p className="font-caption text-xs text-muted-foreground">{s.count || 0} transactions</p>
              </div>
              <div className="text-right">
                <p className="font-heading font-semibold text-foreground">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(s.amount || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPerformance;
