import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_ENDPOINTS from '../../config/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductImageGallery from './components/ProductImageGallery';
import ProductHeader from './components/ProductHeader';
import ProductInfoTabs from './components/ProductInfoTabs';
import ProductActions from './components/ProductActions';

import Button from '../../components/ui/Button';

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Get id from URL query params
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('id');

  // Default/mock product data for fallback/extra fields
  const defaultProduct = {
    id: productId || 'BIKE-001',
    name: `Trek Mountain Explorer Pro 29"`,
    sku: 'TRK-MTE-29-BLK',
    category: 'mountain',
    brand: 'trek',
    description: `The Trek Mountain Explorer Pro 29" is engineered for serious mountain biking enthusiasts who demand performance and reliability on challenging terrain. This premium mountain bike features a lightweight aluminum frame with advanced suspension technology, providing exceptional control and comfort during long rides.\n\nBuilt with high-quality components including Shimano gearing system and hydraulic disc brakes, this bike delivers smooth shifting and reliable stopping power in all weather conditions. The 29-inch wheels offer superior rollover capability and stability, making it perfect for both trail riding and cross-country adventures.`,
    price: 1299.99,
    costPrice: 780.00,
    discountPercentage: 0,
    stock: 8,
    reorderPoint: 5,
    maxStock: 25,
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800',
    isActive: true,
    isFeatured: true,
    specifications: {
      frameSize: 'Large (19")',wheelSize: '29 inches',gearCount: 21,frameMaterial: 'Aluminum Alloy',weight: '28.5 lbs',color: 'Matte Black'
    },
    supplier: {
      name: 'BikeWorld Distributors',code: 'BWD-001',contact: 'Sarah Johnson',phone: '+1 (555) 123-4567',email: 'orders@bikeworld.com'
    },
    createdAt: '2024-11-15',updatedAt: '2025-01-20'
  };

  const [product, setProduct] = useState(defaultProduct);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCT(productId));
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();

        // Fetch category name from categories API
        let categoryName = '';
        if (data.category_code) {
          try {
            const catRes = await fetch(API_ENDPOINTS.CATEGORY(data.category_code));
            if (catRes.ok) {
              const catData = await catRes.json();
              categoryName = catData.category_name || '';
            }
          } catch {}
        }

        // Fetch brand name from brands API
        let brandName = '';
        if (data.brand_id) {
          try {
            const brandRes = await fetch(API_ENDPOINTS.BRAND(data.brand_id));
            if (brandRes.ok) {
              const brandData = await brandRes.json();
              brandName = brandData.brand_name || '';
            }
          } catch {}
        }

        setProduct(prev => ({
          ...prev,
          ...defaultProduct,
          ...{
            id: data.product_id ?? prev.id,
            name: data.product_name ?? prev.name,
            sku: data.product_id ?? prev.sku,
            description: data.description ?? prev.description,
            barcode: data.barcode ?? prev.barcode,
            category: data.category_code ?? prev.category,
            category_name: categoryName,
            brand: data.brand_id ?? prev.brand,
            brand_name: brandName,
            price: data.price ? parseFloat(data.price) : prev.price,
            reorderPoint: data.reorder_level ?? prev.reorderPoint,
            weight: data.weight ?? prev.weight,
            size: data.size ?? prev.size,
            color: data.color ?? prev.color,
            material: data.material ?? prev.material,
            warranty: data.warranty_period ?? prev.warranty,
            image: data.image_url ?? prev.image,
          }
        }));
      } catch (err) {
        // Optionally show error or fallback
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProduct = (updatedProduct) => {
    setProduct(updatedProduct);
    setIsEditing(false);
    // In real app, this would make an API call to save the product
    console.log('Product saved:', updatedProduct);
  };

  const handleDuplicateProduct = (productToDuplicate) => {
    const duplicatedProduct = {
      ...productToDuplicate,
      id: `${productToDuplicate?.id}-COPY`,
      sku: `${productToDuplicate?.sku}-COPY`,
      name: `${productToDuplicate?.name} (Copy)`
    };
    console.log('Product duplicated:', duplicatedProduct);
    // In real app, this would navigate to the new product or show success message
  };

  const handleDeleteProduct = (productId) => {
    console.log('Product deleted:', productId);
    // In real app, this would make an API call and navigate back to inventory
    navigate('/inventory-management');
  };

  const handleAddToCart = (productToAdd) => {
    console.log('Added to cart:', productToAdd);
    // In real app, this would add the product to the shopping cart
  };

  const handleEditProduct = () => {
    setIsEditing(true);
  };

  // Custom breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Inventory Management',
      path: '/inventory-management',
      icon: 'Package'
    },
    {
      label: product?.name,
      path: '/product-details',
      icon: 'Info',
      current: true
    }
  ];

  // Close mobile actions panel when route changes
  useEffect(() => {
    setShowMobileActions(false);
  }, [location?.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={handleSidebarToggle} />
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
      
      <main className={`pt-15 transition-smooth ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb customItems={breadcrumbItems} />

          {/* Product Header */}
          <ProductHeader
            product={product}
            isEditing={isEditing}
            onToggleEdit={handleToggleEdit}
            onDuplicate={handleDuplicateProduct}
            onDelete={handleDeleteProduct}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
            {/* Left Column - Product Images */}
            <div className="xl:col-span-1">
              <div className="sticky top-20">
                <ProductImageGallery product={product} />
              </div>
            </div>

            {/* Center Column - Product Information */}
            <div className="xl:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
                <ProductInfoTabs
                  product={product}
                  isEditing={isEditing}
                  onToggleEdit={handleToggleEdit}
                  onSave={handleSaveProduct}
                />
              </div>
            </div>

            {/* Right Column - Actions (Desktop) */}
            <div className="xl:col-span-1 hidden xl:block">
              <div className="sticky top-20">
                <ProductActions
                  product={product}
                  onEdit={handleEditProduct}
                  onDuplicate={handleDuplicateProduct}
                  onDelete={handleDeleteProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </div>
          </div>

          {/* Mobile Actions Panel */}
          <div className="xl:hidden">
            {/* Mobile Actions Toggle Button */}
            <Button
              variant="default"
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="fixed bottom-4 right-4 z-1000 shadow-raised"
              iconName={showMobileActions ? "X" : "MoreVertical"}
              iconSize={20}
            >
              <span className="sr-only">Toggle actions menu</span>
            </Button>

            {/* Mobile Actions Overlay */}
            {showMobileActions && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-1100"
                  onClick={() => setShowMobileActions(false)}
                ></div>
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-lg z-1200 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-body font-semibold text-lg text-foreground">
                        Product Actions
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMobileActions(false)}
                        iconName="X"
                        iconSize={20}
                      >
                        <span className="sr-only">Close actions menu</span>
                      </Button>
                    </div>
                    <ProductActions
                      product={product}
                      onEdit={handleEditProduct}
                      onDuplicate={handleDuplicateProduct}
                      onDelete={handleDeleteProduct}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Back to Inventory Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => navigate('/inventory-management')}
              iconName="ArrowLeft"
              iconPosition="left"
              iconSize={16}
            >
              Back to Inventory
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;