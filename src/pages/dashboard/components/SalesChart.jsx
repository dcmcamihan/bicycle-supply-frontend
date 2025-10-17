import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

import Button from '../../../components/ui/Button';

const SalesChart = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week');

  const weeklyData = [
    { name: 'Mon', sales: 2400, orders: 12 },
    { name: 'Tue', sales: 1398, orders: 8 },
    { name: 'Wed', sales: 9800, orders: 24 },
    { name: 'Thu', sales: 3908, orders: 18 },
    { name: 'Fri', sales: 4800, orders: 22 },
    { name: 'Sat', sales: 3800, orders: 16 },
    { name: 'Sun', sales: 4300, orders: 19 }
  ];

  const monthlyData = [
    { name: 'Week 1', sales: 24000, orders: 120 },
    { name: 'Week 2', sales: 18000, orders: 95 },
    { name: 'Week 3', sales: 32000, orders: 156 },
    { name: 'Week 4', sales: 28000, orders: 142 }
  ];

  const currentData = timeRange === 'week' ? weeklyData : monthlyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-raised backdrop-glass">
          <p className="font-body font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              ></div>
              <span className="font-caption text-sm text-muted-foreground">
                {entry?.dataKey === 'sales' ? 'Sales: ₱' : 'Orders: '}
                {entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Sales Performance</h3>
          <p className="font-caption text-sm text-muted-foreground">Track your daily and weekly sales trends</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={timeRange === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('week')}
              className="px-3 py-1"
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('month')}
              className="px-3 py-1"
            >
              Month
            </Button>
          </div>
          
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
              iconName={chartType === 'bar' ? 'LineChart' : 'BarChart3'}
              iconSize={16}
            >
              <span className="sr-only">Toggle chart type</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full h-80" aria-label="Sales Performance Chart">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                fontFamily="var(--font-caption)"
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                fontFamily="var(--font-caption)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                fontFamily="var(--font-caption)"
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                fontFamily="var(--font-caption)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;