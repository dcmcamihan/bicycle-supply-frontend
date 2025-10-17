import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CustomerLookup = ({ selectedCustomer, onCustomerSelect, onCustomerClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Mock customer data
  const mockCustomers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      loyaltyPoints: 250,
      totalPurchases: 1850.75,
      lastVisit: "2025-01-20"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "(555) 987-6543",
      loyaltyPoints: 180,
      totalPurchases: 920.50,
      lastVisit: "2025-01-18"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "(555) 456-7890",
      loyaltyPoints: 420,
      totalPurchases: 2340.25,
      lastVisit: "2025-01-22"
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value?.length >= 2) {
      setIsSearching(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = mockCustomers?.filter(customer =>
          customer?.name?.toLowerCase()?.includes(value?.toLowerCase()) ||
          customer?.email?.toLowerCase()?.includes(value?.toLowerCase()) ||
          customer?.phone?.includes(value)
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setSearchTerm('');
    setSearchResults([]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm text-foreground">Customer</h3>
        {selectedCustomer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCustomerClear}
            iconName="X"
            iconSize={16}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear
          </Button>
        )}
      </div>
      {selectedCustomer ? (
        <div className="bg-muted border border-border rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-body font-semibold text-foreground">{selectedCustomer?.name}</h4>
              <p className="font-caption text-xs text-muted-foreground">{selectedCustomer?.email}</p>
              <p className="font-caption text-xs text-muted-foreground">{selectedCustomer?.phone}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={14} className="text-accent" />
                <span className="font-data text-xs text-accent font-medium">
                  {selectedCustomer?.loyaltyPoints} pts
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Total Purchases:</span>
                <p className="font-medium text-foreground">{formatCurrency(selectedCustomer?.totalPurchases)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Visit:</span>
                <p className="font-medium text-foreground">{selectedCustomer?.lastVisit}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e?.target?.value)}
            className="w-full"
          />
          
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Icon name="Loader2" size={16} className="text-muted-foreground animate-spin" />
            </div>
          )}
          
          {searchResults?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-raised z-50 max-h-48 overflow-y-auto">
              {searchResults?.map((customer) => (
                <button
                  key={customer?.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full p-3 text-left hover:bg-muted transition-micro border-b border-border last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-body font-medium text-sm text-foreground">{customer?.name}</h4>
                      <p className="font-caption text-xs text-muted-foreground">{customer?.email}</p>
                      <p className="font-caption text-xs text-muted-foreground">{customer?.phone}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={12} className="text-accent" />
                      <span className="font-data text-xs text-accent">{customer?.loyaltyPoints}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerLookup;