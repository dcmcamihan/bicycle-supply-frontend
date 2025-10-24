import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const HelpSupport = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const faqs = [
    { q: 'How do I add a new product?', a: 'Go to Inventory > Add Product and fill in the required details. After creating, you can restock via Create Purchase Order.' },
    { q: 'How can I process a sale?', a: 'Open Point of Sale, scan or search products, then proceed to payment and receipt.' },
    { q: 'Who can change settings?', a: 'Only users with the Manager role can change global settings. Individual preferences are per-user.' },
    { q: 'How do I reorder low-stock items?', a: 'From Inventory, use Low Stock Alerts > Reorder to open a prefilled purchase order modal.' },
    { q: 'How do I reset my password?', a: 'Use Forgot Password on the login screen. You will receive a reset token to set a new password.' },
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
                <a href={`mailto:support@bikeshoppro.com?subject=${encodeURIComponent('Support Request')}&body=${encodeURIComponent('Describe your issue or question here.')}`} className="inline-block">
                  <Button variant="outline" iconName="Mail" iconPosition="left" iconSize={16}>Email Support</Button>
                </a>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="BookOpen" size={16} />
                  <div className="font-medium">Documentation</div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Read guides and best practices.</div>
                <a href="#docs" onClick={(e)=>e.preventDefault()} className="text-primary font-medium text-sm">User Guide (coming soon)</a>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="AlertTriangle" size={16} />
                  <div className="font-medium">Report an Issue</div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Found a bug or need urgent help? Send us diagnostics.</div>
                <a href={`mailto:support@bikeshoppro.com?subject=${encodeURIComponent('Bug Report')}&body=${encodeURIComponent('Describe the problem, steps to reproduce, and screenshots/attachments if any.')}`} className="inline-block">
                  <Button variant="outline" iconName="Bug" iconPosition="left" iconSize={16}>Report a Bug</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpSupport;


