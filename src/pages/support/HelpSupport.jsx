import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const HelpSupport = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const faqs = [
    { q: 'How do I add a new product?', a: 'Go to Inventory > Add Product and fill in the details.' },
    { q: 'How can I process a sale?', a: 'Open the Point of Sale page, add items to the cart, and complete payment.' },
    { q: 'Who can change settings?', a: 'Only users with the Manager role can change global settings.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-5xl">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl mb-2">Help & Support</h1>
          <p className="font-body text-muted-foreground mb-6">Find answers and contact support.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {faqs.map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="font-medium mb-1">{item.q}</div>
                  <div className="text-sm text-muted-foreground">{item.a}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Mail" size={16} />
                  <div className="font-medium">Contact Us</div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Email our support team for assistance.</div>
                <a href="mailto:support@bikeshoppro.com" className="inline-block">
                  <Button variant="outline" iconName="Mail" iconPosition="left" iconSize={16}>Email Support</Button>
                </a>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="BookOpen" size={16} />
                  <div className="font-medium">Documentation</div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Read guides and best practices.</div>
                <a href="#" onClick={(e)=>e.preventDefault()} className="text-primary font-medium text-sm">Coming soon</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpSupport;


