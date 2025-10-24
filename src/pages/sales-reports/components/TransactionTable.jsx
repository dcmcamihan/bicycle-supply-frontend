import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import API_ENDPOINTS from '../../../config/api';

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

  // Modal state for view/print
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalData, setModalData] = useState(null); // { sale, items: [{name, qty, price, total}], totals }

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const loadTransactionDetails = async (saleId) => {
    setModalLoading(true);
    setModalError('');
    try {
      const sale = await fetchJson(`${API_ENDPOINTS.SALES}/${saleId}`);
      const details = await fetchJson(API_ENDPOINTS.SALE_DETAILS(saleId));
      const items = [];
      let grandTotal = 0;
      for (const d of details) {
        try {
          const p = await fetchJson(API_ENDPOINTS.PRODUCT(d.product_id));
          const price = Number(p.price || 0);
          const qty = Number(d.quantity_sold || d.quantity || 0);
          const total = price * qty;
          grandTotal += total;
          items.push({ name: p.product_name, qty, price, total });
        } catch {
          const qty = Number(d.quantity_sold || d.quantity || 0);
          items.push({ name: `Product #${d.product_id}`, qty, price: 0, total: 0 });
        }
      }
      setModalData({ sale, items, grandTotal });
    } catch (e) {
      setModalError(e?.message || 'Failed to load transaction');
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleView = async (tx) => {
    setShowModal(true);
    await loadTransactionDetails(tx.id);
  };

  const handlePrint = async (tx) => {
    // Ensure data is loaded
    if (!modalData || modalData?.sale?.sale_id !== tx.id) {
      await loadTransactionDetails(tx.id);
    }
    const data = modalData;
    if (!data) return;
    const w = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    if (!w) return;
    const rows = (data.items || []).map(i => `
      <tr>
        <td style="padding:6px;border:1px solid #e5e7eb;">${i.name}</td>
        <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${i.qty}</td>
        <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">₱${i.price.toLocaleString()}</td>
        <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">₱${i.total.toLocaleString()}</td>
      </tr>
    `).join('');
    w.document.write(`
      <html>
      <head><title>Transaction #${tx.id}</title></head>
      <body style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#111827;">
        <h2>Transaction #${tx.id}</h2>
        <p>Date: ${tx.date || ''} ${tx.time || ''}</p>
        <p>Customer: ${tx.customer || 'N/A'}</p>
        <table style="border-collapse:collapse;width:100%;margin-top:12px;">
          <thead>
            <tr>
              <th style="padding:6px;border:1px solid #e5e7eb;text-align:left;">Item</th>
              <th style="padding:6px;border:1px solid #e5e7eb;text-align:right;">Qty</th>
              <th style="padding:6px;border:1px solid #e5e7eb;text-align:right;">Price</th>
              <th style="padding:6px;border:1px solid #e5e7eb;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:6px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">Grand Total</td>
              <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">₱${Number(data.grandTotal||0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const [paymentMethodOptions, setPaymentMethodOptions] = useState([
    { value: 'all', label: 'All Payment Methods' }
  ]);

  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PAYMENT_METHODS);
        if (!res.ok) throw new Error('Failed to fetch payment methods');
        const data = await res.json();
        const options = [
          { value: 'all', label: 'All Payment Methods' },
          ...data.map(pm => ({ value: pm.name, label: pm.name }))
        ];
        setPaymentMethodOptions(options);
      } catch {
        setPaymentMethodOptions([{ value: 'all', label: 'All Payment Methods' }]);
      }
    };
    fetchPaymentMethods();
  }, []);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = tableTransactions?.filter(transaction => {
      // Safely convert searchTerm to string and handle empty/null cases
      const searchQuery = (searchTerm || '')?.toLowerCase();

      // Case-insensitive payment method filter
      const transactionPayment = (transaction?.paymentMethod || '').toLowerCase();
      const filterPaymentLower = (filterPayment || '').toLowerCase();

      // If no search term, only apply payment filter
      if (!searchQuery) {
        const matchesPayment = filterPaymentLower === 'all' || transactionPayment === filterPaymentLower;
        return matchesPayment;
      }

      // Safely convert each field to string before calling toLowerCase
      const matchesSearch = 
        (transaction?.id || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.customer || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.items || '')?.toString()?.toLowerCase()?.includes(searchQuery) ||
        (transaction?.staff || '')?.toString()?.toLowerCase()?.includes(searchQuery);

      const matchesPayment = filterPaymentLower === 'all' || transactionPayment === filterPaymentLower;

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
                    {transaction?.paymentMethod ? transaction.paymentMethod : 'N/A'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {transaction?.staff}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Eye"
                      iconSize={14}
                      onClick={() => handleView(transaction)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Printer"
                      iconSize={14}
                      onClick={() => handlePrint(transaction)}
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

      {/* Details Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1100" onClick={() => setShowModal(false)}></div>
          <div className="fixed inset-0 z-1200 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-raised">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-heading text-lg font-semibold text-foreground">Transaction Details</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} iconName="X" iconSize={18} />
              </div>
              <div className="p-4">
                {modalLoading && (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
                {modalError && (
                  <p className="text-sm text-destructive">{modalError}</p>
                )}
                {(!modalLoading && !modalError && modalData) && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <p className="font-medium">{modalData?.sale?.sale_id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">{modalData?.sale?.sale_date ? new Date(modalData.sale.sale_date).toLocaleString() : ''}</p>
                      </div>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Item</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(modalData.items||[]).map((it, idx) => (
                            <tr key={idx} className="border-t border-border">
                              <td className="p-2">{it.name}</td>
                              <td className="p-2 text-right">{it.qty}</td>
                              <td className="p-2 text-right">₱{Number(it.price||0).toLocaleString()}</td>
                              <td className="p-2 text-right">₱{Number(it.total||0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border">
                            <td className="p-2 text-right font-semibold" colSpan={3}>Grand Total</td>
                            <td className="p-2 text-right font-semibold">₱{Number(modalData.grandTotal||0).toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
                <Button variant="default" iconName="Printer" iconSize={16} onClick={() => modalData && handlePrint({ id: modalData?.sale?.sale_id, date: '', time: '', customer: '' })}>Print</Button>
              </div>
            </div>
          </div>
        </>
      )}

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