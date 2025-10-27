import React, { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();

  // New category form state
  const [formData, setFormData] = useState({
    category_code: '',
    category_name: '',
    // description removed to match DB schema
  });
  const formRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast?.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // basic client-side validation to avoid duplicate category_code
      // trim inputs
      const trimmed = {
        category_code: (formData.category_code || '').toString().trim(),
        category_name: (formData.category_name || '').toString().trim()
      };

      if (trimmed.category_code.length === 0 || trimmed.category_name.length === 0) {
        toast?.error('Category code and name are required');
        return;
      }

      if (trimmed.category_code.length > 8) {
        toast?.error('Category code must be 8 characters or fewer');
        return;
      }

      if (categories.some(c => c.category_code === trimmed.category_code && (!editingCategory || editingCategory.category_code !== trimmed.category_code))) {
        toast?.error('Category code already exists');
        return;
      }
      const url = editingCategory 
        ? API_ENDPOINTS.CATEGORY(editingCategory.category_code)
        : API_ENDPOINTS.CATEGORIES;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmed),
      });

      if (!response.ok) {
        // try to read server error message
        let errText = 'Failed to save category';
        try {
          const err = await response.json();
          if (err && err.error) errText = err.error;
          else if (err && err.message) errText = err.message;
        } catch (readErr) {
          // ignore JSON parse errors
        }
        throw new Error(errText);
      }

      // Refresh categories list
      const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
      const newCategories = await categoriesRes.json();
      setCategories(newCategories);

      // Reset form
      setFormData({
        category_code: '',
        category_name: ''
      });
      setEditingCategory(null);

      toast?.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
    } catch (error) {
      console.error('Failed to save category:', error);
      // show server-provided message when available
      const msg = error && error.message ? error.message : 'Failed to save category';
      toast?.error(msg);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      category_code: category.category_code,
      category_name: category.category_name
    });
    // Auto-scroll to the form and focus so the user sees the editing context
    setTimeout(() => {
      try {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = formRef.current?.querySelector('input');
        firstInput?.focus();
      } catch (err) {
        // ignore
      }
    }, 120);
  };

  const handleDelete = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY(category.category_code), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories(categories.filter(c => c.category_code !== category.category_code));
      toast?.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast?.error('Failed to delete category');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Category Management</h1>

            {/* Category Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              {editingCategory && (
                <div className="mb-4 p-3 rounded border-l-4 border-yellow-400 bg-yellow-50 text-sm flex items-center justify-between">
                  <div>
                    <strong>Editing category:</strong> <span className="ml-1">{editingCategory.category_code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">You are editing this category</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Code</label>
                  <input
                    type="text"
                    value={formData.category_code}
                    onChange={(e) => setFormData({...formData, category_code: e.target.value})}
                    // prevent changing the PK in the UI while editing to avoid FK issues
                    readOnly={!!editingCategory}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.category_name}
                    onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                {/* description removed to match DB schema */}
              </div>

              <div className="flex justify-end gap-2">
                {editingCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({
                        category_code: '',
                        category_name: '',
                        description: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </div>
            </form>

            {/* Categories List */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Categories</h2>
                <div className="ml-auto">
                  <input
                    type="search"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No categories found</div>
                ) : (
                  categories
                    .filter(cat => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (cat.category_name || '').toLowerCase().includes(q) || (cat.category_code || '').toLowerCase().includes(q);
                    })
                    .map(category => (
                      <div key={category.category_code} className={`p-4 flex items-center justify-between ${editingCategory && editingCategory.category_code === category.category_code ? 'ring-2 ring-accent rounded-md bg-accent/5' : ''}`}>
                        <div>
                          <h3 className="font-medium">{category.category_name}</h3>
                          <p className="text-sm text-muted-foreground">Code: {category.category_code}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category)}
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

export default CategoryManagement;