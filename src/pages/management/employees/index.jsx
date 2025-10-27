import React, { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [contactTypes, setContactTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();
  const formRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    birth_date: '',
    // contact list (use contact types from contact_types table)
    contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
    role_id: '', // stores role_type_code from role-types API
    // addresses/emergency removed; use contacts array instead
  });

  // Fetch employees, roles and contact types
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empResponse, roleResponse, contactTypesRes] = await Promise.all([
          fetch(API_ENDPOINTS.EMPLOYEES),
          fetch(API_ENDPOINTS.EMPLOYEE_ROLES),
          fetch(API_ENDPOINTS.CONTACT_TYPES)
        ]);

        const empData = await empResponse.json();
        const roleData = await roleResponse.json();
        const contactTypes = await contactTypesRes.json();

  setEmployees(empData);
  // role types endpoint returns objects like { role_type_code, description }
  setRoles(roleData);
        // store contact types for select options
        setContactTypes(contactTypes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast?.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEmployee 
        ? API_ENDPOINTS.EMPLOYEE(editingEmployee.employee_id)
        : API_ENDPOINTS.EMPLOYEES;
      
      const method = editingEmployee ? 'PUT' : 'POST';
      
      // Create employee
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          birth_date: formData.birth_date || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save employee');
      }

      const savedEmployee = await response.json();
      const employeeId = savedEmployee.employee_id;

      // Create/update employee role history
      if (formData.role_id) {
        await fetch(API_ENDPOINTS.EMPLOYEE_ROLE_HISTORIES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employee_id: employeeId,
            role_type: formData.role_id, // backend expects role_type
            date_effectivity: new Date().toISOString().split('T')[0]
          }),
        });
      }

      // Replace existing contacts for edited employee
      if (editingEmployee) {
        try {
          const existingRes = await fetch(API_ENDPOINTS.EMPLOYEE_CONTACTS_BY_EMPLOYEE(employeeId));
          const existing = await existingRes.json();
          await Promise.all(existing.map(c => fetch(`${API_ENDPOINTS.EMPLOYEE_CONTACTS}/${c.employee_contact_id}`, { method: 'DELETE' })));
        } catch (err) {
          console.warn('Failed to clear existing contacts', err);
        }
      }

      // Save contacts
      const contactPromises = formData.contacts
        .filter(c => c.contact_type_code && c.contact_value)
        .map(contact => {
          const payload = {
            employee_id: employeeId,
            contact_type_code: contact.contact_type_code,
            contact_value: contact.contact_value,
            is_active: 'Y',
            is_primary: contact.is_primary
          };

          return fetch(API_ENDPOINTS.EMPLOYEE_CONTACTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        });

      await Promise.all(contactPromises);

      // Refresh employees list
      const empRes = await fetch(API_ENDPOINTS.EMPLOYEES);
      const newEmployees = await empRes.json();
      setEmployees(newEmployees);

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        gender: 'M',
        birth_date: '',
        contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        role_id: ''
      });
      setEditingEmployee(null);

      toast?.success(editingEmployee ? 'Employee updated successfully' : 'Employee created successfully');
    } catch (error) {
      console.error('Failed to save employee:', error);
      toast?.error('Failed to save employee');
    }
  };

  const handleEdit = async (employee) => {
    setEditingEmployee(employee);
    try {
      // Fetch employee contacts
      const contactsRes = await fetch(API_ENDPOINTS.EMPLOYEE_CONTACTS_BY_EMPLOYEE(employee.employee_id));
      const contacts = await contactsRes.json();

      // Fetch current role
      const roleHistoryRes = await fetch(API_ENDPOINTS.EMPLOYEE_ROLE_HISTORIES_BY_EMPLOYEE(employee.employee_id));
      const roleHistory = await roleHistoryRes.json();
      const currentRole = roleHistory[roleHistory.length - 1];

      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        gender: employee.gender || 'M',
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
        contacts: contacts.length > 0 ? contacts.map(c => ({
          contact_type_code: c.contact_type_code,
          contact_value: c.contact_value,
          is_primary: c.is_primary
        })) : [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        role_id: currentRole?.role_type || ''
      });
      // scroll the form into view and focus first input when editing starts
      setTimeout(() => {
        if (formRef.current) {
          try { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){}
          const first = formRef.current.querySelector('input, select, textarea');
          if (first) first.focus();
        }
      }, 120);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        gender: employee.gender || 'M',
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
        contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
        role_id: ''
      });
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.EMPLOYEE(employee.employee_id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setEmployees(employees.filter(e => e.employee_id !== employee.employee_id));
      toast?.success('Employee deleted successfully');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast?.error('Failed to delete employee');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

            {/* Employee Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              {editingEmployee && (
                <div className="mb-4 p-3 rounded border-l-4 border-yellow-400 bg-yellow-50 text-sm flex items-center justify-between">
                  <div>
                    <strong>Editing:</strong> {editingEmployee.first_name} {editingEmployee.last_name}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">You are editing this employee</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Birthdate</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Contacts section (email, phone, etc.) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Contacts</label>
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

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.role_type_code} value={role.role_type_code}>
                        {role.description || role.role_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* address and emergency fields removed; use contacts instead */}
              </div>

              <div className="flex justify-end gap-2">
                {editingEmployee && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingEmployee(null);
                      setFormData({
                        first_name: '',
                        last_name: '',
                        gender: 'M',
                        birth_date: '',
                        contacts: [{ contact_type_code: '', contact_value: '', is_primary: 'Y' }],
                        role_id: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </form>

            {/* Employees List */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Employees</h2>
                <div className="ml-auto">
                  <input
                    type="search"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : employees.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No employees found</div>
                ) : (
                  // filter locally by name or id
                  employees
                    .filter(emp => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
                      return fullName.includes(q) || String(emp.employee_id).includes(q);
                    })
                    .map(employee => (
                      <div key={employee.employee_id} className={`p-4 ${editingEmployee && editingEmployee.employee_id === employee.employee_id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(employee)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {employee.contacts && employee.contacts.length > 0 ? (
                            employee.contacts.map((c, i) => {
                              const type = contactTypes.find(t => t.contact_type_code === c.contact_type_code);
                              return (
                                <p key={i}>
                                  {type?.description || c.contact_type_code}: {c.contact_value} {c.is_primary === 'Y' ? '(Primary)' : ''}
                                </p>
                              );
                            })
                          ) : (
                            <p>No contacts</p>
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

export default EmployeeManagement;