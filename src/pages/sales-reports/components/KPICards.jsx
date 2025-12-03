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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {kpiData?.map((kpi, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-subtle hover:shadow-raised transition-smooth w-full overflow-hidden">
          <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
            <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi?.bgColor}`}>
              <Icon name={kpi?.icon} size={20} color="white" />
            </div>
            {kpi?.loading ? (
              <div className="flex items-center space-x-1 text-muted-foreground animate-pulse">
                <Icon name="Loader" size={16} className="animate-spin" />
              </div>
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(kpi?.change)}`}>
                <Icon name={getChangeIcon(kpi?.change)} size={16} />
                <span className="font-body text-xs sm:text-sm font-medium">
                  {formatPercentage(kpi?.change)}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-1 min-w-0">
            <h3 className="font-body text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {kpi?.title}
            </h3>
            {kpi?.loading ? (
              <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
            ) : (
              <p className="font-heading text-lg sm:text-2xl font-bold text-foreground break-words">
                {kpi?.type === 'currency' ? formatCurrency(kpi?.value) : kpi?.value?.toLocaleString()}
              </p>
            )}
            <p className="font-caption text-xs text-muted-foreground">
              {kpi?.period}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;