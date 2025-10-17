import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICards = ({ kpiData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value?.toFixed(1)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {kpiData?.map((kpi, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-subtle hover:shadow-raised transition-smooth">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi?.bgColor}`}>
              <Icon name={kpi?.icon} size={24} color="white" />
            </div>
            <div className={`flex items-center space-x-1 ${getChangeColor(kpi?.change)}`}>
              <Icon name={getChangeIcon(kpi?.change)} size={16} />
              <span className="font-body text-sm font-medium">
                {formatPercentage(kpi?.change)}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-body text-sm font-medium text-muted-foreground">
              {kpi?.title}
            </h3>
            <p className="font-heading text-2xl font-bold text-foreground">
              {kpi?.type === 'currency' ? formatCurrency(kpi?.value) : kpi?.value?.toLocaleString()}
            </p>
            <p className="font-caption text-xs text-muted-foreground">
              vs. {kpi?.period}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;