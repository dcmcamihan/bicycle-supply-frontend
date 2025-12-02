import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

import Button from '../../../components/ui/Button';

import API_ENDPOINTS from '../../../config/api';

const CATEGORY_COLORS = {
  'BIKECOMP': '#2D5A27',
  'MTNBIKE': '#4A7C59',
  'ROADBIKE': '#E67E22',
  'ACCESSORY': '#27AE60',
  // Add more mappings as needed
};

const EXTENDED_COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#dc2626', '#0ea5e9', '#22c55e', '#a855f7', '#14b8a6', '#eab308', '#fb7185', '#10b981',
  '#f43f5e', '#3b82f6', '#fbbf24', '#34d399', '#7c3aed', '#38bdf8', '#d946ef', '#f87171'
];

const CategoryChart = ({ data, title = "Category Performance", dateRange, onDataUpdate }) => {
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

        // 4. Aggregate sales by category (use detail.unit_price if present; fallback to product.price)
        const categoryTotals = {};
        const productCache = new Map();
        for (const detail of allSaleDetails) {
          const productId = detail.product_id;
          // Determine quantity from possible field names
          const qty = Number(detail.quantity_sold ?? detail.quantity ?? detail.qty ?? 0);
          if (!productId || !qty) continue;

          let product = productCache.get(productId);
          if (!product) {
            try {
              const productRes = await fetch(API_ENDPOINTS.PRODUCT(productId));
              if (productRes.ok) {
                product = await productRes.json();
                productCache.set(productId, product);
              } else {
                product = {};
              }
            } catch {
              product = {};
            }
          }

          const categoryCode = product.category_code || product.category || 'UNKNOWN';
          const categoryName = categoryMap[categoryCode] || categoryCode;
          const unitPrice = Number(detail.unit_price ?? product.price ?? 0) || 0;
          const saleValue = unitPrice * qty;
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = { name: categoryName, value: 0, code: categoryCode };
          }
          categoryTotals[categoryName].value += saleValue;
        }

        // 5. Map category names/colors and calculate percentages
        const totalSales = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.value, 0);
        let categories = Object.entries(categoryTotals).map(([name, cat], index) => ({
          name,
          value: Number(cat.value) || 0,
          percentage: totalSales ? Number(((cat.value / totalSales) * 100).toFixed(2)) : 0,
          color: CATEGORY_COLORS[cat.code] || EXTENDED_COLORS[index % EXTENDED_COLORS.length],
        }));
        // Sort by value desc for a clearer bar chart
        categories = categories.sort((a, b) => b.value - a.value);
        setCategoryData(categories);
        // Call parent callback to sync data for PDF export
        if (onDataUpdate) {
          onDataUpdate(categories);
        }
      } catch (err) {
        // fallback to empty or mock data
        setCategoryData([]);
        if (onDataUpdate) {
          onDataUpdate([]);
        }
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
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-subtle w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="font-heading text-base sm:text-lg font-bold text-foreground mb-1 truncate">
            {title}
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Sales distribution by product category
          </p>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1 flex-shrink-0">
          <Button
            variant={viewType === 'pie' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewType('pie')}
            iconName="PieChart"
            iconSize={12}
            className="text-xs"
          >
            Pie
          </Button>
          <Button
            variant={viewType === 'bar' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewType('bar')}
            iconName="BarChart3"
            iconSize={12}
            className="text-xs"
          >
            Bar
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Chart */}
        <div
          className="flex-1 overflow-x-auto min-w-0"
          aria-label="Category Performance Chart"
          style={{
            height: viewType === 'bar'
              ? Math.max(320, (categoryData?.length || 0) * 36)
              : 320
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'pie' ? (
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
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
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number" 
                  domain={[0, (Math.max(0, ...categoryData.map(c => c.value)) || 1) * 1.1]}
                  allowDecimals={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={10}
                  fontFamily="Source Sans Pro"
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  interval={0}
                  width={90}
                  stroke="var(--color-muted-foreground)"
                  fontSize={10}
                  fontFamily="Source Sans Pro"
                  tick={{ fontSize: 9 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  barSize={categoryData.length > 12 ? 12 : 18}
                  barCategoryGap={categoryData.length > 12 ? '8%' : '12%'}
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v) => formatCurrency(v)} fill="var(--color-foreground)" fontSize={9} />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="lg:w-64 space-y-2 sm:space-y-3">
          <h3 className="font-body font-medium text-xs sm:text-sm text-foreground mb-3">
            Category Breakdown
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categoryData?.map((category, index) => (
              <div key={index} className="flex items-start sm:items-center justify-between gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 sm:mt-0"
                    style={{ backgroundColor: category?.color }}
                  ></div>
                  <div className="min-w-0">
                    <p className="font-body text-xs sm:text-sm font-medium text-foreground truncate">
                      {category?.name}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      {category?.percentage?.toFixed(2)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-body text-xs sm:text-sm font-bold text-foreground">
                    {formatCurrency(category?.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;