import React from 'react';
import Icon from '../../../components/AppIcon';

const PeakHours = ({ data = [] }) => {
  const formatHour = (h) => {
    if (h === undefined || h === null) return '';
    const date = new Date();
    date.setHours(h);
    const label = date.toLocaleTimeString('en-US', { hour: 'numeric' });
    return label;
  };
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Clock" size={20} className="text-warning" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Peak Hours</h3>
      </div>
      {(!data || data.length === 0) ? (
        <p className="font-caption text-sm text-muted-foreground">No data for selected range.</p>
      ) : (
        <div className="space-y-3">
          {data.map((h, idx) => (
            <div key={idx} className="p-3 bg-muted/40 rounded-md">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-foreground">{formatHour(h.hour)}:00</p>
                <p className="font-caption text-xs text-muted-foreground">{h.count} transactions</p>
              </div>
              <div className="w-full h-2 bg-muted rounded mt-2">
                <div className="h-2 bg-warning rounded" style={{ width: `${Math.min(100, h.count * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeakHours;
