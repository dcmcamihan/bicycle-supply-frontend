import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();

  // New brand form state
  const [formData, setFormData] = useState({
    brand_name: ''
  });

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.BRANDS);
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        toast?.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBrand 
        ? API_ENDPOINTS.BRAND(editingBrand.brand_id)
        : API_ENDPOINTS.BRANDS;
      
      const method = editingBrand ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_name: formData.brand_name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save brand');
      }

      // Refresh brands list
      const brandsRes = await fetch(API_ENDPOINTS.BRANDS);
      const newBrands = await brandsRes.json();
      setBrands(newBrands);

      // Reset form
      setFormData({
        brand_name: '',
        contact_person: '',
        email: '',
        phone: '',
        website: ''
      });
      setEditingBrand(null);

      toast?.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
    } catch (error) {
      console.error('Failed to save brand:', error);
      toast?.error('Failed to save brand');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      brand_name: brand.brand_name,
      contact_person: brand.contact_person || '',
      email: brand.email || '',
      phone: brand.phone || '',
      website: brand.website || ''
    });
  };

  const handleDelete = async (brand) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.BRAND(brand.brand_id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      setBrands(brands.filter(b => b.brand_id !== brand.brand_id));
      toast?.success('Brand deleted successfully');
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast?.error('Failed to delete brand');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Brand Management</h1>

            {/* Brand Form */}
            <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                {editingBrand && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingBrand(null);
                      setFormData({
                        brand_name: '',
                        contact_person: '',
                        email: '',
                        phone: '',
                        website: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {editingBrand ? 'Update Brand' : 'Add Brand'}
                </Button>
              </div>
            </form>

            {/* Brands List */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Brands</h2>
                <div className="ml-auto">
                  <input
                    type="search"
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : brands.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No brands found</div>
                ) : (
                  brands
                    .filter(b => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (b.brand_name || '').toLowerCase().includes(q) || String(b.brand_id).includes(q);
                    })
                    .map(brand => (
                      <div key={brand.brand_id} className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{brand.brand_name}</h3>
                          {brand.contact_person && (
                            <p className="text-sm text-muted-foreground">Contact: {brand.contact_person}</p>
                          )}
                          {brand.email && (
                            <p className="text-sm text-muted-foreground">Email: {brand.email}</p>
                          )}
                          {brand.phone && (
                            <p className="text-sm text-muted-foreground">Phone: {brand.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(brand)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(brand)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandManagement;