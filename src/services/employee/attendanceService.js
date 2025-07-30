import api from '/src/api/api.js';

/**
 * Attendance Service (Employee)
 * Handles all attendance operations for employees
 */

// Check in
export const checkIn = async () => {
  try {
    const response = await api.post('/attendance/checkin');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Check out
export const checkOut = async () => {
  try {
    const response = await api.put('/attendance/checkout', { date: new Date() });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my attendance
export const getMyAttendance = async (dateRange = null) => {
  try {
    const params = dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    const response = await api.get('/attendance/me', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get today's attendance
export const getTodayAttendance = async () => {
  try {
    const response = await api.get('/attendance/me/today');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance status
export const getAttendanceStatus = async () => {
  try {
    const response = await api.get('/attendance/me/status');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance statistics
export const getMyAttendanceStats = async (dateRange = null) => {
  try {
    const params = dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    const response = await api.get('/attendance/me/stats', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get attendance history
export const getAttendanceHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/attendance/me/history', {
      params: { page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 