import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Button from '../../../components/ui/Button';

import API_ENDPOINTS from '../../../config/api';

const CATEGORY_COLORS = {
  'BIKECOMP': '#2D5A27',
  'MTNBIKE': '#4A7C59',
  'ROADBIKE': '#E67E22',
  'ACCESSORY': '#27AE60',
  // Add more mappings as needed
};

const CategoryChart = ({ data, title = "Category Performance", dateRange }) => {
  const [viewType, setViewType] = useState('pie');
  const [categoryData, setCategoryData] = useState([]);

  // Helper to get date range bounds (copied from sales-reports/index.jsx)
  const getDateRangeBounds = (range) => {
    const now = new Date();
    let start, end;
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // exclusive
    if (typeof range === 'object' && range !== null && range.start && range.end) {
      start = new Date(range.start);
      end = new Date(range.end);
    } else {
      switch (range) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
          break;
        case 'last30days':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
          break;
        case 'thisMonth':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'thisYear':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        case 'lastYear':
          start = new Date(now.getFullYear() - 1, 0, 1);
          end = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      }
    }
    return { start, end };
  };

  useEffect(() => {
    const fetchCategoryPerformance = async () => {
      try {
        // 1. Fetch all categories for mapping
        const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
        const categoriesList = await categoriesRes.json();
        const categoryMap = {};
        categoriesList.forEach(cat => {
          categoryMap[cat.category_code] = cat.category_name;
        });

        // 2. Fetch all sales
        const salesRes = await fetch(API_ENDPOINTS.SALES);
        const sales = await salesRes.json();
        // Apply date filter
        const { start, end } = getDateRangeBounds(dateRange);
        const filteredSales = sales.filter(sale => {
          if (!sale.sale_date) return false;
          const saleDate = new Date(sale.sale_date);
          return saleDate >= start && saleDate < end;
        });
        const saleIds = filteredSales.map(sale => sale.sale_id);

        // 3. For each sale, fetch sale details
        let allSaleDetails = [];
        for (const saleId of saleIds) {
          const detailsRes = await fetch(API_ENDPOINTS.SALE_DETAILS(saleId));
          const details = await detailsRes.json();
          allSaleDetails = allSaleDetails.concat(details);
        }

        // 4. Aggregate sales by category
        const categoryTotals = {};
        for (const detail of allSaleDetails) {
          // Fetch product info for each sale detail
          const productRes = await fetch(API_ENDPOINTS.PRODUCT(detail.product_id));
          const product = await productRes.json();
          const categoryCode = product.category_code;
          const categoryName = categoryMap[categoryCode] || categoryCode;
          const price = parseFloat(product.price);
          const saleValue = price * detail.quantity_sold;
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = { name: categoryName, value: 0, code: categoryCode };
          }
          categoryTotals[categoryName].value += saleValue;
        }

        // 5. Map category names/colors and calculate percentages
        const totalSales = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.value, 0);
        const categories = Object.entries(categoryTotals).map(([name, cat]) => ({
          name,
          value: cat.value,
          percentage: totalSales ? Number(((cat.value / totalSales) * 100).toFixed(2)) : 0,
          color: CATEGORY_COLORS[cat.code] || '#8884d8',
        }));
        setCategoryData(categories);
      } catch (err) {
        // fallback to empty or mock data
        setCategoryData([]);
      }
    };
    fetchCategoryPerformance();
  }, [dateRange]);

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
            Share: {data?.percentage?.toFixed(2)}%
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
  {`${percentage?.toFixed(2)}%`}
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
                    {category?.percentage?.toFixed(2)}% of total
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