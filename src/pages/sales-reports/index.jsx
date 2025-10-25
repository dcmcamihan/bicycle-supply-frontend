import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import API_ENDPOINTS from '../../config/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ReportHeader from './components/ReportHeader';
import KPICards from './components/KPICards';
import StockMovement from './components/StockMovement';
import SalesChart from './components/SalesChart';
import CategoryChart from './components/CategoryChart';
import TransactionTable from './components/TransactionTable';
import InsightsPanel from './components/InsightsPanel';
import BestSellers from './components/BestSellers';
import PaymentDistribution from './components/PaymentDistribution';
import StaffPerformance from './components/StaffPerformance';
import PeakHours from './components/PeakHours';

const SalesReports = () => {
  // Helper to get date range filter
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
  // Helper: fetch JSON from endpoint
  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return await res.json();
  };

  // Helper: fetch sale details and compute total amount
  const getSaleDetailsAndAmount = async (saleId) => {
    const details = await fetchJson(API_ENDPOINTS.SALE_DETAILS(saleId));
    let totalAmount = 0;
    let itemsCount = 0;
    for (const detail of details) {
      const prod = await fetchJson(API_ENDPOINTS.PRODUCT(detail.product_id));
      const price = parseFloat(prod.price) || 0;
      totalAmount += price * (detail.quantity_sold || 0);
      itemsCount += detail.quantity_sold || 0;
    }
    return { details, totalAmount, itemsCount };
  };

  // Helper: fetch payment method description
  const getPaymentMethod = async (saleId) => {
    // Use API_ENDPOINTS for sale payment types
    const payData = await fetchJson(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(saleId));
    let payment_method_code = '';
    if (Array.isArray(payData) && payData.length > 0) {
      payment_method_code = payData[0].payment_method_code || '';
    } else if (payData.payment_method_code) {
      payment_method_code = payData.payment_method_code;
    }
    if (payment_method_code) {
      try {
        // Use API_ENDPOINTS for payment method name
        const paymentMethodName = await fetchJson(API_ENDPOINTS.PAYMENT_METHOD(payment_method_code));
        return paymentMethodName.name || payment_method_code;
      } catch {
        return payment_method_code;
      }
    }
    return '';
  };

  // Helper: fetch staff name
  const getStaffName = async (cashierId) => {
    if (!cashierId) return '';
    try {
      const staffData = await fetchJson(API_ENDPOINTS.EMPLOYEE(cashierId));
      let middleInitial = staffData.middle_name?.trim()?.[0]?.toUpperCase() ? staffData.middle_name.trim()[0].toUpperCase() + '. ' : '';
      return `${staffData.first_name} ${middleInitial}${staffData.last_name}`;
    } catch {
      return `Employee #${cashierId}`;
    }
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Default dateRange set to 'today' for immediate, relevant insights
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('daily');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [chartTimeframe, setChartTimeframe] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);

  // KPI data state
  const [kpiData, setKpiData] = useState([
    {
      title: 'Total Sales',
      value: 0,
      type: 'currency',
      change: 12.5,
      period: 'last week',
      icon: 'DollarSign',
      bgColor: 'bg-primary'
    },
    {
      title: 'Transactions',
      value: 342,
      type: 'number',
      change: 8.2,
      period: 'last week',
      icon: 'ShoppingCart',
      bgColor: 'bg-secondary'
    },
    {
      title: 'Average Order',
      value: 375.73,
      type: 'currency',
      change: 4.1,
      period: 'last week',
      icon: 'TrendingUp',
      bgColor: 'bg-accent'
    },
    {
      title: 'Top Products',
      value: 45,
      type: 'number',
      change: -2.3,
      period: 'last week',
      icon: 'Star',
      bgColor: 'bg-success'
    }
  ]);

  // Fetch and compute total sales for KPI
  useEffect(() => {
    const fetchKpisAndTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const sales = await fetchJson(API_ENDPOINTS.SALES);
        const { start, end } = getDateRangeBounds(dateRange);
        const filteredSales = sales.filter(sale => {
          if (!sale.sale_date) return false;
          const saleDate = new Date(sale.sale_date);
          return saleDate >= start && saleDate < end;
        });

        // KPI calculations
        let totalSales = 0;
        const productCountMap = new Map();
        // Caches for further reports
        const saleAmountCache = new Map(); // sale_id -> totalAmount
        const productAgg = new Map(); // product_id -> { name, quantity, sales }
        const paymentAgg = new Map(); // method -> { count, amount }
        const staffAgg = new Map(); // cashier -> { name, count, amount }
        const hourAgg = new Map(); // hour(0-23) -> { count, amount }

        for (const sale of filteredSales) {
          try {
            const { details, totalAmount, itemsCount } = await getSaleDetailsAndAmount(sale.sale_id);
            saleAmountCache.set(sale.sale_id, totalAmount);
            for (const detail of details) {
              const prod = await fetchJson(API_ENDPOINTS.PRODUCT(detail.product_id));
              const price = parseFloat(prod.price) || 0;
              const line = price * (detail.quantity_sold || 0);
              totalSales += line;
              if (detail.product_id) {
                productCountMap.set(
                  detail.product_id,
                  (productCountMap.get(detail.product_id) || 0) + (detail.quantity_sold || 0)
                );
                const existing = productAgg.get(detail.product_id) || { name: prod.product_name, quantity: 0, sales: 0 };
                existing.quantity += (detail.quantity_sold || 0);
                existing.sales += line;
                productAgg.set(detail.product_id, existing);
              }
            }
            // Payment aggregation
            try {
              const payData = await fetchJson(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(sale.sale_id));
              let code = '';
              if (Array.isArray(payData) && payData.length > 0) code = payData[0].payment_method_code || '';
              else if (payData.payment_method_code) code = payData.payment_method_code;
              let methodLabel = code;
              if (code) {
                try {
                  const method = await fetchJson(API_ENDPOINTS.PAYMENT_METHOD(code));
                  methodLabel = method.name || code;
                } catch {}
              }
              const existingPay = paymentAgg.get(methodLabel) || { method: methodLabel, count: 0, amount: 0 };
              existingPay.count += 1;
              existingPay.amount += (saleAmountCache.get(sale.sale_id) || 0);
              paymentAgg.set(methodLabel, existingPay);
            } catch {}

            // Staff aggregation
            let staffName = '';
            try {
              staffName = await getStaffName(sale.cashier);
            } catch { staffName = `Employee #${sale.cashier}`; }
            const existingStaff = staffAgg.get(sale.cashier) || { cashierId: sale.cashier, staff: staffName, count: 0, amount: 0 };
            existingStaff.count += 1;
            existingStaff.amount += (saleAmountCache.get(sale.sale_id) || 0);
            staffAgg.set(sale.cashier, existingStaff);

            // Peak hours aggregation
            const hour = new Date(sale.sale_date).getHours();
            const existingHour = hourAgg.get(hour) || { hour, count: 0, amount: 0 };
            existingHour.count += 1;
            existingHour.amount += (saleAmountCache.get(sale.sale_id) || 0);
            hourAgg.set(hour, existingHour);
          } catch {}
        }
        // Compute previous period bounds for KPI change
        const msPerDay = 24*60*60*1000;
        const curLenDays = Math.max(1, Math.round((end - start) / msPerDay));
        const prevEnd = new Date(start);
        const prevStart = new Date(start.getTime() - curLenDays * msPerDay);
        const prevSales = sales.filter(sale => {
          if (!sale.sale_date) return false;
          const d = new Date(sale.sale_date);
          return d >= prevStart && d < prevEnd;
        });
        let prevTotalSales = 0;
        const prevProductCountMap = new Map();
        for (const sale of prevSales) {
          try {
            const { details, totalAmount } = await getSaleDetailsAndAmount(sale.sale_id);
            prevTotalSales += totalAmount;
            for (const detail of details) {
              if (detail.product_id) prevProductCountMap.set(
                detail.product_id,
                (prevProductCountMap.get(detail.product_id) || 0) + (detail.quantity_sold || 0)
              );
            }
          } catch {}
        }
        const prevTxCount = prevSales.length;
        const prevAvgOrder = prevTxCount > 0 ? prevTotalSales / prevTxCount : 0;
        const prevTopProductsCount = prevProductCountMap.size;

        const avgOrder = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
        const topProductsCount = productCountMap.size;
        const pct = (cur, prev) => prev > 0 ? ((cur - prev) / prev) * 100 : (cur > 0 ? 100 : 0);
        setKpiData(prev => prev.map(kpi => {
          if (kpi.title === 'Total Sales') return { ...kpi, value: totalSales, change: pct(totalSales, prevTotalSales), period: 'vs prev' };
          if (kpi.title === 'Transactions') return { ...kpi, value: filteredSales.length, change: pct(filteredSales.length, prevTxCount), period: 'vs prev' };
          if (kpi.title === 'Average Order') return { ...kpi, value: avgOrder, change: pct(avgOrder, prevAvgOrder), period: 'vs prev' };
          if (kpi.title === 'Top Products') return { ...kpi, value: topProductsCount, change: pct(topProductsCount, prevTopProductsCount), period: 'vs prev' };
          return kpi;
        }));

        // Transactions data
        const mapped = await Promise.all(filteredSales.map(async item => {
          let customerName = 'N/A';
          if (item.customer_id) {
            try {
              const custData = await fetchJson(API_ENDPOINTS.CUSTOMER(item.customer_id));
              customerName = `${custData.first_name} ${custData.middle_name ? custData.middle_name + ' ' : ''}${custData.last_name}`;
            } catch {
              customerName = `Customer #${item.customer_id}`;
            }
          }
          let itemsCount = 0;
          let totalAmount = 0;
          try {
            const { totalAmount: amt, itemsCount: cnt } = await getSaleDetailsAndAmount(item.sale_id);
            itemsCount = cnt;
            totalAmount = amt;
          } catch {
            itemsCount = 0;
            totalAmount = 0;
          }
          let paymentMethod = '';
          try {
            paymentMethod = await getPaymentMethod(item.sale_id);
            // Fallback to code if description is missing
            if (!paymentMethod) {
              const payData = await fetchJson(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(item.sale_id));
              if (Array.isArray(payData) && payData.length > 0) {
                paymentMethod = payData[0].payment_method_code || '';
              } else if (payData.payment_method_code) {
                paymentMethod = payData.payment_method_code;
              }
            }
          } catch {
            // Fallback to code if fetch fails
            try {
              const payData = await fetchJson(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(item.sale_id));
              if (Array.isArray(payData) && payData.length > 0) {
                paymentMethod = payData[0].payment_method_code || '';
              } else if (payData.payment_method_code) {
                paymentMethod = payData.payment_method_code;
              }
            } catch {
              paymentMethod = '';
            }
          }
          let staffName = '';
          try {
            staffName = await getStaffName(item.cashier);
          } catch {
            staffName = `Employee #${item.cashier}`;
          }
          return {
            id: item.sale_id,
            date: item.sale_date ? new Date(item.sale_date).toISOString().split('T')[0] : '',
            customer: customerName,
            amount: totalAmount,
            items: itemsCount,
            paymentMethod,
            status: item.status ?? 'completed',
            staff: staffName,
            manager: item.manager
          };
        }));
        setTransactionsData(mapped);
        setTransactionsError(null);

        // Set new datasets
        const best = Array.from(productAgg.values()).sort((a,b) => b.quantity - a.quantity).slice(0, 10);
        setBestSellers(best);
        const pay = Array.from(paymentAgg.values()).sort((a,b) => b.amount - a.amount);
        setPaymentDistribution(pay);
        const staff = Array.from(staffAgg.values()).sort((a,b) => b.amount - a.amount);
        setStaffPerformance(staff);
        const hours = Array.from(hourAgg.values()).sort((a,b) => a.hour - b.hour);
        setPeakHours(hours);
      } catch (error) {
        setTransactionsError(error.message);
        setTransactionsData([]);
        setBestSellers([]);
        setPaymentDistribution([]);
        setStaffPerformance([]);
        setPeakHours([]);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchKpisAndTransactions();
  }, [dateRange]);

  // Load stock adjustments and filter by dateRange
  useEffect(() => {
    const loadAdjustments = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.STOCK_ADJUSTMENTS);
        const all = res.ok ? await res.json() : [];
        const { start, end } = getDateRangeBounds(dateRange);
        const filtered = (all || []).filter(a => {
          if (!a.transaction_date) return false;
          const d = new Date(a.transaction_date);
          return d >= start && d < end;
        });
        setStockAdjustments(filtered);
      } catch { setStockAdjustments([]); }
    };
    loadAdjustments();
  }, [dateRange]);

  // Load supplies and stockouts, then merge with adjustments into a single movement stream
  useEffect(() => {
    const loadMovements = async () => {
      const { start, end } = getDateRangeBounds(dateRange);
      const movements = [];
      // Supplies -> fetch headers, then details per supply
      try {
        const sRes = await fetch(API_ENDPOINTS.SUPPLIES);
        const supplies = sRes.ok ? await sRes.json() : [];
        const sFiltered = (supplies || []).filter(s => {
          const d = s?.supply_date ? new Date(s.supply_date) : null;
          return d && d >= start && d < end;
        });
        for (const s of sFiltered) {
          let lines = [];
          try {
            const dRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(s.supply_id || s.id));
            if (dRes.ok) {
              const det = await dRes.json();
              lines = (det || []).map(d => ({ product_id: d.product_id, quantity: Number(d.quantity_supplied)||0 }));
            }
          } catch {}
          movements.push({ date: s.supply_date, type: 'Supply', remarks: s.status || '', lines });
        }
      } catch {}
      // Stockouts -> use header; if details endpoint exists, prefer it
      try {
        const soRes = await fetch(API_ENDPOINTS.STOCKOUTS);
        const outs = soRes.ok ? await soRes.json() : [];
        const oFiltered = (outs || []).filter(o => {
          const d = o?.stockout_date ? new Date(o.stockout_date) : null;
          return d && d >= start && d < end;
        });
        for (const o of oFiltered) {
          let lines = [];
          // Try details
          try {
            if (API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT && (o.stockout_id || o.id)) {
              const dRes = await fetch(API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT(o.stockout_id || o.id));
              if (dRes.ok) {
                const det = await dRes.json();
                lines = (det || []).map(d => ({ product_id: d.product_id, quantity: -(Number(d.quantity_removed)||0) }));
              }
            }
          } catch {}
          if (lines.length === 0 && o.product_id) {
            lines = [{ product_id: o.product_id, quantity: -(Number(o.quantity_removed)||0) }];
          }
          movements.push({ date: o.stockout_date, type: 'Stockout', remarks: o.reason || '', lines });
        }
      } catch {}
      // Adjustments already loaded -> map into movements
      try {
        for (const a of stockAdjustments) {
          const lines = (a.details || []).map(d => ({ product_id: d.product_id, quantity: Number(d.quantity)||0 }));
          movements.push({ date: a.transaction_date, type: 'Adjustment', remarks: a.remarks || '', lines });
        }
      } catch {}
      // Sort desc by date
      movements.sort((x,y) => new Date(y.date) - new Date(x.date));
      setStockMovements(movements);
    };
    loadMovements();
  }, [dateRange, stockAdjustments]);

  // Real sales chart data from API (aggregated by chartTimeframe)
  const [salesChartData, setSalesChartData] = useState([
    { name: 'Mon', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Tue', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Wed', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Thu', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Fri', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Sat', sales: 0, transactions: 0, avgOrder: 0 },
    { name: 'Sun', sales: 0, transactions: 0, avgOrder: 0 }
  ]);

  useEffect(() => {
    const fetchSalesChartData = async () => {
      try {
        const sales = await fetchJson(API_ENDPOINTS.SALES);
        const { start, end } = getDateRangeBounds(dateRange);
        const filteredSales = sales.filter(sale => {
          if (!sale.sale_date) return false;
          const saleDate = new Date(sale.sale_date);
          return saleDate >= start && saleDate < end;
        });
        // Aggregate by timeframe
        const aggMap = new Map(); // key -> { name, sales, transactions }
        const addPoint = (key, name, amount) => {
          const cur = aggMap.get(key) || { name, sales: 0, transactions: 0 };
          cur.sales += amount;
          cur.transactions += 1;
          aggMap.set(key, cur);
        };
        for (const sale of filteredSales) {
          const dateObj = new Date(sale.sale_date);
          let totalAmount = 0;
          try {
            const { totalAmount: amt } = await getSaleDetailsAndAmount(sale.sale_id);
            totalAmount = amt;
          } catch { totalAmount = 0; }
          if (chartTimeframe === 'hourly') {
            const h = dateObj.getHours();
            const key = String(h).padStart(2, '0');
            addPoint(key, `${key}:00`, totalAmount);
          } else if (chartTimeframe === 'daily') {
            const label = dateObj.toISOString().split('T')[0];
            addPoint(label, label, totalAmount);
          } else if (chartTimeframe === 'weekly') {
            const d = new Date(dateObj);
            const day = (d.getDay()+6)%7; // ISO: Mon=0..Sun=6
            d.setDate(d.getDate()-day);
            const key = d.toISOString().split('T')[0];
            addPoint(key, `Week of ${key}`, totalAmount);
          } else if (chartTimeframe === 'monthly') {
            const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}`;
            const name = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).toLocaleString(undefined, { month: 'short', year: 'numeric' });
            addPoint(key, name, totalAmount);
          }
        }
        // Build sorted series
        let series = Array.from(aggMap.entries()).map(([k, v]) => ({ name: v.name, sales: v.sales, transactions: v.transactions, avgOrder: v.transactions>0 ? v.sales/v.transactions : 0, key: k }));
        series.sort((a,b) => a.key.localeCompare(b.key));
        setSalesChartData(series.map(({key, ...rest}) => rest));
      } catch (e) {
        // fallback to empty data
        setSalesChartData([
          { name: 'Mon', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Tue', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Wed', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Thu', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Fri', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Sat', sales: 0, transactions: 0, avgOrder: 0 },
          { name: 'Sun', sales: 0, transactions: 0, avgOrder: 0 }
        ]);
      }
    };
    fetchSalesChartData();
  }, [dateRange, chartTimeframe]);

  // Mock category data
  const categoryData = [
    { name: 'Mountain Bikes', value: 45200, percentage: 35.2, color: '#2D5A27' },
    { name: 'Road Bikes', value: 38900, percentage: 30.3, color: '#4A7C59' },
    { name: 'Electric Bikes', value: 28500, percentage: 22.2, color: '#E67E22' },
    { name: 'Accessories', value: 15800, percentage: 12.3, color: '#27AE60' }
  ];

  // Transactions data from API
  const [transactionsData, setTransactionsData] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  // New report datasets
  const [bestSellers, setBestSellers] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  // ...existing code...

  // Mock insights data
  const insightsData = [
    { title: 'Best Selling Product', value: 'Mountain Bike Pro', trend: 'up' },
    { title: 'Peak Sales Hour', value: '2:00 PM - 3:00 PM', trend: 'stable' },
    { title: 'Customer Retention', value: '85%', trend: 'up' }
  ];

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDateRangeChange = (newRange) => {
    if (newRange === 'custom') {
      // Use current custom range object for filtering
      setDateRange({ ...customRange });
    } else {
      setDateRange(newRange);
    }
  };

  const handleReportTypeChange = (newType) => {
    setReportType(newType);
    if (newType === 'daily' || newType === 'weekly' || newType === 'monthly') {
      setChartTimeframe(newType);
    }
    // If reportType is 'custom', dateRange inputs will show; leave timeframe as-is
  };

  const handleCustomRangeChange = (range) => {
    setCustomRange(range);
    // If currently on custom, push updates to active dateRange
    if (typeof dateRange === 'object') {
      setDateRange({ ...range });
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const yyyymmdd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
      const fileName = `Reports${yyyymmdd}.pdf`;

      const { start, end } = getDateRangeBounds(dateRange);
      const dateLabel = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const usable = pageWidth - margin * 2;
      const headerColor = [37, 99, 235];
      const commonTableOpts = {
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5, overflow: 'linebreak' },
        headStyles: { fillColor: headerColor, textColor: 255, halign: 'center', fontSize: 11 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margin, right: margin },
        tableWidth: usable,
        columnStyles: {},
        didDrawPage: (data) => {
          // Header
          doc.setFontSize(16);
          doc.setTextColor(17, 24, 39);
          doc.text('Sales Summary Report', margin, 28);
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          doc.text(`Date Range: ${dateLabel}  •  Report Type: ${reportType}`, margin, 44);
          // Divider
          doc.setDrawColor(229, 231, 235);
          doc.line(margin, 52, pageWidth - margin, 52);
          // Footer page number
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          doc.text(str, margin, pageHeight - 16);
        }
      };

      // Initial top offset below header
      let topY = 64;

      // Executive Summary (concise, peso-only values)
      const kpiMap = Object.fromEntries(kpiData.map(k => [k.title, k]));
      autoTable(doc, {
        startY: topY,
        head: [['Executive Summary', 'Value']],
        body: [
          ['Total Sales', `₱${Number(kpiMap['Total Sales']?.value||0).toLocaleString()}`],
          ['Transactions', Number(kpiMap['Transactions']?.value||0).toLocaleString()],
          ['Average Order', `₱${Number(kpiMap['Average Order']?.value||0).toLocaleString()}`]
        ],
        ...commonTableOpts,
        styles: { ...commonTableOpts.styles, fontSize: 11 },
        columnStyles: { 0: { cellWidth: 200 }, 1: { cellWidth: 240 } },
      });

      // Section 1: Sales by Day (last 7 days)
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['1) Sales by Day', 'Sales', 'Transactions', 'Avg Order']],
        body: (salesChartData||[]).map(d => [d.name, `₱${Number(d.sales||0).toLocaleString()}`,
          Number(d.transactions||0).toLocaleString(), `₱${Number(d.avgOrder||0).toLocaleString()}`]),
        ...commonTableOpts,
        columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 120 }, 2: { cellWidth: 120 }, 3: { cellWidth: 120 } }
      });

      // Section 2: Top Products
      if (bestSellers?.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['2) Top Products', 'Quantity', 'Sales']],
          body: bestSellers.map(p => [p.name, Number(p.quantity||0).toLocaleString(), `₱${Number(p.sales||0).toLocaleString()}`]),
          ...commonTableOpts,
          columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: 80 }, 2: { cellWidth: 120 } }
        });
      }

      // Section 3: Category Performance
      if (Array.isArray(categoryData) && categoryData.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['3) Category Performance', 'Sales', 'Share %']],
          body: categoryData.map(c => [c.name, `₱${Number(c.value||0).toLocaleString()}`, `${Number(c.percentage||0).toFixed(1)}%`]),
          ...commonTableOpts,
          columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: 120 }, 2: { cellWidth: 80 } }
        });
      }

      // Section 4: Payment Distribution
      if (paymentDistribution?.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['4) Payment Distribution', 'Transactions', 'Amount']],
          body: paymentDistribution.map(p => [p.method, Number(p.count||0).toLocaleString(), `₱${Number(p.amount||0).toLocaleString()}`]),
          ...commonTableOpts,
          columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: 100 }, 2: { cellWidth: 120 } }
        });
      }

      // Section 5: Staff Performance
      if (staffPerformance?.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['5) Staff Performance', 'Transactions', 'Amount']],
          body: staffPerformance.map(s => [s.staff, Number(s.count||0).toLocaleString(), `₱${Number(s.amount||0).toLocaleString()}`]),
          ...commonTableOpts,
          columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: 100 }, 2: { cellWidth: 120 } }
        });
      }

      // Section 6: Peak Hours
      if (peakHours?.length) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['6) Peak Hours', 'Transactions', 'Amount']],
          body: peakHours.map(h => [`${String(h.hour).padStart(2,'0')}:00`, Number(h.count||0).toLocaleString(), `₱${Number(h.amount||0).toLocaleString()}`]),
          ...commonTableOpts,
          columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 120 }, 2: { cellWidth: 120 } }
        });
      }

      // Section 7: Transactions (top 25 by amount for clarity)
      const topTx = [...(transactionsData||[])].sort((a,b) => (b.amount||0) - (a.amount||0)).slice(0, 25);
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 120,
        head: [['7) Top Transactions', 'Customer', 'Items', 'Amount', 'Payment', 'Staff']],
        body: topTx.map(t => [t.date, t.customer, Number(t.items||0).toLocaleString(), `₱${Number(t.amount||0).toLocaleString()}`, t.paymentMethod, t.staff]),
        ...commonTableOpts,
        columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 170 }, 2: { cellWidth: 70 }, 3: { cellWidth: 110 }, 4: { cellWidth: 110 }, 5: { cellWidth: 120 } },
        didDrawPage: (data) => {
          // Footer page numbers
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(9);
          doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Final: Insights / Narrative Summary (clear takeaways)
      const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
      doc.setFontSize(12);
      doc.text('Insights', 40, summaryY);
      doc.setFontSize(10);
      const insights = [
        'Focus on days and hours with strong performance to schedule staff and promotions.',
        'Replenish inventory for best sellers and strong categories; consider bundling popular items.',
        'Ensure payment options align with customer preferences shown in distribution.',
      ];
      let y = summaryY + 16;
      insights.forEach(line => { doc.text(`• ${line}`, 46, y); y += 14; });

      doc.save(fileName);
    } catch (e) {
      console.error('Failed to export PDF:', e);
      alert('Failed to export PDF. Please ensure export libraries are installed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const yyyymmdd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
      const fileName = `Reports${yyyymmdd}.xlsx`;
      const workbook = new ExcelJS.Workbook();
      const { start, end } = getDateRangeBounds(dateRange);
      const dateLabel = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

      // Helper to add a header
      const addHeader = (ws, title) => {
        const r1 = ws.addRow([title]);
        const r2 = ws.addRow([`Date Range: ${dateLabel}`, `Report Type: ${reportType}`]);
        ws.addRow([]);
        // Style header
        [r1, r2].forEach(r => {
          r.font = { bold: true, color: { argb: 'FF111827' } };
        });
      };

      const styleTableHeader = (row) => {
        row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      };

      const applyZebra = (ws, startRow) => {
        for (let i = startRow; i <= ws.rowCount; i++) {
          if ((i - startRow) % 2 === 1) {
            ws.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        }
      };

      // Helpers for Excel styling
      const autoFit = (ws) => {
        const colCount = Math.max(...ws._rows.map(r => r ? r.cellCount : 0));
        for (let i = 1; i <= colCount; i++) {
          let max = 10;
          ws.eachRow((row) => {
            const cell = row.getCell(i);
            const v = cell.value == null ? '' : String(typeof cell.value === 'object' && cell.value.richText ? cell.value.richText.map(t=>t.text).join('') : cell.value);
            max = Math.max(max, v.length + 2);
          });
          ws.getColumn(i).width = Math.max(10, Math.min(30, max));
        }
      };
      const applyCurrency = (ws, headerRow) => {
        const hdr = ws.getRow(headerRow);
        hdr.eachCell((cell, col) => {
          const name = String(cell.value||'').toLowerCase();
          if (name.includes('sales') || name.includes('amount') || name.includes('avg') || name.includes('order')) {
            for (let r = headerRow + 1; r <= ws.rowCount; r++) {
              const c = ws.getRow(r).getCell(col);
              if (typeof c.value === 'number') c.numFmt = '[$₱-en-PH]#,##0.00';
            }
          }
        });
      };
      const styleBigHeader = (ws, title) => {
        const r1 = ws.addRow([title]);
        r1.font = { bold: true, size: 16, color: { argb: 'FF111827' } };
        r1.height = 28;
        const r2 = ws.addRow([`Date Range: ${dateLabel}`, `Report Type: ${reportType}`]);
        r2.font = { bold: true, size: 12, color: { argb: 'FF111827' } };
        r2.height = 22;
        ws.addRow([]);
      };
      const addTable = (ws, headers, rows) => {
        const hdr = ws.addRow(headers);
        styleTableHeader(hdr);
        rows.forEach(r => ws.addRow(r));
        // borders
        const start = hdr.number; const end = ws.rowCount; const cols = headers.length;
        for (let r = start; r <= end; r++) {
          const row = ws.getRow(r);
          for (let c = 1; c <= cols; c++) {
            const cell = row.getCell(c);
            cell.border = { top: {style: 'thin', color:{argb:'FFE5E7EB'}}, left:{style:'thin', color:{argb:'FFE5E7EB'}}, bottom:{style:'thin', color:{argb:'FFE5E7EB'}}, right:{style:'thin', color:{argb:'FFE5E7EB'}} };
          }
        }
        return hdr.number;
      };

      // Individual sheets per detail
      // Summary
      const wsSummary = workbook.addWorksheet('Summary');
      styleBigHeader(wsSummary, 'Summary');
      const sumHdr = addTable(wsSummary, ['Metric','Value'], kpiData.map(k=>[k.title, Number(k.value||0)]));
      applyCurrency(wsSummary, sumHdr);
      wsSummary.views = [{ state: 'frozen', ySplit: sumHdr }];
      autoFit(wsSummary);
      applyZebra(wsSummary, sumHdr + 1);

      // SalesByDay
      const wsSales = workbook.addWorksheet('SalesByDay');
      styleBigHeader(wsSales, 'Sales by Day');
      const sHdr = addTable(wsSales, ['Day','Sales','Transactions','Avg Order'], (salesChartData||[]).map(d=>[d.name, Number(d.sales||0), Number(d.transactions||0), Number(d.avgOrder||0)]));
      applyCurrency(wsSales, sHdr);
      wsSales.views = [{ state: 'frozen', ySplit: sHdr }];
      autoFit(wsSales);
      applyZebra(wsSales, sHdr + 1);

      // CategoryPerformance
      const wsCat = workbook.addWorksheet('CategoryPerformance');
      styleBigHeader(wsCat, 'Category Performance');
      const cHdr = addTable(wsCat, ['Category','Sales','Share%'], (categoryData||[]).map(c=>[c.name, Number(c.value||0), Number(c.percentage||0)]));
      applyCurrency(wsCat, cHdr);
      wsCat.views = [{ state: 'frozen', ySplit: cHdr }];
      autoFit(wsCat);
      applyZebra(wsCat, cHdr + 1);

      // BestSellers
      const wsBest = workbook.addWorksheet('BestSellers');
      styleBigHeader(wsBest, 'Best Sellers');
      const bHdr = addTable(wsBest, ['Product','Quantity','Sales'], (bestSellers||[]).map(p=>[p.name, Number(p.quantity||0), Number(p.sales||0)]));
      applyCurrency(wsBest, bHdr);
      wsBest.views = [{ state: 'frozen', ySplit: bHdr }];
      autoFit(wsBest);
      applyZebra(wsBest, bHdr + 1);

      // Payments
      const wsPay = workbook.addWorksheet('Payments');
      styleBigHeader(wsPay, 'Payment Distribution');
      const pHdr = addTable(wsPay, ['Method','Transactions','Amount'], (paymentDistribution||[]).map(p=>[p.method, Number(p.count||0), Number(p.amount||0)]));
      applyCurrency(wsPay, pHdr);
      wsPay.views = [{ state: 'frozen', ySplit: pHdr }];
      autoFit(wsPay);
      applyZebra(wsPay, pHdr + 1);

      // StaffPerformance
      const wsStaff = workbook.addWorksheet('StaffPerformance');
      styleBigHeader(wsStaff, 'Staff Performance');
      const stHdr = addTable(wsStaff, ['Staff','Transactions','Amount'], (staffPerformance||[]).map(s=>[s.staff, Number(s.count||0), Number(s.amount||0)]));
      applyCurrency(wsStaff, stHdr);
      wsStaff.views = [{ state: 'frozen', ySplit: stHdr }];
      autoFit(wsStaff);
      applyZebra(wsStaff, stHdr + 1);

      // PeakHours
      const wsHours = workbook.addWorksheet('PeakHours');
      styleBigHeader(wsHours, 'Peak Hours');
      const hHdr = addTable(wsHours, ['Hour','Transactions','Amount'], (peakHours||[]).map(h=>[`${String(h.hour).padStart(2,'0')}:00`, Number(h.count||0), Number(h.amount||0)]));
      applyCurrency(wsHours, hHdr);
      wsHours.views = [{ state: 'frozen', ySplit: hHdr }];
      autoFit(wsHours);
      applyZebra(wsHours, hHdr + 1);

      // Transactions
      const wsTx = workbook.addWorksheet('Transactions');
      styleBigHeader(wsTx, 'Transactions');
      const tHdr = addTable(wsTx, ['Date','Customer','Items','Amount','Payment','Staff','Status'], (transactionsData||[]).map(t=>[t.date, t.customer, Number(t.items||0), Number(t.amount||0), t.paymentMethod, t.staff, t.status]));
      applyCurrency(wsTx, tHdr);
      wsTx.views = [{ state: 'frozen', ySplit: tHdr }];
      autoFit(wsTx);
      applyZebra(wsTx, tHdr + 1);

      // Charts sheet
      const wsViz = workbook.addWorksheet('Charts');
      styleBigHeader(wsViz, 'Charts');

      // Minimal SVG generators with legends
      const svgBarChart = (pairs, {width=800, height=300, barColor='#2563eb', title=''}) => {
        const pad = 40; const chartW = width - pad*2; const chartH = height - pad*2;
        const max = Math.max(1, ...pairs.map(p => p.value));
        const barW = chartW / pairs.length;
        const bars = pairs.map((p, i) => {
          const h = Math.round((p.value / max) * chartH);
          const x = pad + i * barW + 6;
          const y = pad + (chartH - h);
          return `<rect x="${x}" y="${y}" width="${Math.max(4, barW-12)}" height="${h}" fill="${p.color||barColor}" />`;
        }).join('');
        const labels = pairs.map((p,i)=>{
          const x = pad + i * barW + barW/2;
          return `<text x="${x}" y="${height-pad+14}" text-anchor="middle" font-size="10" fill="#6b7280">${p.label}</text>`;
        }).join('');
        const yAxis = `<line x1="${pad-6}" y1="${pad}" x2="${pad-6}" y2="${height-pad}" stroke="#e5e7eb"/>`;
        const xAxis = `<line x1="${pad-6}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="#e5e7eb"/>`;
        const ttl = title ? `<text x="${width/2}" y="22" text-anchor="middle" font-size="14" fill="#111827">${title}</text>` : '';
        // Legend (first up to 8 items)
        const legendItems = pairs.slice(0, 8).map((p,i)=>{
          const lx = pad + (i%4)* (chartW/4);
          const ly = 30 + Math.floor(i/4)*16;
          return `<rect x="${lx}" y="${ly}" width="10" height="10" fill="${p.color||barColor}"/><text x="${lx+14}" y="${ly+10}" font-size="10" fill="#374151">${p.label}</text>`;
        }).join('');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${ttl}${legendItems}${yAxis}${xAxis}${bars}${labels}</svg>`;
      };

      const svgPieChart = (pairs, {width=400, height=300, title=''}) => {
        const cx = width/2, cy = height/2 + 10, r = Math.min(width, height)*0.35;
        const total = Math.max(1, pairs.reduce((s,p)=>s+p.value,0));
        let angle = -Math.PI/2; const slices = [];
        pairs.forEach((p)=>{
          const slice = (p.value/total) * Math.PI*2;
          const x1 = cx + r*Math.cos(angle), y1 = cy + r*Math.sin(angle);
          const x2 = cx + r*Math.cos(angle+slice), y2 = cy + r*Math.sin(angle+slice);
          const large = slice > Math.PI ? 1 : 0;
          slices.push(`<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${p.color}"/>`);
          angle += slice;
        });
        const ttl = title ? `<text x="${width/2}" y="20" text-anchor="middle" font-size="14" fill="#111827">${title}</text>` : '';
        const legend = pairs.slice(0,8).map((p,i)=>{
          const lx = 10 + (i%2)* (width/2);
          const ly = 30 + Math.floor(i/2)*16;
          return `<rect x="${lx}" y="${ly}" width="10" height="10" fill="${p.color}"/><text x="${lx+14}" y="${ly+10}" font-size="10" fill="#374151">${p.label}</text>`;
        }).join('');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${ttl}${slices.join('')}${legend}</svg>`;
      };

      const svgLineChart = (pairs, {width=800, height=300, lineColor='#2563eb', title=''}) => {
        const pad = 40; const chartW = width - pad*2; const chartH = height - pad*2;
        const max = Math.max(1, ...pairs.map(p => p.value));
        const step = chartW / Math.max(1, pairs.length-1);
        const points = pairs.map((p,i)=>{
          const x = pad + i*step;
          const y = pad + (chartH - Math.round((p.value/max)*chartH));
          return `${x},${y}`;
        }).join(' ');
        const dots = pairs.map((p,i)=>{
          const x = pad + i*step;
          const y = pad + (chartH - Math.round((p.value/max)*chartH));
          return `<circle cx="${x}" cy="${y}" r="3" fill="${p.color||lineColor}"/>`;
        }).join('');
        const xAxis = `<line x1="${pad-6}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="#e5e7eb"/>`;
        const yAxis = `<line x1="${pad-6}" y1="${pad}" x2="${pad-6}" y2="${height-pad}" stroke="#e5e7eb"/>`;
        const labels = pairs.map((p,i)=>{
          const x = pad + i*step; return `<text x="${x}" y="${height-pad+14}" text-anchor="middle" font-size="10" fill="#6b7280">${p.label}</text>`;
        }).join('');
        const ttl = title ? `<text x="${width/2}" y="22" text-anchor="middle" font-size="14" fill="#111827">${title}</text>` : '';
        const legend = pairs.slice(0,8).map((p,i)=>{
          const lx = pad + (i%4)* (chartW/4);
          const ly = 30 + Math.floor(i/4)*16;
          return `<rect x="${lx}" y="${ly}" width="10" height="10" fill="${p.color||lineColor}"/><text x="${lx+14}" y="${ly+10}" font-size="10" fill="#374151">${p.label}</text>`;
        }).join('');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${ttl}${legend}<polyline fill="none" stroke="${lineColor}" stroke-width="2" points="${points}"/>${dots}${xAxis}${yAxis}${labels}</svg>`;
      };

      const svgToPngDataUrl = async (svgString, width=800, height=300) => {
        return await new Promise((resolve) => {
          const img = new Image();
          const svg = new Blob([svgString], {type: 'image/svg+xml'});
          const url = URL.createObjectURL(svg);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,width,height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = url;
        });
      };

      // Build data pairs
      const salesPairs = (salesChartData||[]).map((d, i) => ({ label: d.name, value: Number(d.sales||0), color: ['#2563eb','#16a34a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16'][i%7] }));
      const payPairs = (paymentDistribution||[]).map((p,i)=>({ label: p.method, value: Number(p.amount||0), color: ['#06b6d4','#84cc16','#f59e0b','#ef4444'][i%4]}));
      const hourPairs = (peakHours||[]).map((h,i)=>({ label: String(h.hour).padStart(2,'0'), value: Number(h.amount||0), color: ['#8b5cf6','#2563eb','#16a34a','#f59e0b'][i%4]}));

      const salesSvg = svgLineChart(salesPairs, { title: 'Sales Trend (By Day)', width: 800, height: 300 });
      const paySvg = svgPieChart(payPairs, { title: 'Payment Amounts Share', width: 600, height: 320 });
      const hourSvg = svgBarChart(hourPairs, { title: 'Peak Hours Amount (Bar)', width: 800, height: 300 });

      const [salesPng, payPng, hourPng] = await Promise.all([
        svgToPngDataUrl(salesSvg), svgToPngDataUrl(paySvg), svgToPngDataUrl(hourSvg)
      ]);

      const imgSalesId = workbook.addImage({ base64: salesPng, extension: 'png' });
      const imgPayId = workbook.addImage({ base64: payPng, extension: 'png' });
      const imgHourId = workbook.addImage({ base64: hourPng, extension: 'png' });

      wsViz.addRow(['Sales Trend']);
      wsViz.addImage(imgSalesId, { tl: { col: 0, row: 6 }, ext: { width: 600, height: 260 } });
      wsViz.addRow([]); wsViz.addRow(['Payment Distribution']);
      wsViz.addImage(imgPayId,   { tl: { col: 0, row: 22 }, ext: { width: 480, height: 280 } });
      wsViz.addRow([]); wsViz.addRow(['Peak Hours']);
      wsViz.addImage(imgHourId,  { tl: { col: 0, row: 38 }, ext: { width: 600, height: 260 } });
      autoFit(wsViz);

      // Write file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (e) {
      console.error('Failed to export Excel:', e);
      alert('Failed to export Excel. Please ensure export libraries are installed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      console.log('Data refreshed');
    }, 1000);
  };

  // Set page title
  useEffect(() => {
    document.title = 'Sales Reports - Jolens BikeShop';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={handleSidebarToggle} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      
      <main className={`pt-15 transition-smooth ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        <div className="p-6 max-w-full">
          <Breadcrumb />
          
          {/* Report Header */}
          <ReportHeader
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            reportType={reportType}
            onReportTypeChange={handleReportTypeChange}
            customRange={customRange}
            onCustomRangeChange={handleCustomRangeChange}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onRefresh={() => {
              // Re-trigger loads by touching state
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 1000);
            }}
          />

          {/* KPI Cards */}
          <KPICards kpiData={kpiData} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SalesChart 
              data={salesChartData} 
              title="Sales Trends"
              timeframe={chartTimeframe}
              onTimeframeChange={setChartTimeframe}
            />
            <CategoryChart 
              data={categoryData} 
              title="Category Performance"
              dateRange={dateRange}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Transaction Table */}
            <div className="xl:col-span-3 space-y-6">
              <TransactionTable transactions={transactionsData} key={JSON.stringify(transactionsData)} />
            </div>
          </div>

          {/* Additional Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <BestSellers data={bestSellers} />
            <PaymentDistribution data={paymentDistribution} />
            <StaffPerformance data={staffPerformance} />
            <PeakHours data={peakHours} />
          </div>

          {/* Stock Movement */}
          <div className="space-y-6">
            <StockMovement movements={stockMovements} />
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1300">
              <div className="bg-card rounded-lg p-6 shadow-raised">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="font-body text-sm text-foreground">
                    Processing request...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesReports;