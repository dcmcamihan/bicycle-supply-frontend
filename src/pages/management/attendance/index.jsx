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
      const attResponse = await fetch(API_ENDPOINTS.EMPLOYEE_ATTENDANCE);
      const attData = await attResponse.json();
      // Normalize backend fields to what the UI expects:
      // backend may return { date, attendance_status } or { attendance_date, status }
      const normalized = (attData || []).map(rec => {
        const attendance_date = rec.attendance_date || rec.date || rec.created_at || '';
        const status = rec.status || rec.attendance_status || rec.attendance_status_code || '';
        return { ...rec, attendance_date, status };
      });

      // Filter attendance for selected date (compare YYYY-MM-DD)
      const filteredData = normalized.filter(att => {
        if (!att.attendance_date) return false;
        return att.attendance_date.split('T')[0] === date;
      });
      setAttendance(filteredData);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast?.error('Failed to load attendance');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create attendance record
      const response = await fetch(API_ENDPOINTS.EMPLOYEE_ATTENDANCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
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
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time In</label>
                  <input
                    type="time"
                    value={formData.time_in}
                    onChange={(e) => setFormData({...formData, time_in: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Out</label>
                  <input
                    type="time"
                    value={formData.time_out}
                    onChange={(e) => setFormData({...formData, time_out: e.target.value})}
                    className="w-full p-2 border rounded"
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
                              <p>Time In: {record.time_in}</p>
                              {record.time_out && <p>Time Out: {record.time_out}</p>}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded text-sm ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {record.status}
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