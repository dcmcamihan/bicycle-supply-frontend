import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransactionTable = ({ transactions }) => {
  // Reset all filters and pagination when transactions change
  React.useEffect(() => {
    setSearchTerm('');
    setFilterPayment('all');
    setSortField('date');
    setSortDirection('desc');
    setCurrentPage(1);
  }, [transactions]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterPayment, setFilterPayment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableTransactions = transactions || [];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Payment Methods' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Digital Wallet', label: 'Digital Wallet' }
  ];

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = tableTransactions?.filter(transaction => {
      // Safely convert searchTerm to string and handle empty/null cases
      const searchQuery = (searchTerm || '')?.toLowerCase();
      
      // If no search term, only apply payment filter
      if (!searchQuery) {
        const matchesPayment = filterPayment === 'all' || transaction?.paymentMethod === filterPayment;
        return matchesPayment;
      }
      
      // Safely convert each field to string before calling toLowerCase
      const matchesSearch = 
        (transaction?.id || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.customer || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.items || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.staff || '')?.toString()?.toLowerCase()?.includes(searchQuery);
      
      const matchesPayment = filterPayment === 'all' || transaction?.paymentMethod === filterPayment;
      
      return matchesSearch && matchesPayment;
    });

    filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (sortField === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortField === 'date') {
        // Fallback to just date if time is missing
        const aDateTime = a.date + (a.time ? ' ' + a.time : '');
        const bDateTime = b.date + (b.time ? ' ' + b.time : '');
        aValue = new Date(aDateTime);
        bValue = new Date(bDateTime);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, sortField, sortDirection, filterPayment]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTransactions?.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-success text-success-foreground';
      case 'Refunded':
        return 'bg-destructive text-destructive-foreground';
      case 'Pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground mb-1">
              Transaction History
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Detailed view of all sales transactions
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="search"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64"
            />
            
            <Select
              placeholder="Filter by payment"
              options={paymentMethodOptions}
              value={filterPayment}
              onChange={setFilterPayment}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 hover:text-primary transition-micro"
                >
                  <span>Transaction ID</span>
                  <Icon name={getSortIcon('id')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-primary transition-micro"
                >
                  <span>Date & Time</span>
                  <Icon name={getSortIcon('date')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                <button
                  onClick={() => handleSort('customer')}
                  className="flex items-center space-x-1 hover:text-primary transition-micro"
                >
                  <span>Customer</span>
                  <Icon name={getSortIcon('customer')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                Items
              </th>
              <th className="text-right p-4 font-body font-medium text-sm text-foreground">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-primary transition-micro ml-auto"
                >
                  <span>Amount</span>
                  <Icon name={getSortIcon('amount')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                Payment
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-foreground">
                Staff
              </th>
              <th className="text-center p-4 font-body font-medium text-sm text-foreground">
                Status
              </th>
              <th className="text-center p-4 font-body font-medium text-sm text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions?.map((transaction, index) => (
              <tr key={transaction?.id} className="border-b border-border hover:bg-muted/50 transition-micro">
                <td className="p-4">
                  <span className="font-data text-sm text-foreground">
                    {transaction?.id}
                  </span>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-body text-sm text-foreground">
                      {formatDate(transaction?.date)}
                    </p>
                    {transaction?.time && (
                      <p className="font-caption text-xs text-muted-foreground">
                        {transaction?.time}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {transaction?.customer}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-muted-foreground">
                    {transaction?.items}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-body text-sm font-bold text-foreground">
                    {formatCurrency(transaction?.amount)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {transaction?.paymentMethod}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {transaction?.staff}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction?.status)}`}>
                    {transaction?.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Eye"
                      iconSize={14}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Printer"
                      iconSize={14}
                    >
                      Print
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions?.length)} of {filteredAndSortedTransactions?.length} transactions
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                iconName="ChevronLeft"
                iconSize={16}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                iconName="ChevronRight"
                iconSize={16}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;