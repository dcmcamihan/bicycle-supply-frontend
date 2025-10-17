import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Button from '../../../components/ui/Button';

const CategoryChart = ({ data, title = "Category Performance" }) => {
  const [viewType, setViewType] = useState('pie');

  const categoryData = data || [
    { name: 'Mountain Bikes', value: 45200, percentage: 35.2, color: '#2D5A27' },
    { name: 'Road Bikes', value: 38900, percentage: 30.3, color: '#4A7C59' },
    { name: 'Electric Bikes', value: 28500, percentage: 22.2, color: '#E67E22' },
    { name: 'Accessories', value: 15800, percentage: 12.3, color: '#27AE60' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-raised">
          <p className="font-body font-medium text-sm text-popover-foreground mb-1">
            {data?.name}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Sales: {formatCurrency(data?.value)}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Share: {data?.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
        fontFamily="Source Sans Pro"
      >
        {`${percentage?.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground mb-1">
            {title}
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Sales distribution by product category
          </p>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1 mt-4 sm:mt-0">
          <Button
            variant={viewType === 'pie' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewType('pie')}
            iconName="PieChart"
            iconSize={14}
          >
            Pie
          </Button>
          <Button
            variant={viewType === 'bar' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewType('bar')}
            iconName="BarChart3"
            iconSize={14}
          >
            Bar
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart */}
        <div className="flex-1 h-80" aria-label="Category Performance Chart">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'pie' ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="Source Sans Pro"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  fontFamily="Source Sans Pro"
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="lg:w-64 space-y-3">
          <h3 className="font-body font-medium text-sm text-foreground mb-3">
            Category Breakdown
          </h3>
          {categoryData?.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category?.color }}
                ></div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">
                    {category?.name}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    {category?.percentage}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body text-sm font-bold text-foreground">
                  {formatCurrency(category?.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;