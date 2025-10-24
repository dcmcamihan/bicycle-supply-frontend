import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import API_ENDPOINTS from '../../config/api';

const ProfileSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    birthday: '',
    contacts: [
      { type: 'email', value: '', primary: true },
      { type: 'tel', value: '', primary: false },
      { type: 'mobile', value: '', primary: false },
      { type: 'facebook', value: '', primary: false },
    ],
  });

  const [employee, setEmployee] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleHistory, setRoleHistory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role || 'Employee',
      }));
    }
  }, [user]);

  // Fetch employee-related data
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const empRes = await fetch(API_ENDPOINTS.EMPLOYEE(user.id));
        const emp = empRes.ok ? await empRes.json() : null;
        setEmployee(emp);

        const [contactsRes, rolesRes, roleHistRes, attnRes, attnDetRes] = await Promise.all([
          fetch(API_ENDPOINTS.EMPLOYEE_CONTACTS),
          fetch(API_ENDPOINTS.EMPLOYEE_ROLES_BY_EMPLOYEE(user.id)),
          fetch(API_ENDPOINTS.EMPLOYEE_ROLE_HISTORIES),
          fetch(API_ENDPOINTS.EMPLOYEE_ATTENDANCES),
          fetch(API_ENDPOINTS.ATTENDANCE_DETAILS),
        ]);
        const allContacts = contactsRes.ok ? await contactsRes.json() : [];
        setContacts(allContacts.filter(c => c.employee_id === user.id));
        const r = rolesRes.ok ? await rolesRes.json() : [];
        setRoles(r);
        const rh = roleHistRes.ok ? await roleHistRes.json() : [];
        setRoleHistory(rh.filter(h => h.employee_id === user.id));
        const at = attnRes.ok ? await attnRes.json() : [];
        const atMine = at.filter(a => a.employee_id === user.id);
        setAttendance(atMine);
        const ad = attnDetRes.ok ? await attnDetRes.json() : [];
        // Map details by attendance_id of current employee only
        setAttendanceDetails(ad.filter(d => atMine.some(a => a.attendance_id === d.attendance_id)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const metrics = useMemo(() => {
    const presentDays = attendance?.length || 0;
    const lastAttendance = attendance?.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]?.date || null;
    return {
      presentDays,
      lastAttendance,
      rolesCount: roles?.length || 0,
      contactsCount: contacts?.length || 0,
    };
  }, [attendance, roles, contacts]);

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
    // For now, implement only UI save hook; backend updates can be added per-field
    setEditing(false);
    alert('Profile saved. (Back-end update per field can be wired next)');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-15 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 max-w-5xl">
          <Breadcrumb />
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-heading font-bold text-2xl text-foreground">Profile Settings</h1>
            <div className="space-x-2">
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              )}
            </div>
          </div>
          <p className="font-body text-muted-foreground mb-6">View and manage your employee information.</p>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold mb-4">General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.first_name || ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.last_name || ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Middle Name</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.middle_name || ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.gender || ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Birth Date</label>
                  <input type="date" className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.birth_date ? String(employee.birth_date).substring(0,10) : ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.username || ''} disabled={!editing} onChange={()=>{}} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <input className="w-full bg-input border border-border rounded-lg px-3 py-2" value={employee?.employee_status || ''} disabled={!editing} onChange={()=>{}} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <input className="w-28 bg-input border border-border rounded-lg px-3 py-2" value={c.contact_type_code} disabled />
                    <input className="flex-1 bg-input border border-border rounded-lg px-3 py-2" value={c.contact_value} disabled={!editing} onChange={()=>{}} />
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={c.is_primary === 'Y'} disabled={!editing} onChange={()=>{}} />
                      <span>Primary</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Roles</h2>
              <div className="space-y-2">
                {roles.length === 0 ? <p className="text-sm text-muted-foreground">No roles assigned.</p> : roles.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{r.role_type_code}</span>
                    <span className="text-muted-foreground">{r.specialization || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Role History</h2>
              <div className="space-y-2">
                {roleHistory.length === 0 ? <p className="text-sm text-muted-foreground">No role history.</p> : roleHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{h.role_type}</span>
                    <span className="text-muted-foreground">{h.date_effectivity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Attendance</h2>
              <div className="space-y-3">
                {attendance.length === 0 ? <p className="text-sm text-muted-foreground">No attendance records.</p> : attendance.map((a) => (
                  <div key={a.attendance_id} className="border border-border rounded-md">
                    <div className="px-3 py-2 flex items-center justify-between bg-muted">
                      <span className="text-sm">{a.date}</span>
                      <span className="text-xs text-muted-foreground">{a.attendance_status}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {attendanceDetails.filter(d => d.attendance_id === a.attendance_id).map(d => (
                        <div key={d.attendance_detail_id} className="px-3 py-2 text-sm flex items-center justify-between">
                          <span>Time In: {d.time_in}</span>
                          <span>Time Out: {d.time_out}</span>
                          <span className="text-muted-foreground">{d.remarks || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">Present Days</p>
                  <p className="text-xl font-semibold">{metrics.presentDays}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Attendance</p>
                  <p className="text-xl font-semibold">{metrics.lastAttendance ? new Date(metrics.lastAttendance).toLocaleDateString() : '-'}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">Roles</p>
                  <p className="text-xl font-semibold">{metrics.rolesCount}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">Contacts</p>
                  <p className="text-xl font-semibold">{metrics.contactsCount}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              ) : (
                <Button onClick={handleSave}>Save Changes</Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;


