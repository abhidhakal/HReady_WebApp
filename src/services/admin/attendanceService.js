import api from '/src/api/api.js';

/**
 * Attendance Service (Admin)
 * Handles all attendance management operations for admins
 */

// Get all attendance records (matches AdminAttendance.jsx)
export const getAllAttendance = async () => {
  try {
    const response = await api.get('/attendance/all');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my attendance (admin's own attendance)
export const getAdminAttendance = async () => {
  try {
    const response = await api.get('/attendance/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Admin check in (matches AdminAttendance.jsx)
export const adminCheckIn = async () => {
  try {
    const response = await api.post('/attendance/checkin', {});
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Admin check out (matches AdminAttendance.jsx)
export const adminCheckOut = async () => {
  try {
    const response = await api.put('/attendance/checkout', { date: new Date() });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance by date range
export const getAttendanceByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/attendance', {
      params: { startDate, endDate }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance statistics
export const getAttendanceStats = async (dateRange = null) => {
  try {
    const params = dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    const response = await api.get('/attendance/stats', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance for specific employee
export const getEmployeeAttendance = async (employeeId, dateRange = null) => {
  try {
    const params = dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    const response = await api.get(`/attendance/employee/${employeeId}`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Manually add attendance record
export const addAttendanceRecord = async (attendanceData) => {
  try {
    const response = await api.post('/attendance', attendanceData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update attendance record
export const updateAttendanceRecord = async (attendanceId, attendanceData) => {
  try {
    const response = await api.put(`/attendance/${attendanceId}`, attendanceData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete attendance record
export const deleteAttendanceRecord = async (attendanceId) => {
  try {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance report
export const getAttendanceReport = async (reportType, filters = {}) => {
  try {
    const response = await api.get(`/attendance/report/${reportType}`, { params: filters });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Export attendance data
export const exportAttendanceData = async (format = 'csv', filters = {}) => {
  try {
    const response = await api.get(`/attendance/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get late arrivals
export const getLateArrivals = async (date, threshold = '09:00') => {
  try {
    const response = await api.get('/attendance/late-arrivals', {
      params: { date, threshold }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get early departures
export const getEarlyDepartures = async (date, threshold = '17:00') => {
  try {
    const response = await api.get('/attendance/early-departures', {
      params: { date, threshold }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 