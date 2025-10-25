import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../config/api';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductSearch from './components/ProductSearch';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ShoppingCart from './components/ShoppingCart';
import PaymentMethods from './components/PaymentMethods';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getCart, saveCart } from '../../utils/posCart';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const PointOfSale = () => {
  // Payment methods from API
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PAYMENT_METHODS || 'http://localhost:3000/api/payment-methods');
        if (!res.ok) throw new Error('Failed to fetch payment methods');
        const data = await res.json();
        setPaymentMethods(data);
      } catch {
        setPaymentMethods([]);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Fetch employees for cashier dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.EMPLOYEES);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState(() => getCart());
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [cashierId, setCashierId] = useState('');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Products fetched from API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
  const response = await fetch(API_ENDPOINTS.PRODUCTS);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // Map API data to expected format for POS
        const mappedProducts = await Promise.all(
          data.map(async item => {
            let stock = 0;
            try {
              const stockRes = await fetch(`${API_ENDPOINTS.PRODUCT(item.product_id)}/quantity-on-hand`);
              if (stockRes.ok) {
                stock = await stockRes.json();
              }
            } catch (err) {
              stock = 0;
            }
            // Ensure stock is never less than 0
            stock = stock < 0 ? 0 : stock;
            return {
              id: item.product_id,
              name: item.product_name,
              price: parseFloat(item.price),
              category: item.category_code,
              brand_id: item.brand_id,
              image_url: item.image_url || '',
              stock
            };
          })
        );
        setProducts(mappedProducts);
        setProductsError(null);
      } catch (error) {
        setProductsError(error.message);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
  const response = await fetch(API_ENDPOINTS.CATEGORIES);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);



  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    if ((!searchTerm || searchTerm.trim() === '') && (activeCategory === 'all' || !activeCategory)) {
      return [...products];
    }
    return products.filter(product => {
      const matchesSearch = (
        (product?.name?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
        (product?.id?.toString() || '').includes(searchTerm || '')
      );
      const matchesCategory = activeCategory === 'all' || product?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  // Debug logs to help diagnose issues
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('products:', products);
    // eslint-disable-next-line no-console
    console.log('filteredProducts:', filteredProducts);
    // eslint-disable-next-line no-console
    console.log('searchTerm:', searchTerm, 'activeCategory:', activeCategory);
  }, [products, filteredProducts, searchTerm, activeCategory]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Barcode scanning removed

  const handleAddToCart = (product) => {
    const existingItem = cartItems?.find(item => item?.id === product?.id);
    if (existingItem) {
      if (existingItem?.quantity < (product?.stock ?? 10)) {
        setCartItems(cartItems?.map(item =>
          item?.id === product?.id
            ? { ...item, quantity: item?.quantity + 1 }
            : item
        ));
      } else {
        alert('Not enough stock available');
      }
    } else {
      if ((product?.stock ?? 10) > 0) {
        setCartItems([...cartItems, { ...product, quantity: 1 }]);
      } else {
        alert('Product is out of stock');
      }
    }
  };

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      saveCart(cartItems);
    } catch (e) {}
  }, [cartItems]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products?.find(p => p?.id === productId);
    if (newQuantity <= (product?.stock ?? 10)) {
      setCartItems(cartItems?.map(item =>
        item?.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      alert('Not enough stock available');
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems?.filter(item => item?.id !== productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCartItems([]);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerClear = () => {
    setSelectedCustomer(null);
  };

  const handlePaymentComplete = (paymentData) => {
    (async () => {
      // Validate cashier selection
      if (!cashierId) {
        alert('Please select a cashier before completing payment.');
        return;
      }

      // Resolve customer_id
      let customerIdToUse = selectedCustomer?.id || null;
      if (!customerIdToUse && customerName && customerName.trim().length > 0) {
        // Create a basic customer record
        const parts = customerName.trim().split(/\s+/);
        const first_name = parts[0] || 'Customer';
        const last_name = parts.slice(1).join(' ') || 'Walk-in';
        try {
          const custRes = await fetch(API_ENDPOINTS.CUSTOMERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name, last_name })
          });
          if (!custRes.ok) throw new Error(await custRes.text());
          const cust = await custRes.json();
          customerIdToUse = cust.customer_id || cust.id;
        } catch (err) {
          alert('Failed to create customer: ' + err.message);
          return;
        }
      }

      // 1. POST Sale
      const salePayload = {
        customer_id: customerIdToUse || null,
        sale_date: new Date().toISOString(),
        cashier: parseInt(cashierId),
        manager: 13 // Keep static manager for now
      };
      let saleId;
      // Generate transaction ID now so it can be used as reference_number
      const transactionId = `TXN-${Date.now()}`;
      try {
        // Debug log
        console.log('POST /api/sales payload:', salePayload);
        const saleRes = await fetch(API_ENDPOINTS.SALES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salePayload)
        });
        const saleResText = await saleRes.text();
        console.log('POST /api/sales response:', saleResText);
        if (!saleRes.ok) throw new Error('Failed to create sale: ' + saleResText);
        const saleData = JSON.parse(saleResText);
        saleId = saleData.sale_id || saleData.id || saleData[0]?.sale_id;
      } catch (err) {
        alert('Error creating sale: ' + err.message);
        return;
      }

      // 2. POST Sale Details
      try {
        for (const item of cartItems) {
          const saleDetailPayload = {
            sale_id: saleId,
            product_id: item.id,
            quantity_sold: item.quantity
          };
          console.log('POST /api/sale-details payload:', saleDetailPayload);
          const saleDetailsRes = await fetch('http://localhost:3000/api/sale-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleDetailPayload)
          });
          const saleDetailsResText = await saleDetailsRes.text();
          console.log('POST /api/sale-details response:', saleDetailsResText);
          if (!saleDetailsRes.ok) throw new Error('Failed to create sale details: ' + saleDetailsResText);
        }
      } catch (err) {
        alert('Error creating sale details: ' + err.message);
        return;
      }

      // 3. POST Sale Payment Type
      try {
        // Map payment method label to code
        let paymentMethodCode = 'CASH';
        if (paymentData.method) {
          // Find code by label (case-insensitive)
          const found = paymentMethods.find(pm => pm.description?.toLowerCase() === paymentData.method.toLowerCase() || pm.payment_method_code?.toLowerCase() === paymentData.method.toLowerCase());
          paymentMethodCode = found?.payment_method_code || paymentData.method.toUpperCase();
        }
        // Debug: log all available codes and the one being sent
        console.log('Available payment method codes:', paymentMethods.map(pm => pm.payment_method_code));
        console.log('Selected payment method code:', paymentMethodCode);
        const paymentTypePayload = {
          sale_id: saleId,
          payment_method_code: paymentMethodCode,
          reference_number: transactionId
        };
        console.log('POST /api/sale-payment-types payload:', paymentTypePayload);
        const paymentTypeRes = await fetch(API_ENDPOINTS.SALE_PAYMENT_TYPES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentTypePayload)
        });
        const paymentTypeResText = await paymentTypeRes.text();
        console.log('POST /api/sale-payment-types response:', paymentTypeResText);
        if (!paymentTypeRes.ok) throw new Error('Failed to create sale payment type: ' + paymentTypeResText);
      } catch (err) {
        alert('Error creating sale payment type: ' + err.message);
        return;
      }

      // 4. Show payment success
      setLastTransaction({
        ...paymentData,
        items: [...cartItems],
        customer: selectedCustomer || (customerName ? { name: customerName } : null),
        transactionId
      });
      setShowPaymentSuccess(true);
      setCartItems([]);
      setSelectedCustomer(null);
      setCustomerName('');
    })();
  };

  const handleNewTransaction = () => {
    setShowPaymentSuccess(false);
    setLastTransaction(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const cartTotal = cartItems?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);

  return (
    <>
      <Helmet>
        <title>Point of Sale - Jolens BikeShop</title>
        <meta name="description" content="Process customer transactions with our intuitive point of sale system" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-6">
            <Breadcrumb />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-3xl text-foreground">Point of Sale</h1>
                <p className="font-body text-muted-foreground mt-1">
                  Process customer transactions and manage sales
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-caption text-xs text-muted-foreground">Today's Date</p>
                  <p className="font-data text-sm text-foreground">
                    {new Date()?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {showPaymentSuccess ? (
              // Payment Success Screen
              (<div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-lg p-8 shadow-raised text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="CheckCircle" size={32} className="text-success" />
                  </div>
                  
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                    Payment Successful!
                  </h2>
                  
                  <p className="font-body text-muted-foreground mb-6">
                    Transaction completed successfully
                  </p>
                  
                  {lastTransaction && (
                    <div className="bg-muted border border-border rounded-lg p-4 mb-6 text-left">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <p className="font-data font-medium">{lastTransaction?.transactionId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment Method:</span>
                          <p className="font-medium">{lastTransaction?.method}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-heading font-bold text-primary">
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'PHP'
                            })?.format(lastTransaction?.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p className="font-medium">
                            {lastTransaction?.items?.reduce((sum, item) => sum + item?.quantity, 0)} items
                          </p>
                        </div>
                      </div>
                      
                      {lastTransaction?.customer && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <span className="text-muted-foreground">Customer:</span>
                          <p className="font-medium">{lastTransaction?.customer?.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handlePrintReceipt}
                      iconName="Printer"
                      iconPosition="left"
                      iconSize={20}
                    >
                      Print Receipt
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={handleNewTransaction}
                      iconName="Plus"
                      iconPosition="left"
                      iconSize={20}
                    >
                      New Transaction
                    </Button>
                  </div>
                </div>
              </div>)
            ) : (
              // Main POS Interface
              (<div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Left Panel - Products (60% width on desktop) */}
                <div className="xl:col-span-3 space-y-6">
                  <ProductSearch 
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                  />
                  
                  <CategoryFilter
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                  
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                    loading={loadingProducts}
                  />
                </div>
                {/* Right Panel - Cart & Checkout (40% width on desktop) */}
                <div className="xl:col-span-2 space-y-6">

                  {/* Customer Name (optional) and Cashier selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Customer Name (optional)"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e?.target?.value)}
                      placeholder="Enter customer full name"
                    />
                    <Select
                      label="Cashier"
                      options={(employees || []).map(e => ({ value: String(e.employee_id), label: `${e.first_name} ${e.last_name}` }))}
                      value={cashierId}
                      onChange={(val) => setCashierId(val)}
                      placeholder="Select cashier"
                      required
                    />
                  </div>

                  <div className="h-[32rem]">
                    <ShoppingCart
                      cartItems={cartItems}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      onClearCart={handleClearCart}
                    />
                  </div>

                  <PaymentMethods
                    total={cartTotal}
                    onPaymentComplete={handlePaymentComplete}
                    disabled={cartItems?.length === 0}
                  />
                </div>
              </div>)
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default PointOfSale;