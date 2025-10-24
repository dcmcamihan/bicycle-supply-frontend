import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricsCard from './components/MetricsCard';
import SalesChart from './components/SalesChart';
import QuickActions from './components/QuickActions';
import RecentTransactions from './components/RecentTransactions';
import LowStockAlert from './components/LowStockAlert';
import ActivityFeed from './components/ActivityFeed';
import Icon from '../../components/AppIcon';
import API_ENDPOINTS from '../../config/api';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaySales, setTodaySales] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const prodsRes = await fetch(API_ENDPOINTS.PRODUCTS);
        const prods = prodsRes.ok ? await prodsRes.json() : [];
        const qohPromises = prods.map(async (p) => {
          try {
            const r = await fetch(`${API_ENDPOINTS.PRODUCT(p.product_id || p.id)}/quantity-on-hand`);
            if (r.ok) {
              const n = await r.json();
              return { id: p.product_id || p.id, qoh: Number(n) || 0, reorder: Number(p.reorder_level || 0) };
            }
          } catch {}
          return { id: p.product_id || p.id, qoh: 0, reorder: Number(p.reorder_level || 0) };
        });
        const qohList = await Promise.all(qohPromises);
        const totalInv = qohList.reduce((s, x) => s + (x.qoh || 0), 0);
        const lowCount = qohList.reduce((s, x) => s + ((x.qoh || 0) <= (x.reorder || 0) ? 1 : 0), 0);
        setTotalInventory(totalInv);
        setLowStockCount(lowCount);

        const priceMap = new Map(prods.map(p => [Number(p.product_id || p.id), Number(p.price || 0)]));
        const salesRes = await fetch(API_ENDPOINTS.SALES);
        const sales = salesRes.ok ? await salesRes.json() : [];
        const today = new Date();
        const startToday = new Date(today); startToday.setHours(0,0,0,0);
        const endToday = new Date(today); endToday.setHours(23,59,59,999);

        let todayTotal = 0;
        let pending = 0;
        for (const s of sales) {
          const saleId = s.sale_id || s.id;
          const d = new Date(s.sale_date || s.date || s.created_at);
          try {
            const payRes = await fetch(API_ENDPOINTS.SALE_PAYMENT_TYPES_BY_SALE(saleId));
            if (!payRes.ok) {
              pending += 1;
            } else {
              const pays = await payRes.json();
              if (!Array.isArray(pays) || pays.length === 0) pending += 1;
            }
          } catch {
            pending += 1;
          }

          if (!isNaN(d) && d >= startToday && d <= endToday) {
            let sum = 0;
            try {
              const detRes = await fetch(API_ENDPOINTS.SALE_DETAILS(saleId));
              if (detRes.ok) {
                const dets = await detRes.json();
                sum = dets.reduce((acc, det) => {
                  const pid = Number(det.product_id);
                  const qty = Number(det.quantity_sold || det.quantity || 0);
                  const price = priceMap.get(pid) || 0;
                  return acc + (price * qty);
                }, 0);
              }
            } catch {}
            todayTotal += sum;
          }
        }
        setTodaySales(todayTotal);
        setPendingOrders(pending);
      } catch {
        setTodaySales(0);
        setTotalInventory(0);
        setLowStockCount(0);
        setPendingOrders(0);
      }
    };
    loadMetrics();
  }, []);

  const metricsData = [
    {
      title: "Today\'s Sales",
      value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(todaySales || 0),
      icon: "DollarSign",
      color: "primary"
    },
    {
      title: "Total Inventory",
      value: String(totalInventory || 0),
      icon: "Package",
      color: "success"
    },
    {
      title: "Low Stock Items",
      value: String(lowStockCount || 0),
      icon: "AlertTriangle",
      color: "warning"
    },
    {
      title: "Pending Orders",
      value: String(pendingOrders || 0),
      icon: "Clock",
      color: "accent"
    }
  ];

  const user = {
    name: 'John Doe',
    role: 'Store Manager',
    email: 'john@bikeshoppro.com'
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Jolens BikeShop</title>
        <meta name="description" content="Jolens BikeShop dashboard with real-time business insights, sales metrics, and inventory management tools for bicycle shop operations." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header onSidebarToggle={handleSidebarToggle} user={user} />
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
        
        <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <Breadcrumb />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                    Dashboard
                  </h1>
                  <p className="font-body text-muted-foreground">
                    Welcome back, {user?.name}. Here's what's happening at your bike shop today.
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} />
                    <span className="font-caption">
                      {currentTime?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={16} />
                    <span className="font-caption">
                      {currentTime?.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {metricsData?.map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  changeType={metric?.changeType}
                  icon={metric?.icon}
                  color={metric?.color}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Sales Chart - Takes 2 columns on xl screens */}
              <div className="xl:col-span-2">
                <SalesChart />
              </div>
              
              {/* Quick Actions - Takes 1 column */}
              <div>
                <QuickActions />
              </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* Recent Transactions */}
              <div>
                <RecentTransactions />
              </div>
              
              {/* Low Stock Alerts */}
              <div>
                <LowStockAlert />
              </div>
              
              {/* Activity Feed */}
              <div>
                <ActivityFeed />
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Bike" size={20} color="white" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground">Jolens BikeShop</p>
                    <p className="font-caption text-xs text-muted-foreground">
                      Streamlining bicycle retail operations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="font-caption">System Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Wifi" size={16} />
                    <span className="font-caption">Connected</span>
                  </div>
                  <div className="font-caption">
                    © {new Date()?.getFullYear()} Jolens BikeShop. All rights reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;