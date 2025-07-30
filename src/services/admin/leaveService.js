import api from '/src/api/api.js';

/**
 * Leave Service (Admin)
 * Handles all leave management operations for admins
 */

// Get all leave requests (matches AdminLeaves.jsx)
export const getAllLeaves = async () => {
  try {
    const response = await api.get('/leaves/all');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave by ID
export const getLeaveById = async (leaveId) => {
  try {
    const response = await api.get(`/leaves/${leaveId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update leave status (matches AdminLeaves.jsx pattern)
export const updateLeaveStatus = async (leaveId, status) => {
  try {
    const response = await api.put(`/leaves/${leaveId}/status`, { status });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create leave for employee (admin only - matches AdminLeaves.jsx)
export const createLeaveForEmployee = async (leaveData) => {
  try {
    const payload = new FormData();
    payload.append('leaveType', leaveData.leaveType);
    payload.append('startDate', leaveData.startDate);
    payload.append('endDate', leaveData.endDate);
    payload.append('reason', leaveData.reason);
    payload.append('halfDay', leaveData.halfDay);
    if (leaveData.attachment) {
      payload.append('attachment', leaveData.attachment);
    }

    const response = await api.post('/leaves/admin', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Approve leave request (alternative method)
export const approveLeave = async (leaveId, adminComment = '') => {
  try {
    const response = await api.patch(`/leaves/${leaveId}/approve`, {
      adminComment
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Reject leave request (alternative method)
export const rejectLeave = async (leaveId, adminComment = '') => {
  try {
    const response = await api.patch(`/leaves/${leaveId}/reject`, {
      adminComment
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update leave request
export const updateLeave = async (leaveId, leaveData) => {
  try {
    const response = await api.put(`/leaves/${leaveId}`, leaveData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete leave request
export const deleteLeave = async (leaveId) => {
  try {
    const response = await api.delete(`/leaves/${leaveId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave statistics
export const getLeaveStats = async (dateRange = null) => {
  try {
    const params = dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    const response = await api.get('/leaves/stats', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leaves by employee
export const getLeavesByEmployee = async (employeeId) => {
  try {
    const response = await api.get(`/leaves/employee/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get pending leave requests
export const getPendingLeaves = async () => {
  try {
    const response = await api.get('/leaves', { params: { status: 'pending' } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get approved leaves
export const getApprovedLeaves = async (dateRange = null) => {
  try {
    const params = { status: 'approved' };
    if (dateRange) {
      params.startDate = dateRange.start;
      params.endDate = dateRange.end;
    }
    const response = await api.get('/leaves', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get rejected leaves
export const getRejectedLeaves = async () => {
  try {
    const response = await api.get('/leaves', { params: { status: 'rejected' } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave balance for employee
export const getLeaveBalance = async (employeeId) => {
  try {
    const response = await api.get(`/leaves/balance/${employeeId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update leave balance for employee
export const updateLeaveBalance = async (employeeId, balanceData) => {
  try {
    const response = await api.put(`/leaves/balance/${employeeId}`, balanceData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave report
export const getLeaveReport = async (reportType, filters = {}) => {
  try {
    const response = await api.get(`/leaves/report/${reportType}`, { params: filters });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 