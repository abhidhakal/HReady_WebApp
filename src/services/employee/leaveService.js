import api from '/src/api/api.js';

/**
 * Leave Service (Employee)
 * Handles all leave operations for employees
 */

// Get my leaves
export const getMyLeaves = async (filters = {}) => {
  try {
    const response = await api.get('/leaves/my', { params: filters });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave by ID
export const getMyLeaveById = async (leaveId) => {
  try {
    const response = await api.get(`/leaves/my/${leaveId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Apply for leave
export const applyForLeave = async (leaveData) => {
  try {
    const response = await api.post('/leaves', leaveData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update my leave request
export const updateMyLeave = async (leaveId, leaveData) => {
  try {
    const response = await api.put(`/leaves/my/${leaveId}`, leaveData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Cancel my leave request
export const cancelMyLeave = async (leaveId) => {
  try {
    const response = await api.patch(`/leaves/my/${leaveId}/cancel`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my leave balance
export const getMyLeaveBalance = async () => {
  try {
    const response = await api.get('/leaves/my/balance');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get pending leaves
export const getMyPendingLeaves = async () => {
  try {
    const response = await api.get('/leaves/my', { params: { status: 'pending' } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get approved leaves
export const getMyApprovedLeaves = async () => {
  try {
    const response = await api.get('/leaves/my', { params: { status: 'approved' } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get rejected leaves
export const getMyRejectedLeaves = async () => {
  try {
    const response = await api.get('/leaves/my', { params: { status: 'rejected' } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get leave history
export const getLeaveHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/leaves/my/history', {
      params: { page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 