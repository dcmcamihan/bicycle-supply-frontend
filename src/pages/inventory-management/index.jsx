import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import InventoryTable from './components/InventoryTable';
import InventoryFilters from './components/InventoryFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import InventorySidebar from './components/InventorySidebar';
import ProductModal from './components/ProductModal';
import MobileInventoryCard from './components/MobileInventoryCard';

const InventoryManagement = () => {
  // Brands state
  const [brands, setBrands] = useState([]);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/brands');
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };
    fetchBrands();
  }, []);
  // Categories state
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    stockStatus: '',
    priceRange: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Products state
  const [rawProducts, setRawProducts] = useState([]);
  const [mockProducts, setMockProducts] = useState([]);

  // Fetch products from API (independent)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        setRawProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Map products with category/brand/supplier names after all are loaded
  useEffect(() => {
    const mapProducts = async () => {
      const mapped = await Promise.all(
        rawProducts.map(async item => {
          let quantityOnHand = 0;
          try {
            const qtyRes = await fetch(`http://localhost:3000/api/products/${item.product_id}/quantity-on-hand`);
            const qty = await qtyRes.json();
            quantityOnHand = Number(qty);
          } catch (err) {
            // fallback to Out of Stock
          }
          // Map category_code to category_name
          let categoryName = item.category_code;
          if (Array.isArray(categories) && categories.length > 0) {
            const categoryObj = categories.find(cat => cat.category_code === item.category_code);
            if (categoryObj) categoryName = categoryObj.category_name;
          }
          // Map brand_id to brand_name
          let brandName = item.brand_id;
          if (Array.isArray(brands) && brands.length > 0) {
            const brandObj = brands.find(b => String(b.brand_id) === String(item.brand_id));
            if (brandObj) brandName = brandObj.brand_name;
          }

          return {
            id: item.product_id,
            name: item.product_name,
            category_code: item.category_code,
            category: categoryName,
            brand_id: item.brand_id,
            brand: brandName,
            price: parseFloat(item.price),
            // Add default values for missing fields
            sku: '',
            description: '',
            cost: 0,
            stock: quantityOnHand,
            reorderLevel: 3,
            barcode: '',
            weight: 0,
            dimensions: '',
            color: '',
            size: '',
            material: '',
            warranty: '',
            image: '',
            lastUpdated: '',
            isActive: true,
            trackInventory: true
          };
        })
      );
      setMockProducts(mapped);
    };
    if (rawProducts.length > 0) mapProducts();
  }, [rawProducts, categories, brands]);

  // Suppliers state
  const [mockSuppliers, setMockSuppliers] = useState([]);

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/suppliers');
        const data = await response.json();
        // Map API data to expected structure
        const mapped = data.map(item => ({
          id: item.supplier_id,
          name: item.supplier_name
        }));
        setMockSuppliers(mapped);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    };
    fetchSuppliers();
  }, []);

  const mockRecentMovements = [
    {
      id: 1,
      productName: "Trek Domane SL 7",
      type: "sale",
      quantity: -1,
      timestamp: "2025-01-23T09:15:00Z"
    },
    {
      id: 2,
      productName: "Specialized Rockhopper Elite",
      type: "restock",
      quantity: 5,
      timestamp: "2025-01-23T08:30:00Z"
    },
    {
      id: 3,
      productName: "Giant Escape 3",
      type: "sale",
      quantity: -2,
      timestamp: "2025-01-22T16:45:00Z"
    },
    {
      id: 4,
      productName: "Bike Helmet - Premium",
      type: "adjustment",
      quantity: -1,
      timestamp: "2025-01-22T14:20:00Z"
    },
    {
      id: 5,
      productName: "Scott E-Aspect 930",
      type: "return",
      quantity: 1,
      timestamp: "2025-01-22T11:10:00Z"
    }
  ];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // If all filters are empty, return all products
    const noFilters = !filters?.search && !filters?.category && !filters?.brand && !filters?.stockStatus && !filters?.priceRange;
    let filtered = mockProducts;
    if (!noFilters) {
      filtered = mockProducts?.filter(product => {
        // Search filter
        if (filters?.search) {
          const searchLower = filters?.search?.toLowerCase();
          if (!product?.name?.toLowerCase()?.includes(searchLower) &&
              !product?.sku?.toLowerCase()?.includes(searchLower) &&
              !product?.description?.toLowerCase()?.includes(searchLower)) {
            return false;
          }
        }

        // Category filter
        if (filters?.category) {
          if (product?.category_code !== filters?.category) {
            return false;
          }
        }

        // Brand filter
        if (filters?.brand && String(product?.brand_id) !== String(filters?.brand)) {
          return false;
        }

        // Stock status filter
        if (filters?.stockStatus) {
          if (filters?.stockStatus === 'out-of-stock' && product?.stock >= 1) return false;
          if (filters?.stockStatus === 'low-stock' && (product?.stock <= 0 || product?.stock > product?.reorderLevel)) return false;
          if (filters?.stockStatus === 'in-stock' && product?.stock <= product?.reorderLevel) return false;
        }

        // Price range filter
        if (filters?.priceRange) {
          const [min, max] = filters?.priceRange?.split('-')?.map(p => p === '+' ? Infinity : parseFloat(p));
          if (product?.price < min || (max !== Infinity && product?.price > max)) {
            return false;
          }
        }

        return true;
      });
    }

    // Sort products
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];

        if (typeof aValue === 'string') {
          aValue = aValue?.toLowerCase();
          bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [mockProducts, filters, sortConfig]);

  // Debug log for filters and filteredAndSortedProducts
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[InventoryManagement] filters:', filters, 'filteredAndSortedProducts:', filteredAndSortedProducts);
  }, [filters, filteredAndSortedProducts]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalProducts = mockProducts?.length;
    const totalValue = mockProducts?.reduce((sum, product) => sum + (product?.price * product?.stock), 0);
    const lowStockCount = mockProducts?.filter(p => p?.stock > 0 && p?.stock <= p?.reorderLevel)?.length;
    const outOfStockCount = mockProducts?.filter(p => p?.stock === 0)?.length;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount
    };
  }, []);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return mockProducts?.filter(product => product?.stock > 0 && product?.stock <= product?.reorderLevel)?.slice(0, 5);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems?.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredAndSortedProducts?.map(product => product?.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedItems([]); // Clear selection when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      stockStatus: '',
      priceRange: ''
    });
  };

  // Barcode scan removed

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDuplicateProduct = (product) => {
    const duplicatedProduct = {
      ...product,
      id: Date.now(),
      name: `${product?.name} (Copy)`,
      sku: `${product?.sku}-COPY`,
      stock: 0
    };
    setEditingProduct(duplicatedProduct);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      console.log('Deleting product:', product?.id);
      // In a real app, this would make an API call
    }
  };

  const handleSaveProduct = async (productData) => {
    console.log('Saving product:', productData);
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const handleBulkEdit = () => {
    console.log('Bulk editing items:', selectedItems);
    alert(`Bulk edit would open for ${selectedItems?.length} selected items`);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems?.length} selected items?`)) {
      console.log('Bulk deleting items:', selectedItems);
      setSelectedItems([]);
    }
  };

  const handleBulkExport = () => {
    console.log('Exporting items:', selectedItems);
    alert(`Exporting ${selectedItems?.length} selected items to CSV`);
  };

  const handleBulkPriceUpdate = () => {
    console.log('Bulk price update for items:', selectedItems);
    alert(`Price update dialog would open for ${selectedItems?.length} selected items`);
  };

  const handleBulkCategoryUpdate = () => {
    console.log('Bulk category update for items:', selectedItems);
    alert(`Category update dialog would open for ${selectedItems?.length} selected items`);
  };

  const handleReorderClick = (item) => {
    console.log('Reordering item:', item);
    alert(`Reorder dialog would open for ${item?.name}`);
  };

  const handleViewMovements = () => {
    console.log('Viewing all stock movements');
    alert('Stock movements report would open');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={handleSidebarToggle} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <main className={`pt-15 transition-smooth ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          <div className="max-w-full mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <Breadcrumb />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-heading font-bold text-2xl text-foreground">
                    Inventory Management
                  </h1>
                  <p className="font-body text-muted-foreground mt-1">
                    Manage your product catalog and monitor stock levels
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link to="/product-details">
                    <Button
                      variant="outline"
                      iconName="Eye"
                      iconPosition="left"
                      iconSize={18}
                    >
                      View Details
                    </Button>
                  </Link>
                  <Button
                    onClick={handleAddProduct}
                    iconName="Plus"
                    iconPosition="left"
                    iconSize={18}
                  >
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="xl:col-span-3 space-y-6">
                {/* Filters */}
                <InventoryFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />

                {/* Bulk Actions */}
                <BulkActionsToolbar
                  selectedCount={selectedItems?.length}
                  onBulkEdit={handleBulkEdit}
                  onBulkDelete={handleBulkDelete}
                  onBulkExport={handleBulkExport}
                  onBulkPriceUpdate={handleBulkPriceUpdate}
                  onBulkCategoryUpdate={handleBulkCategoryUpdate}
                  onClearSelection={() => setSelectedItems([])}
                />

                {/* Products Table/Cards */}
                {isMobile ? (
                  <div className="space-y-4">
                    {filteredAndSortedProducts?.map(product => (
                      <MobileInventoryCard
                        key={product?.id}
                        product={product}
                        isSelected={selectedItems?.includes(product?.id)}
                        onSelect={handleSelectItem}
                        onEdit={handleEditProduct}
                        onDuplicate={handleDuplicateProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <InventoryTable
                    products={filteredAndSortedProducts}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEditProduct}
                    onDuplicate={handleDuplicateProduct}
                    onDelete={handleDeleteProduct}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                )}

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {filteredAndSortedProducts?.length} of {mockProducts?.length} products
                  </span>
                  <span>
                    {selectedItems?.length > 0 && `${selectedItems?.length} selected`}
                  </span>
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1">
                <InventorySidebar
                  summaryData={summaryData}
                  lowStockItems={lowStockItems}
                  recentMovements={mockRecentMovements}
                  onReorderClick={handleReorderClick}
                  onViewMovements={handleViewMovements}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
        suppliers={mockSuppliers}
      />
    </div>
  );
};

export default InventoryManagement;