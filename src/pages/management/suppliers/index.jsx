import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contactTypes, setContactTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    supplier_name: '',
    contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  // Fetch suppliers and contact types
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [suppliersRes, contactTypesRes] = await Promise.all([
          fetch(API_ENDPOINTS.SUPPLIERS),
          fetch(API_ENDPOINTS.CONTACT_TYPES)
        ]);

        const suppliersData = await suppliersRes.json();
        const contactTypesData = await contactTypesRes.json();

        setSuppliers(suppliersData);
        setContactTypes(contactTypesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast?.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSupplier 
        ? API_ENDPOINTS.SUPPLIER(editingSupplier.supplier_id)
        : API_ENDPOINTS.SUPPLIERS;
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      // Save basic supplier info first
      const supplierPayload = {
        supplier_name: formData.supplier_name,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save supplier');
      }

      const savedSupplier = await response.json();

      // Save supplier contacts
      const contactPromises = formData.contacts
        .filter(contact => contact.contact_type_code && contact.contact_value)
        .map(contact => {
          const contactPayload = {
            supplier_id: savedSupplier.supplier_id,
            contact_type_code: contact.contact_type_code,
            contact_value: contact.contact_value,
            is_active: 'Y',
            is_primary: contact.is_primary
          };

          return fetch(API_ENDPOINTS.SUPPLIER_CONTACTS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactPayload),
          });
        });

      await Promise.all(contactPromises);

      // Save supplier address if provided
      if (formData.address || formData.city || formData.state || formData.country || formData.postal_code) {
        const addressPayload = {
          supplier_id: savedSupplier.supplier_id,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code
        };

        await fetch(API_ENDPOINTS.SUPPLIER_ADDRESSES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressPayload),
        });
      }

      // Refresh suppliers list
      const suppliersRes = await fetch(API_ENDPOINTS.SUPPLIERS);
      const newSuppliers = await suppliersRes.json();
      setSuppliers(newSuppliers);

      // Reset form
      setFormData({
        supplier_name: '',
        contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: ''
      });
      setEditingSupplier(null);

      toast?.success(editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully');
    } catch (error) {
      console.error('Failed to save supplier:', error);
      toast?.error('Failed to save supplier');
    }
  };

  const handleEdit = async (supplier) => {
    setEditingSupplier(supplier);
    try {
      const [addressRes, contactsRes] = await Promise.all([
        fetch(API_ENDPOINTS.SUPPLIER_ADDRESSES_BY_SUPPLIER(supplier.supplier_id)),
        fetch(API_ENDPOINTS.SUPPLIER_CONTACTS_BY_SUPPLIER(supplier.supplier_id))
      ]);

      const addresses = await addressRes.json();
      const contacts = await contactsRes.json();
      const primaryAddress = addresses[0] || {};

      setFormData({
        supplier_name: supplier.supplier_name,
        contacts: contacts.length > 0 ? contacts.map(contact => ({
          contact_type_code: contact.contact_type_code,
          contact_value: contact.contact_value,
          is_primary: contact.is_primary
        })) : [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        address: primaryAddress.address_line1 || '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        country: primaryAddress.country || '',
        postal_code: primaryAddress.postal_code || ''
      });
    } catch (error) {
      console.error('Failed to fetch supplier details:', error);
      setFormData({
        supplier_name: supplier.supplier_name,
        contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: ''
      });
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.SUPPLIER(supplier.supplier_id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      setSuppliers(suppliers.filter(s => s.supplier_id !== supplier.supplier_id));
      toast?.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      toast?.error('Failed to delete supplier');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Supplier Management</h1>

            {/* Supplier Form */}
            <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                {/* Contacts Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Contact Information</label>
                  {formData.contacts.map((contact, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <select
                          value={contact.contact_type_code}
                          onChange={(e) => {
                            const newContacts = [...formData.contacts];
                            newContacts[index].contact_type_code = e.target.value;
                            setFormData({...formData, contacts: newContacts});
                          }}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="">Select Type</option>
                          {contactTypes.map(type => (
                            <option key={type.contact_type_code} value={type.contact_type_code}>
                              {type.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={contact.contact_value}
                          onChange={(e) => {
                            const newContacts = [...formData.contacts];
                            newContacts[index].contact_value = e.target.value;
                            setFormData({...formData, contacts: newContacts});
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="Contact Value"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={contact.is_primary === 'Y'}
                            onChange={() => {
                              const newContacts = formData.contacts.map((c, i) => ({
                                ...c,
                                is_primary: i === index ? 'Y' : 'N'
                              }));
                              setFormData({...formData, contacts: newContacts});
                            }}
                            className="mr-2"
                          />
                          Primary
                        </label>
                        <div className="flex-1 text-right">
                          {formData.contacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newContacts = formData.contacts.filter((_, i) => i !== index);
                                if (contact.is_primary === 'Y' && newContacts.length > 0) {
                                  newContacts[0].is_primary = 'Y';
                                }
                                setFormData({...formData, contacts: newContacts});
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        contacts: [
                          ...formData.contacts,
                          { contact_type_code: '', contact_value: '', is_primary: 'N' }
                        ]
                      });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    + Add Another Contact
                  </button>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {editingSupplier && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSupplier(null);
                      setFormData({
                        supplier_name: '',
                        contact_person: '',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        country: '',
                        postal_code: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </div>
            </form>

            {/* Suppliers List */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Suppliers</h2>
                <div className="ml-auto">
                  <input
                    type="search"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : suppliers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No suppliers found</div>
                ) : (
                  suppliers
                    .filter(s => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (s.supplier_name || '').toLowerCase().includes(q) || String(s.supplier_id).includes(q);
                    })
                    .map(supplier => (
                      <div key={supplier.supplier_id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{supplier.supplier_name}</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(supplier)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(supplier)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            {supplier.contacts?.map((contact, index) => {
                              const contactType = contactTypes.find(
                                type => type.contact_type_code === contact.contact_type_code
                              );
                              return (
                                <p key={index}>
                                  {contactType?.description}: {contact.contact_value}
                                  {contact.is_primary === 'Y' && (
                                    <span className="ml-2 text-xs text-blue-600">(Primary)</span>
                                  )}
                                </p>
                              );
                            })}
                          </div>
                          {supplier.addresses?.length > 0 && (
                            <div>
                              <p>
                                {supplier.addresses[0].address_line1}<br />
                                {supplier.addresses[0].city}, {supplier.addresses[0].state}<br />
                                {supplier.addresses[0].country} {supplier.addresses[0].postal_code}
                              </p>
                            </div>
                          )}
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

export default SupplierManagement;