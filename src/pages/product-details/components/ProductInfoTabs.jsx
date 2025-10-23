import API_ENDPOINTS from '../../../config/api';
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProductInfoTabs = ({ product, isEditing, onToggleEdit, onSave, refreshToken = 0 }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editedProduct, setEditedProduct] = useState(product);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Sync editedProduct with product only when product changes, not on every render or edit toggle
  React.useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  // Fetch live current stock
  React.useEffect(() => {
    const fetchQoh = async () => {
      if (!product?.id && !product?.product_id) return;
      const pid = product?.id || product?.product_id;
      try {
        const res = await fetch(`${API_ENDPOINTS.PRODUCT(pid)}/quantity-on-hand`);
        if (res.ok) {
          const qoh = await res.json();
          setCurrentStock(Number(qoh) || 0);
        }
      } catch {}
    };
    fetchQoh();
  }, [product?.id, product?.product_id, refreshToken]);


  // Fetch stock movement history (Supplies + Sales)
  React.useEffect(() => {
    const loadMovements = async () => {
      if (!product?.id && !product?.product_id) return;
      const pid = Number(product?.id || product?.product_id);
      setLoadingMovements(true);
      try {
        const all = [];
        // Sales -> decreases
        try {
          const salesRes = await fetch(API_ENDPOINTS.SALES);
          if (salesRes.ok) {
            const sales = await salesRes.json();
            for (const sale of sales) {
              try {
                const detRes = await fetch(API_ENDPOINTS.SALE_DETAILS(sale.sale_id));
                if (!detRes.ok) continue;
                const details = await detRes.json();
                for (const d of details) {
                  if (Number(d.product_id) === pid) {
                    all.push({
                      date: sale.sale_date ? new Date(sale.sale_date).toISOString().slice(0,10) : '',
                      type: 'Sale',
                      quantity: -(Number(d.quantity_sold) || 0)
                    });
                  }
                }
              } catch {}
            }
          }
        } catch {}

        // Supplies -> increases
        try {
          const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
          if (supRes.ok) {
            const supplies = await supRes.json();
            for (const sup of supplies) {
              try {
                const sdetRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(sup.supply_id));
                if (!sdetRes.ok) continue;
                const sdetails = await sdetRes.json();
                for (const sd of sdetails) {
                  if (Number(sd.product_id) === pid) {
                    all.push({
                      date: sup.supply_date ? new Date(sup.supply_date).toISOString().slice(0,10) : '',
                      type: 'Restock',
                      quantity: Number(sd.quantity_supplied) || 0
                    });
                  }
                }
              } catch {}
            }
          }
        } catch {}

        // Sort movements by date desc (newest first)
        all.sort((a,b) => new Date(b.date) - new Date(a.date));
        setMovements(all);
      } catch {
        setMovements([]);
      } finally {
        setLoadingMovements(false);
      }
    };
    loadMovements();
  }, [product?.id, product?.product_id]);

  const tabs = [
    { id: 'general', label: 'General Info', icon: 'Info' },
    { id: 'inventory', label: 'Inventory', icon: 'Package' },
    { id: 'supplier', label: 'Supplier', icon: 'Truck' }
  ];

  const [categoryOptions, setCategoryOptions] = useState([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORIES);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategoryOptions(data.map(c => ({ value: c.category_code, label: c.category_name })));
        // Set the label for the current product's category
        if (product.category_name) {
          setCategoryLabel(product.category_name);
        } else {
          const found = data.find(c => c.category_code === (product.category || product.category_code));
          setCategoryLabel(found ? found.category_name : (product.category || ''));
        }
      } catch {
        setCategoryOptions([]);
      }
    };
    fetchCategories();
  }, [product.category, product.category_code, product.category_name]);

  const [brandOptions, setBrandOptions] = useState([]);

  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.BRANDS);
        if (!res.ok) throw new Error('Failed to fetch brands');
        const data = await res.json();
        setBrandOptions(data.map(b => ({ value: b.brand_id, label: b.brand_name })));
      } catch {
        setBrandOptions([]);
      }
    };
    fetchBrands();
  }, []);

  // Set the label for the current product's brand
  const [brandLabel, setBrandLabel] = React.useState('');
  React.useEffect(() => {
    if (product.brand_name) {
      setBrandLabel(product.brand_name);
    } else if (brandOptions.length > 0) {
      const found = brandOptions.find(b => b.value === (product.brand || product.brand_id));
      setBrandLabel(found ? found.label : (product.brand || ''));
    }
  }, [product.brand, product.brand_id, product.brand_name, brandOptions]);

  const handleInputChange = (field, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  const renderGeneralInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name"
          type="text"
          value={editedProduct.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={!isEditing}
          required
        />
        <Input
          label="SKU"
          type="text"
          value={editedProduct.id}
          onChange={(e) => handleInputChange('id', e.target.value)}
          disabled={!isEditing}
          required
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditing ? (
          <Select
            label="Category"
            options={categoryOptions}
            value={editedProduct.category}
            onChange={(value) => handleInputChange('category', value)}
            disabled={!isEditing}
            required
          />
        ) : (
          <Input
            label="Category"
            type="text"
            value={categoryLabel}
            disabled
          />
        )}
        {isEditing ? (
          <Select
            label="Brand"
            options={brandOptions}
            value={editedProduct.brand}
            onChange={(value) => handleInputChange('brand', value)}
            disabled={!isEditing}
            required
          />
        ) : (
          <Input
            label="Brand"
            type="text"
            value={brandLabel}
            disabled
          />
        )}
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price (₱)"
          type="number"
          value={editedProduct.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
          disabled={!isEditing}
          required
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedProduct.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            disabled={!isEditing}
            className="rounded border-border text-primary focus:ring-ring"
          />
          <span className="text-sm font-body text-foreground">Active Product</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedProduct.isFeatured}
            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
            disabled={!isEditing}
            className="rounded border-border text-primary focus:ring-ring"
          />
          <span className="text-sm font-body text-foreground">Featured Product</span>
        </label>
      </div>

    </div>
  );

  

  

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Current Stock"
          type="number"
          value={currentStock}
          onChange={() => {}}
          disabled
          required
          min="0"
        />
        <Input
          label="Reorder Point"
          type="number"
          value={editedProduct.reorderPoint || 5}
          onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value))}
          disabled={!isEditing}
          min="0"
        />
        <div />
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} />
          <span>Stock Movement History</span>
        </h4>
        <div className="space-y-2">
          {loadingMovements ? (
            <p className="font-caption text-sm text-muted-foreground">Loading movements...</p>
          ) : movements.length === 0 ? (
            <p className="font-caption text-sm text-muted-foreground">No movement history available.</p>
          ) : (
            movements.map((movement, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={movement.type === 'Sale' || movement.type === 'Return Out' ? 'Minus' : 'Plus'} 
                    size={14} 
                    className={(movement.type === 'Sale' || movement.type === 'Return Out') ? 'text-destructive' : 'text-success'}
                  />
                  <div>
                    <span className="text-sm font-body text-foreground">{movement.type}</span>
                    <span className="text-xs text-muted-foreground ml-2">{movement.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${
                    movement.quantity > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                  {typeof movement.balance !== 'undefined' && (
                    <span className="text-xs text-muted-foreground ml-2">Bal: {movement.balance}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Supplier info and contacts
  const [supplierInfo, setSupplierInfo] = React.useState(null);
  const [supplierContacts, setSupplierContacts] = React.useState([]);
  const [poHistory, setPoHistory] = React.useState([]);
  const [contactTypesMap, setContactTypesMap] = React.useState({});

  // Load contact type descriptions for rendering
  React.useEffect(() => {
    const loadContactTypes = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CONTACT_TYPES);
        if (res.ok) {
          const data = await res.json();
          const map = {};
          for (const ct of data) {
            map[ct.contact_type_code] = ct.description || ct.contact_type_code;
          }
          setContactTypesMap(map);
        }
      } catch {}
    };
    loadContactTypes();
  }, []);

  React.useEffect(() => {
    const fetchSupplierData = async () => {
      const pid = Number(product?.id || product?.product_id);
      if (!pid) return;
      let supplierId = product?.supplier_id || editedProduct?.supplier_id;

      if (!supplierId) {
        try {
          const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
          if (supRes.ok) {
            const supplies = await supRes.json();
            const matches = [];
            for (const sup of supplies) {
              try {
                const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(sup.supply_id));
                if (!detRes.ok) continue;
                const dets = await detRes.json();
                if (dets?.some(d => Number(d.product_id) === pid)) {
                  matches.push({ supplier_id: sup.supplier_id, date: new Date(sup.supply_date || 0) });
                }
              } catch {}
            }
            if (matches.length) {
              matches.sort((a, b) => b.date - a.date);
              supplierId = matches[0].supplier_id;
            }
          }
        } catch {}
      }

      if (!supplierId) {
        setSupplierInfo(null);
        setSupplierContacts([]);
        return;
      }

      try {
        const sres = await fetch(API_ENDPOINTS.SUPPLIER(supplierId));
        let sdata = null;
        if (sres.ok) {
          sdata = await sres.json();
        }

        // Address list -> filter by supplier_id and compose single-line
        let addressText = '';
        try {
          const aRes = await fetch(API_ENDPOINTS.SUPPLIER_ADDRESSES);
          if (aRes.ok) {
            const arr = await aRes.json();
            const addr = arr?.find(a => Number(a.supplier_id) === Number(supplierId));
            if (addr) {
              addressText = [addr.street, addr.barangay, addr.city, addr.province, addr.zip_code, addr.country]
                .filter(Boolean)
                .join(', ');
            }
          }
        } catch {}

        setSupplierInfo(sdata ? { ...sdata, supplier_address: addressText } : { supplier_id: supplierId, supplier_address: addressText });
      } catch {
        setSupplierInfo(null);
      }

      // Contacts list -> filter by supplier_id
      try {
        const cres = await fetch(API_ENDPOINTS.SUPPLIER_CONTACTS);
        if (cres.ok) {
          const cdata = await cres.json();
          const filtered = (Array.isArray(cdata) ? cdata : []).filter(c => Number(c.supplier_id) === Number(supplierId));
          setSupplierContacts(filtered);
        } else {
          setSupplierContacts([]);
        }
      } catch {
        setSupplierContacts([]);
      }
    };
    fetchSupplierData();
  }, [product?.id, product?.product_id]);

  // Build purchase order history from supplies + supply_details
  React.useEffect(() => {
    const loadPoHistory = async () => {
      const pid = Number(product?.id || product?.product_id);
      if (!pid) return;
      try {
        const out = [];
        const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
        if (supRes.ok) {
          const supplies = await supRes.json();
          for (const sup of supplies) {
            try {
              const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(sup.supply_id));
              if (!detRes.ok) continue;
              const dets = await detRes.json();
              const forThisProduct = dets.filter(d => Number(d.product_id) === pid);
              if (forThisProduct.length > 0) {
                const totalQty = forThisProduct.reduce((sum, d) => sum + (Number(d.quantity_supplied) || 0), 0);
                out.push({
                  poNumber: `SUP-${sup.supply_id}`,
                  date: sup.supply_date ? new Date(sup.supply_date).toISOString().slice(0,10) : '',
                  quantity: totalQty,
                  status: sup.status || 'Received'
                });
              }
            } catch {}
          }
        }
        // Sort newest first
        out.sort((a,b) => new Date(b.date) - new Date(a.date));
        setPoHistory(out);
      } catch {
        setPoHistory([]);
      }
    };
    loadPoHistory();
  }, [product?.id, product?.product_id]);

  const renderSupplier = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Supplier Name"
          type="text"
          value={supplierInfo?.supplier_name || product?.supplier_name || ''}
          onChange={() => {}}
          disabled
        />
        <Input
          label="Supplier Code"
          type="text"
          value={String(product?.supplier_id || supplierInfo?.supplier_id || '')}
          onChange={() => {}}
          disabled
        />
      </div>

      <Input
        label="Supplier Address"
        type="text"
        value={supplierInfo?.supplier_address || product?.supplier_address || ''}
        onChange={() => {}}
        disabled
      />

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="AddressBook" size={16} />
          <span>Supplier Contacts</span>
        </h4>
        {supplierContacts.length === 0 ? (
          <p className="font-caption text-sm text-muted-foreground">No contacts available.</p>
        ) : (
          <div className="space-y-2">
            {supplierContacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="min-w-0">
                  <span className="text-sm font-body text-foreground">{c.contact_value || c.value}</span>
                  <span className="text-xs text-muted-foreground ml-2">{contactTypesMap[c.contact_type_code] || c.contact_type_code || c.type}</span>
                </div>
                {(c.is_primary === 'Y' || c.is_primary === true) ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Primary</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Package" size={16} />
          <span>Purchase Order History</span>
        </h4>
        <div className="space-y-2">
          {poHistory.length === 0 ? (
            <p className="font-caption text-sm text-muted-foreground">No purchase orders found.</p>
          ) : (
            poHistory.map((po, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <span className="text-sm font-body text-foreground">{po.poNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">{po.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-foreground">Qty: {po.quantity}</span>
                  <span className="text-xs text-success ml-2">{po.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralInfo();
      case 'inventory':
        return renderInventory();
      case 'supplier':
        return renderSupplier();
      default:
        return renderGeneralInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-body text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onToggleEdit}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            iconName="Save"
            iconPosition="left"
            iconSize={16}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductInfoTabs;