import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../config/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ReportHeader from './components/ReportHeader';
import KPICards from './components/KPICards';
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
  const [dateRange, setDateRange] = useState('last7days');
  const [reportType, setReportType] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

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
        const avgOrder = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
        const topProductsCount = productCountMap.size;
        setKpiData(prev => prev.map(kpi => {
          if (kpi.title === 'Total Sales') return { ...kpi, value: totalSales };
          if (kpi.title === 'Transactions') return { ...kpi, value: filteredSales.length };
          if (kpi.title === 'Average Order') return { ...kpi, value: avgOrder };
          if (kpi.title === 'Top Products') return { ...kpi, value: topProductsCount };
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

  // Real sales chart data from API
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
        // Group by day of week
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartMap = {
          'Mon': { sales: 0, transactions: 0, avgOrder: 0 },
          'Tue': { sales: 0, transactions: 0, avgOrder: 0 },
          'Wed': { sales: 0, transactions: 0, avgOrder: 0 },
          'Thu': { sales: 0, transactions: 0, avgOrder: 0 },
          'Fri': { sales: 0, transactions: 0, avgOrder: 0 },
          'Sat': { sales: 0, transactions: 0, avgOrder: 0 },
          'Sun': { sales: 0, transactions: 0, avgOrder: 0 }
        };
        for (const sale of filteredSales) {
          const dateObj = new Date(sale.sale_date);
          const dayName = weekDays[dateObj.getDay()];
          let totalAmount = 0;
          try {
            const { totalAmount: amt } = await getSaleDetailsAndAmount(sale.sale_id);
            totalAmount = amt;
          } catch {
            totalAmount = 0;
          }
          chartMap[dayName].sales += totalAmount;
          chartMap[dayName].transactions += 1;
        }
        // Calculate avgOrder for each day
        for (const day of weekDays) {
          const t = chartMap[day].transactions;
          chartMap[day].avgOrder = t > 0 ? chartMap[day].sales / t : 0;
        }
        // Set in Mon-Sun order
        setSalesChartData([
          { name: 'Mon', ...chartMap['Mon'] },
          { name: 'Tue', ...chartMap['Tue'] },
          { name: 'Wed', ...chartMap['Wed'] },
          { name: 'Thu', ...chartMap['Thu'] },
          { name: 'Fri', ...chartMap['Fri'] },
          { name: 'Sat', ...chartMap['Sat'] },
          { name: 'Sun', ...chartMap['Sun'] }
        ]);
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
  }, [dateRange]);

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
    setDateRange(newRange);
    // In a real app, this would trigger data refetch
    console.log('Date range changed to:', newRange);
  };

  const handleReportTypeChange = (newType) => {
    setReportType(newType);
    // In a real app, this would trigger data refetch
    console.log('Report type changed to:', newType);
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exporting PDF report...');
    setIsLoading(false);
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exporting Excel report...');
    setIsLoading(false);
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
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onRefresh={handleRefresh}
          />

          {/* KPI Cards */}
          <KPICards kpiData={kpiData} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SalesChart 
              data={salesChartData} 
              title="Sales Trends"
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
            <div className="xl:col-span-4">
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