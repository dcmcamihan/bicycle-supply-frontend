import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Button from '../../../components/ui/Button';

const SalesChart = ({ data, title = "Sales Trends", timeframe: timeframeProp, onTimeframeChange }) => {
  const [chartType, setChartType] = useState('line');
  const [localTimeframe, setLocalTimeframe] = useState('hourly');
  const timeframe = timeframeProp ?? localTimeframe;

  const chartData = data || [
    { name: 'Mon', sales: 12500, transactions: 45, avgOrder: 278 },
    { name: 'Tue', sales: 15200, transactions: 52, avgOrder: 292 },
    { name: 'Wed', sales: 18900, transactions: 61, avgOrder: 310 },
    { name: 'Thu', sales: 16700, transactions: 48, avgOrder: 348 },
    { name: 'Fri', sales: 22100, transactions: 67, avgOrder: 330 },
    { name: 'Sat', sales: 28500, transactions: 89, avgOrder: 320 },
    { name: 'Sun', sales: 19800, transactions: 58, avgOrder: 341 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-raised">
          <p className="font-body font-medium text-sm text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              ></div>
              <span className="font-caption text-xs text-muted-foreground">
                {entry?.dataKey === 'sales' ? 'Sales:' : 
                 entry?.dataKey === 'transactions' ? 'Transactions:' : 'Avg Order:'}
              </span>
              <span className="font-body text-sm font-medium text-popover-foreground">
                {entry?.dataKey === 'sales' || entry?.dataKey === 'avgOrder' 
                  ? formatCurrency(entry?.value) 
                  : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-subtle w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="font-heading text-base sm:text-lg font-bold text-foreground mb-1 truncate">
            {title}
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Revenue and transaction patterns over time
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="xs"
              onClick={() => setChartType('line')}
              iconName="TrendingUp"
              iconSize={12}
              className="text-xs"
            >
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="xs"
              onClick={() => setChartType('bar')}
              iconName="BarChart3"
              iconSize={12}
              className="text-xs"
            >
              Bar
            </Button>
          </div>
          
          <select 
            value={timeframe}
            onChange={(e) => {
              const v = e?.target?.value;
              if (onTimeframeChange) onTimeframeChange(v);
              else setLocalTimeframe(v);
            }}
            className="px-2 sm:px-3 py-1 bg-input border border-border rounded-lg font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="h-64 sm:h-80 w-full overflow-x-auto" aria-label="Sales Trends Chart">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                fontFamily="Source Sans Pro"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                fontFamily="Source Sans Pro"
                tickFormatter={formatCurrency}
                width={40}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontFamily: 'Source Sans Pro',
                  color: 'var(--color-foreground)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'var(--color-primary)', strokeWidth: 2 }}
                name="Sales Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 3 }}
                name="Transactions"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                fontFamily="Source Sans Pro"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                fontFamily="Source Sans Pro"
                tickFormatter={formatCurrency}
                width={40}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontFamily: 'Source Sans Pro',
                  color: 'var(--color-foreground)'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]}
                name="Sales Revenue"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;