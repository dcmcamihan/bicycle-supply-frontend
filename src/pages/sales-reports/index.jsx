import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ReportHeader from './components/ReportHeader';
import KPICards from './components/KPICards';
import SalesChart from './components/SalesChart';
import CategoryChart from './components/CategoryChart';
import TransactionTable from './components/TransactionTable';
import InsightsPanel from './components/InsightsPanel';

const SalesReports = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('last7days');
  const [reportType, setReportType] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

  // Mock KPI data
  const kpiData = [
    {
      title: 'Total Sales',
      value: 128450,
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
  ];

  // Mock sales chart data
  const salesChartData = [
    { name: 'Mon', sales: 12500, transactions: 45, avgOrder: 278 },
    { name: 'Tue', sales: 15200, transactions: 52, avgOrder: 292 },
    { name: 'Wed', sales: 18900, transactions: 61, avgOrder: 310 },
    { name: 'Thu', sales: 16700, transactions: 48, avgOrder: 348 },
    { name: 'Fri', sales: 22100, transactions: 67, avgOrder: 330 },
    { name: 'Sat', sales: 28500, transactions: 89, avgOrder: 320 },
    { name: 'Sun', sales: 19800, transactions: 58, avgOrder: 341 }
  ];

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        const response = await fetch('http://localhost:3000/api/sales');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();

        // Fetch customer names for each transaction
        const mapped = await Promise.all(data.map(async item => {
          let customerName = 'N/A';
          if (item.customer_id) {
            try {
              const custRes = await fetch(`http://localhost:3000/api/customers/${item.customer_id}`);
              if (custRes.ok) {
                const custData = await custRes.json();
                customerName = `${custData.first_name} ${custData.middle_name ? custData.middle_name + ' ' : ''}${custData.last_name}`;
              }
            } catch (err) {
              customerName = `Customer #${item.customer_id}`;
            }
          }
          return {
            id: item.sale_id,
            date: item.sale_date ? new Date(item.sale_date).toISOString().split('T')[0] : '',
            customer: customerName,
            amount: item.amount ?? 0,
            items: item.items ?? 1,
            status: item.status ?? 'completed',
            cashier: item.cashier,
            manager: item.manager
          };
        }));
        setTransactionsData(mapped);
        setTransactionsError(null);
      } catch (error) {
        setTransactionsError(error.message);
        setTransactionsData([]);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

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
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Transaction Table */}
            <div className="xl:col-span-3">
              <TransactionTable transactions={transactionsData} />
            </div>

            {/* Insights Panel */}
            <div className="xl:col-span-1">
              <InsightsPanel insights={insightsData} />
            </div>
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