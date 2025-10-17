import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

const ProfileSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    role: 'manager',
    birthday: '',
    contacts: [
      { type: 'email', value: 'john@bikeshoppro.com', primary: true },
      { type: 'tel', value: '', primary: false },
      { type: 'mobile', value: '', primary: false },
      { type: 'facebook', value: '', primary: false },
    ],
  });

  const updateContact = (index, field, value) => {
    setProfile(prev => {
      const updated = [...prev.contacts];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'primary' && value) {
        // ensure single primary
        return { ...prev, contacts: updated.map((c, i) => ({ ...c, primary: i === index })) };
      }
      return { ...prev, contacts: updated };
    });
  };

  const handleSave = () => {
    console.log('Saved profile', profile);
    alert('Profile saved (mock).');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-5xl">
          <Breadcrumb />
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Profile Settings</h1>
          <p className="font-body text-muted-foreground mb-6">Manage your general information.</p>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    className="w-full bg-input border border-border rounded-lg px-3 py-2"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    className="w-full bg-input border border-border rounded-lg px-3 py-2"
                    value={profile.role}
                    onChange={e => setProfile({ ...profile, role: e.target.value })}
                  >
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="sales_attendant">Sales Attendant</option>
                    <option value="bicycle_mechanic">Bicycle Mechanic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Birthday</label>
                  <input
                    type="date"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2"
                    value={profile.birthday}
                    onChange={e => setProfile({ ...profile, birthday: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.contacts.map((c, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <select
                      className="bg-input border border-border rounded-lg px-3 py-2"
                      value={c.type}
                      onChange={e => updateContact(i, 'type', e.target.value)}
                    >
                      <option value="email">Email</option>
                      <option value="tel">Tel. No.</option>
                      <option value="mobile">Mobile</option>
                      <option value="facebook">Facebook</option>
                    </select>
                    <input
                      className="flex-1 bg-input border border-border rounded-lg px-3 py-2"
                      placeholder={c.type === 'email' ? 'name@example.com' : 'Enter value'}
                      value={c.value}
                      onChange={e => updateContact(i, 'value', e.target.value)}
                    />
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={c.primary}
                        onChange={e => updateContact(i, 'primary', e.target.checked)}
                      />
                      <span>Primary</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;


