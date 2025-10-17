import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductSearch from './components/ProductSearch';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ShoppingCart from './components/ShoppingCart';
import CustomerLookup from './components/CustomerLookup';
import PaymentMethods from './components/PaymentMethods';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PointOfSale = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: "Trek Domane AL 2 Road Bike",
      sku: "TRK-DOM-AL2-BLK",
      price: 899.99,
      stock: 5,
      category: "road",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Specialized Rockhopper 29",
      sku: "SPZ-RCK-29-RED",
      price: 650.00,
      stock: 8,
      category: "mountain",
      image: "https://images.unsplash.com/photo-1544191696-15693072b5a5?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Giant Escape 3 Hybrid",
      sku: "GNT-ESC-3-BLU",
      price: 480.00,
      stock: 12,
      category: "hybrid",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Cannondale Quick CX 3",
      sku: "CND-QCX-3-GRY",
      price: 750.00,
      stock: 3,
      category: "hybrid",
      image: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=400&h=400&fit=crop"
    },
    {
      id: 5,
      name: "Scott Scale 970",
      sku: "SCT-SCL-970-GRN",
      price: 1299.99,
      stock: 2,
      category: "mountain",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop"
    },
    {
      id: 6,
      name: "Bianchi Via Nirone 7",
      sku: "BNC-VN7-WHT",
      price: 1150.00,
      stock: 0,
      category: "road",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop"
    },
    {
      id: 7,
      name: "Helmet - Giro Register",
      sku: "GRO-REG-BLK-M",
      price: 45.00,
      stock: 25,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop"
    },
    {
      id: 8,
      name: "Water Bottle - Specialized",
      sku: "SPZ-WB-BLU",
      price: 12.99,
      stock: 50,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop"
    }
  ];

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
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
  const filteredProducts = mockProducts?.filter(product => {
    const matchesSearch = product?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         product?.sku?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product?.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Barcode scanning removed

  const handleAddToCart = (product) => {
    const existingItem = cartItems?.find(item => item?.id === product?.id);
    
    if (existingItem) {
      if (existingItem?.quantity < product?.stock) {
        setCartItems(cartItems?.map(item =>
          item?.id === product?.id
            ? { ...item, quantity: item?.quantity + 1 }
            : item
        ));
      } else {
        alert('Not enough stock available');
      }
    } else {
      if (product?.stock > 0) {
        setCartItems([...cartItems, { ...product, quantity: 1 }]);
      } else {
        alert('Product is out of stock');
      }
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = mockProducts?.find(p => p?.id === productId);
    if (newQuantity <= product?.stock) {
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
    setLastTransaction({
      ...paymentData,
      items: [...cartItems],
      customer: selectedCustomer,
      transactionId: `TXN-${Date.now()}`
    });
    setShowPaymentSuccess(true);
    setCartItems([]);
    setSelectedCustomer(null);
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
                  />
                </div>
                {/* Right Panel - Cart & Checkout (40% width on desktop) */}
                <div className="xl:col-span-2 space-y-6">
                  <CustomerLookup
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={handleCustomerSelect}
                    onCustomerClear={handleCustomerClear}
                  />
                  
                  <div className="h-96">
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