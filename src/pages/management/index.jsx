import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';

const ManagementDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const managementLinks = [
    {
      title: 'Categories',
      description: 'Manage product categories and subcategories',
      path: '/management/categories',
      icon: 'Tag'
    },
    {
      title: 'Brands',
      description: 'Manage product brands and manufacturers',
      path: '/management/brands',
      icon: 'Bookmark'
    },
    {
      title: 'Suppliers',
      description: 'Manage product suppliers and vendor relationships',
      path: '/management/suppliers',
      icon: 'Truck'
    },
    {
      title: 'Employees',
      description: 'Manage employee information and roles',
      path: '/management/employees',
      icon: 'Users'
    },
    {
      title: 'Attendance',
      description: 'Track and manage employee attendance',
      path: '/management/attendance',
      icon: 'Calendar'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileSidebarToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={(isOpen) => setMobileMenuOpen(isOpen)}
      />
      
      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
              <Breadcrumb />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Management Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your store's categories, brands, suppliers, employees, and attendance
              </p>
            </div>

            {/* Management Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {managementLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block p-4 sm:p-6 rounded-lg border border-border bg-card hover:border-primary transition-colors"
                >
                  <div className="flex items-center mb-4 gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl text-primary">{/* Icon component */}</span>
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">{link.title}</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">{link.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    <span className="hidden sm:inline">Manage {link.title}</span>
                    <span className="sm:hidden">Manage</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagementDashboard;