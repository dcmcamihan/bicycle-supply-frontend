import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
import API_ENDPOINTS from '../../config/api';
import CreatePurchaseOrderModal from '../product-details/components/CreatePurchaseOrderModal';
import { useToast } from '../../components/ui/Toast';

const InventoryManagement = () => {
  // Brands state
  const [brands, setBrands] = useState([]);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.BRANDS);
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
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
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
    supplier: '',
    priceRange: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [showPOModal, setShowPOModal] = useState(false);
  const [poProductId, setPoProductId] = useState(null);
  const [poSupplierId, setPoSupplierId] = useState(null);
  const toast = useToast();

  // Products state
  const [rawProducts, setRawProducts] = useState([]);
  const [mockProducts, setMockProducts] = useState([]);

  // Fetch products from API (independent)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS);
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
      const qtyRes = await fetch(`${API_ENDPOINTS.PRODUCT(item.product_id)}/quantity-on-hand`);
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
            sku: String(item.product_id),
            description: item.description || '',
            stock: quantityOnHand,
            reorderLevel: item.reorder_level,
            barcode: item.barcode || '',
            weight: item.weight ? Number(item.weight) : 0,
            dimensions: '',
            color: item.color || '',
            size: item.size || '',
            material: item.material || '',
            warranty: item.warranty_period || '',
            image: '',
            image_url: item.image_url || '',
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
  const [productSupplierMap, setProductSupplierMap] = useState(new Map()); // product_id -> latest supplier_id

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SUPPLIERS);
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

  // Build latest supplier per product using supplies + supply_details
  useEffect(() => {
    const buildProductSupplierMap = async () => {
      try {
        const map = new Map();
        const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
        if (!supRes.ok) { setProductSupplierMap(map); return; }
        const supplies = await supRes.json();
        for (const sup of supplies) {
          const supplyId = sup?.supply_id;
          const supplierId = sup?.supplier_id;
          const date = new Date(sup?.supply_date || 0).getTime();
          try {
            const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(supplyId));
            if (!detRes.ok) continue;
            const dets = await detRes.json();
            for (const d of dets) {
              const pid = Number(d?.product_id);
              if (!pid) continue;
              const prev = map.get(pid);
              if (!prev || date > prev.date) {
                map.set(pid, { supplier_id: Number(supplierId), date });
              }
            }
          } catch {}
        }
        setProductSupplierMap(map);
      } catch {
        setProductSupplierMap(new Map());
      }
    };
    buildProductSupplierMap();
  }, []);

  // Recent movements (real data)
  const [recentMovements, setRecentMovements] = useState([]);

  // Load recent movements from sales/supplies/stockouts
  useEffect(() => {
    const loadMovements = async () => {
      try {
        // Build product name map from current products
        const productNameMap = new Map();
        mockProducts.forEach(p => productNameMap.set(Number(p.id), p.name));

        const movements = [];

        // Sales -> negative movements per sale detail
        try {
          const salesRes = await fetch(API_ENDPOINTS.SALES);
          if (salesRes.ok) {
            const sales = await salesRes.json();
            for (const sale of sales) {
              const saleId = sale?.sale_id || sale?.id;
              const saleDate = sale?.sale_date || sale?.date || sale?.created_at;
              if (!saleId || !saleDate) continue;
              try {
                const detailsRes = await fetch(API_ENDPOINTS.SALE_DETAILS(saleId));
                if (detailsRes.ok) {
                  const details = await detailsRes.json();
                  for (const d of details) {
                    const pid = Number(d?.product_id);
                    const qty = Number(d?.quantity_sold ?? d?.quantity ?? 0);
                    if (!pid || !qty) continue;
                    movements.push({
                      id: `sale-${saleId}-${pid}`,
                      productId: pid,
                      productName: productNameMap.get(pid) || `#${pid}`,
                      type: 'sale',
                      quantity: -Math.abs(qty),
                      timestamp: saleDate
                    });
                  }
                }
              } catch {}
            }
          }
        } catch {}

        // Supplies -> positive movements per supply detail
        try {
          const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
          if (supRes.ok) {
            const supplies = await supRes.json();
            for (const sup of supplies) {
              const supplyId = sup?.supply_id || sup?.id;
              const supplyDate = sup?.supply_date || sup?.date || sup?.created_at;
              if (!supplyId || !supplyDate) continue;
              try {
                const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(supplyId));
                if (detRes.ok) {
                  const sdetails = await detRes.json();
                  for (const sd of sdetails) {
                    const pid = Number(sd?.product_id);
                    const qty = Number(sd?.quantity_supplied ?? sd?.quantity ?? 0);
                    if (!pid || !qty) continue;
                    movements.push({
                      id: `supply-${supplyId}-${pid}`,
                      productId: pid,
                      productName: productNameMap.get(pid) || `#${pid}`,
                      type: 'restock',
                      quantity: Math.abs(qty),
                      timestamp: supplyDate
                    });
                  }
                }
              } catch {}
            }
          }
        } catch {}

        // Stockouts (adjustments) -> negative movements
        try {
          const soRes = await fetch(API_ENDPOINTS.STOCKOUTS);
          if (soRes.ok) {
            const stockouts = await soRes.json();
            for (const so of stockouts) {
              const stockoutId = so?.stockout_id || so?.id;
              const date = so?.stockout_date || so?.date || so?.created_at;
              const pid = Number(so?.product_id);
              const qtyRemoved = Number(so?.quantity_removed ?? 0);
              if (pid && qtyRemoved) {
                movements.push({
                  id: `stockout-${stockoutId}-${pid}`,
                  productId: pid,
                  productName: productNameMap.get(pid) || `#${pid}`,
                  type: 'adjustment',
                  quantity: -Math.abs(qtyRemoved),
                  timestamp: date
                });
                continue;
              }
              // If product/qty not on stockout, try details
              try {
                if (API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT) {
                  const sodRes = await fetch(API_ENDPOINTS.STOCKOUT_DETAILS_BY_STOCKOUT(stockoutId));
                  if (sodRes.ok) {
                    const sods = await sodRes.json();
                    for (const sd of sods) {
                      const pid2 = Number(sd?.product_id);
                      const qty2 = Number(sd?.quantity_removed ?? sd?.quantity ?? 0);
                      if (!pid2 || !qty2) continue;
                      movements.push({
                        id: `stockout-${stockoutId}-${pid2}`,
                        productId: pid2,
                        productName: productNameMap.get(pid2) || `#${pid2}`,
                        type: 'adjustment',
                        quantity: -Math.abs(qty2),
                        timestamp: date
                      });
                    }
                  }
                }
              } catch {}
            }
          }
        } catch {}

        // Sort DESC by timestamp and take latest 15
        movements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentMovements(movements.slice(0, 15));
      } catch (e) {
        setRecentMovements([]);
      }
    };
    // Trigger when products mapped to have names
    if (mockProducts.length > 0) loadMovements();
  }, [mockProducts]);

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
    const noFilters = !filters?.search && !filters?.category && !filters?.brand && !filters?.stockStatus && !filters?.priceRange && !filters?.supplier;
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

        // Supplier filter (use latest supplier for product from map)
        if (filters?.supplier) {
          const entry = productSupplierMap.get(Number(product?.id));
          if (!entry || String(entry.supplier_id) !== String(filters?.supplier)) {
            return false;
          }
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
  // Calculate summary data from real API product data
  const summaryData = useMemo(() => {
    // Use mockProducts, which is mapped from real API data
    const totalProducts = mockProducts?.length || 0;
    const totalValue = mockProducts?.reduce((sum, product) => sum + ((product?.price || 0) * (product?.stock || 0)), 0);
    const lowStockCount = mockProducts?.filter(p => (p?.stock > 0 && p?.stock <= (p?.reorderLevel ?? 3)))?.length || 0;
    const outOfStockCount = mockProducts?.filter(p => p?.stock === 0)?.length || 0;
    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount
    };
  }, [mockProducts]);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    // Always use real API data (mockProducts is mapped from API)
    return mockProducts?.filter(product => product?.stock > 0 && product?.stock <= (product?.reorderLevel ?? 3))?.slice(0, 5);
  }, [mockProducts]);

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
      supplier: '',
      priceRange: ''
    });
  };

  // Apply header search query param to filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (q !== (filters.search || '')) {
      setFilters(prev => ({ ...prev, search: q }));
    }
  }, [location.search]);

  // Barcode scan removed

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Archive "${product?.name}"? It will be hidden from lists and calculations, but not deleted.`);
    if (!confirmed) return;
    try {
      const res = await fetch(API_ENDPOINTS.PRODUCT_ARCHIVE(product.id), { method: 'PUT' });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to archive product');
      }
      // Refresh list
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await response.json();
      setRawProducts(data);
      try { toast?.success && toast.success('Product archived'); } catch {}
    } catch (error) {
      console.error('Failed to delete product:', error);
      const raw = String(error?.message || '');
      const friendly = raw.toLowerCase().includes('foreign key') || raw.includes('Cannot delete or update a parent row')
        ? 'Cannot delete: this product has historical records (supplies/sales/returns). It has not been deleted.'
        : (error?.message || 'Failed to archive product');
      try { toast?.error && toast.error(friendly); } catch {}
      alert(friendly);
    }
  };

  const handleSaveProduct = async (productData, productId = null) => {
    try {
      // Ensure price is two decimals to match DECIMAL(10,2)
      const normalizedPrice = productData.price != null ? Number(parseFloat(productData.price).toFixed(2)) : null;

      const payload = {
        product_name: productData.name,
        description: productData.description || null,
        category_code: productData.category,
        brand_id: productData.brand ? parseInt(productData.brand) : null,
        price: normalizedPrice,
        reorder_level: productData.reorderLevel ? parseInt(productData.reorderLevel) : 3,
        image_url: productData.image_url || null
      };

      const isEdit = Boolean(productId);
      const url = isEdit ? API_ENDPOINTS.PRODUCT(productId) : API_ENDPOINTS.PRODUCTS;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || (isEdit ? 'Failed to update product' : 'Failed to create product'));
      }
      // Parse created/updated product to get product_id
      let savedProduct = null;
      try { savedProduct = await res.json(); } catch {}
      const newProductId = isEdit ? productId : (savedProduct?.product_id || savedProduct?.id);

      // When creating a new product: if initial stock provided and supplier selected,
      // create a supply and a supply_detail so QOH and supplier mapping update correctly
      if (!isEdit && newProductId && (productData.stock ? parseInt(productData.stock) : 0) > 0 && productData.supplier) {
        try {
          const supplyPayload = {
            supplier_id: parseInt(productData.supplier),
            supply_date: new Date().toISOString(),
            payment_method_code: 'CASH',
            sale_attendant: 6,
            manager: 13,
          };
          const supplyRes = await fetch(API_ENDPOINTS.SUPPLIES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplyPayload)
          });
          if (supplyRes.ok) {
            const supply = await supplyRes.json();
            const supplyId = supply?.supply_id || supply?.id;
            if (supplyId) {
              const supplyDetailPayload = {
                supply_id: supplyId,
                product_id: newProductId,
                quantity_supplied: parseInt(productData.stock)
              };
              await fetch(API_ENDPOINTS.SUPPLY_DETAILS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplyDetailPayload)
              });
            }
          }
        } catch (e) {
          // Non-blocking: failure here means initial stock/supplier won't reflect, but product is created
          console.error('Failed to create initial supply for new product', e);
        }
      }

      // Refresh products list
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await response.json();
      setRawProducts(data);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
      throw error;
    }
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
    const pid = Number(item?.id);
    const supplierEntry = productSupplierMap.get(pid);
    setPoProductId(pid);
    setPoSupplierId(supplierEntry?.supplier_id || null);
    setShowPOModal(true);
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
                  suppliers={mockSuppliers}
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
                  recentMovements={recentMovements}
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
        onSave={(data) => handleSaveProduct(data, editingProduct?.id)}
        suppliers={mockSuppliers}
        categories={categories}
        brands={brands}
      />
      {/* Create PO Modal (Low Stock Reorder) */}
      <CreatePurchaseOrderModal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        productId={poProductId}
        supplierId={poSupplierId}
        onCreated={async () => {
          // Refresh products (QOH) after creating PO
          try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS);
            const data = await response.json();
            setRawProducts(data);
          } catch {}
          setShowPOModal(false);
        }}
      />
    </div>
  );
};

export default InventoryManagement;