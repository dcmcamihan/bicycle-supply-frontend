import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    time_in: '',
    time_out: '',
    status: 'PRESENT'
  });

  // Fetch employees and attendance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const empResponse = await fetch(API_ENDPOINTS.EMPLOYEES);
        const empData = await empResponse.json();
        setEmployees(empData);

        // Fetch all statuses (more reliable than assuming a specific reference exists)
        try {
          const allRes = await fetch(API_ENDPOINTS.STATUSES);
          if (allRes.ok) {
            const allData = await allRes.json();
            setStatuses(allData || []);
          } else {
            setStatuses([]);
          }
        } catch (err) {
          console.warn('Failed to load statuses', err);
          setStatuses([]);
        }

        // Fetch attendance for selected date
        await fetchAttendance(selectedDate);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast?.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const fetchAttendance = async (date) => {
    try {
      // Fetch employee attendance and attendance details so we can display time_in/time_out
      const [attResponse, detailsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.EMPLOYEE_ATTENDANCE),
        fetch(API_ENDPOINTS.ATTENDANCE_DETAILS)
      ]);

      const attData = await attResponse.json();
      const detailsData = await detailsResponse.json();

      // map details by attendance_id for quick lookup
      const detailsByAttendance = (detailsData || []).reduce((acc, d) => {
        acc[d.attendance_id] = d;
        return acc;
      }, {});

      const normalized = (attData || []).map(att => {
        const rawDate = att.attendance_date || att.date || null;
        const attendance_date = rawDate ? (
          String(rawDate).split('T')[0]
        ) : null;
        const det = detailsByAttendance[att.attendance_id];
        return {
          attendance_id: att.attendance_id,
          employee_id: att.employee_id,
          attendance_date,
          status: att.status || att.attendance_status,
          time_in: det ? det.time_in : null,
          time_out: det ? det.time_out : null
        };
      });

      const filtered = normalized.filter(att => att.attendance_date === date);
      setAttendance(filtered);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast?.error('Failed to load attendance');
    }
  };

  const getStatusLabel = (code) => {
    if (!code) return code;
    // Try finding by status_code first
    let s = (statuses || []).find(st => String(st.status_code) === String(code));
    if (s) return s.description;

    // Try finding by description (some backends might already return description value)
    s = (statuses || []).find(st => String(st.description).toLowerCase() === String(code).toLowerCase());
    if (s) return s.description;

    // Fallback: humanize common literals or convert snake/caps to friendly text
    const upper = String(code).toUpperCase();
    if (upper === 'PRESENT' || upper === 'P') return 'Present';
    if (upper === 'ABSENT' || upper === 'A') return 'Absent';
    if (upper === 'LATE' || upper === 'L') return 'Late';
    if (upper === 'HALF_DAY' || upper === 'HALF' || upper === 'H') return 'Half Day';

    // Last resort: convert underscores/dashes to spaces and capitalize
    const human = String(code).replace(/[_-]+/g, ' ').toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase());
    return human;
  };

  const statusColorClass = (labelOrCode) => {
    const label = String(getStatusLabel(labelOrCode)).toLowerCase();
    if (label.includes('present')) return 'bg-green-100 text-green-800';
    if (label.includes('absent')) return 'bg-red-100 text-red-800';
    if (label.includes('late')) return 'bg-yellow-100 text-yellow-800';
    if (label.includes('half')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create attendance record
      // Map to backend expected fields: date, attendance_status
      const payload = {
        employee_id: formData.employee_id,
        date: formData.attendance_date,
        attendance_status: formData.status
      };

      const response = await fetch(API_ENDPOINTS.EMPLOYEE_ATTENDANCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      const saved = await response.json();
      const attendanceId = saved.attendance_id;

      // If the status is not ABSENT, attempt to save attendance details (time_in/time_out)
      if (formData.status !== 'ABSENT') {
        // Require both time_in and time_out when saving details since DB expects TIME not null
        if (!formData.time_in || !formData.time_out) {
          // If missing time_out, default to time_in to avoid DB NOT NULL issues
          const t_in = formData.time_in || '00:00:00';
          const t_out = formData.time_out || t_in;
          await fetch(API_ENDPOINTS.ATTENDANCE_DETAILS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendance_id: attendanceId, time_in: t_in, time_out: t_out, remarks: null })
          });
        } else {
          await fetch(API_ENDPOINTS.ATTENDANCE_DETAILS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendance_id: attendanceId, time_in: formData.time_in, time_out: formData.time_out, remarks: null })
          });
        }
      }

  // Refresh attendance list
  await fetchAttendance(selectedDate);

      // Reset form except for date
      setFormData({
        employee_id: '',
        attendance_date: formData.attendance_date,
        time_in: '',
        time_out: '',
        status: 'PRESENT'
      });

      toast?.success('Attendance recorded successfully');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast?.error('Failed to save attendance');
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      attendance_date: date
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`pt-16 transition-smooth ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>

            {/* Date Selection */}
            <div className="bg-card p-4 rounded-lg border border-border mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Form */}
            <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <h2 className="text-lg font-semibold mb-4">Record Attendance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {statuses && statuses.length > 0 ? (
                      statuses.map(s => (
                        <option key={s.status_code} value={s.status_code}>{s.description}</option>
                      ))
                    ) : (
                      <>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="HALF_DAY">Half Day</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time In</label>
                  <input
                    type="time"
                    value={formData.time_in}
                    onChange={(e) => setFormData({...formData, time_in: e.target.value})}
                    className="w-full p-2 border rounded"
                    required={formData.status !== 'ABSENT'}
                    disabled={formData.status === 'ABSENT'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Out</label>
                  <input
                    type="time"
                    value={formData.time_out}
                    onChange={(e) => setFormData({...formData, time_out: e.target.value})}
                    className="w-full p-2 border rounded"
                    required={formData.status !== 'ABSENT'}
                    disabled={formData.status === 'ABSENT'}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Record Attendance</Button>
              </div>
            </form>

            {/* Attendance List */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Daily Attendance</h2>
              </div>
              
              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : attendance.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No attendance records found for this date</div>
                ) : (
                  attendance.map(record => {
                    const employee = employees.find(emp => emp.employee_id === record.employee_id);
                    return (
                      <div key={record.attendance_id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {employee ? `${employee.first_name} ${employee.last_name}` : `Employee #${record.employee_id}`}
                            </h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              <p>Status: {record.status}</p>
                              <p>Time In: {record.time_in ? record.time_in : '—'}</p>
                              <p>Time Out: {record.time_out ? record.time_out : '—'}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded text-sm ${statusColorClass(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagement;